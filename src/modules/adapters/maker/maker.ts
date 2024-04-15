import BigNumber from 'bignumber.js';
import { decodeAbiParameters, decodeEventLog } from 'viem';

import Erc20Abi from '../../../configs/abi/ERC20.json';
import AuthGemJoinAbi from '../../../configs/abi/maker/AuthGemJoin.json';
import DogAbi from '../../../configs/abi/maker/Dog.json';
import GemJoinAbi from '../../../configs/abi/maker/GemJoin.json';
import JugAbi from '../../../configs/abi/maker/Jug.json';
import PotAbi from '../../../configs/abi/maker/Pot.json';
import SpotAbi from '../../../configs/abi/maker/Spot.json';
import VatAbi from '../../../configs/abi/maker/Vat.json';
import { SolidityUnits, TimeUnits } from '../../../configs/constants';
import { MakerDataExtended, MakerLendingMarketConfig } from '../../../configs/protocols/maker';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ActivityActions } from '../../../types/base';
import { ProtocolConfig, Token } from '../../../types/configs';
import {
  CdpLendingActivityEvent,
  CdpLendingAssetDataState,
  CdpLendingAssetDataTimeframe,
} from '../../../types/domains/cdpLending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import {
  GetAdapterDataStateOptions,
  GetAdapterDataTimeframeOptions,
  TransformEventLogOptions,
  TransformEventLogResult,
} from '../../../types/options';
import { AdapterGetEventLogsOptions } from '../adapter';
import CdpLendingProtocolAdapter from '../cdpLending';
import { MakerEventInterfaces, MakerEventSignatures } from './abis';

export default class MakerAdapter extends CdpLendingProtocolAdapter {
  public readonly name: string = 'adapter.maker';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.abiConfigs.eventSignatures = MakerEventSignatures;
    this.abiConfigs.eventAbis = {
      gemJoin: GemJoinAbi,
      authGemJoin: AuthGemJoinAbi,
      vat: VatAbi,
      spot: SpotAbi,
      pot: PotAbi,
      jug: JugAbi,
      dog: DogAbi,
    };
  }

  public async getLendingAssetDataState(options: GetAdapterDataStateOptions): Promise<CdpLendingAssetDataState | null> {
    const blockNumber = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.timestamp,
    );

    const marketConfig: MakerLendingMarketConfig = options.config as MakerLendingMarketConfig;
    const debtToken = marketConfig.debtToken as Token;

    // get total debt
    const [debt, jugBase, dsr] = await this.services.blockchain.multicall({
      chain: marketConfig.chain,
      calls: [
        {
          abi: this.abiConfigs.eventAbis.vat,
          target: marketConfig.vat,
          method: 'debt',
          params: [],
        },
        {
          abi: this.abiConfigs.eventAbis.jug,
          target: marketConfig.jug,
          method: 'base',
          params: [],
        },
        {
          abi: this.abiConfigs.eventAbis.pot,
          target: marketConfig.pot,
          method: 'dsr',
          params: [],
        },
      ],
      blockNumber: blockNumber,
    });

    const debtTokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: debtToken.chain,
      address: debtToken.address,
      timestamp: options.timestamp,
    });

    const totalSupply = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: Erc20Abi,
      target: marketConfig.debtToken.address,
      method: 'totalSupply',
      params: [],
      blockNumber: blockNumber,
    });

    const stateData: CdpLendingAssetDataState = {
      protocol: options.config.protocol,
      chain: options.config.chain,
      metric: options.config.metric,
      timestamp: options.timestamp,
      token: marketConfig.debtToken,
      tokenPrice: debtTokenPrice ? debtTokenPrice : '0',
      totalBorrowed: formatBigNumberToString(debt.toString(), SolidityUnits.RadDecimals),
      totalSupply: formatBigNumberToString(totalSupply.toString(), debtToken.decimals),
      collaterals: [],
      extended: {
        daiSavingRate: formatBigNumberToString(dsr.toString(), SolidityUnits.RayDecimals),
      } as MakerDataExtended,
    };

    for (const gemConfig of marketConfig.gems) {
      if (gemConfig.birthday <= options.timestamp) {
        const collateralTokenPrice = await this.services.oracle.getTokenPriceUsd({
          chain: marketConfig.chain,
          address: gemConfig.collateralToken.address,
          timestamp: options.timestamp,
        });

        const gemBalance = await this.services.blockchain.readContract({
          chain: marketConfig.chain,
          abi: Erc20Abi,
          target: gemConfig.collateralToken.address,
          method: 'balanceOf',
          params: [gemConfig.address],
          blockNumber: blockNumber,
        });

        if (collateralTokenPrice && gemBalance) {
          const [vatInfo, spotInfo, jugInfo] = await this.services.blockchain.multicall({
            chain: marketConfig.chain,
            blockNumber: blockNumber,
            calls: [
              {
                abi: this.abiConfigs.eventAbis.vat,
                target: marketConfig.vat,
                method: 'ilks',
                params: [gemConfig.ilk],
              },
              {
                abi: this.abiConfigs.eventAbis.spot,
                target: marketConfig.spot,
                method: 'ilks',
                params: [gemConfig.ilk],
              },
              {
                abi: this.abiConfigs.eventAbis.jug,
                target: marketConfig.jug,
                method: 'ilks',
                params: [gemConfig.ilk],
              },
            ],
          });

          const art = new BigNumber(vatInfo[0].toString());
          const rate = new BigNumber(vatInfo[1].toString());
          const spot = new BigNumber(spotInfo[1].toString());

          // spot is the collateral ratio borrowers must maintain to avoid liquidation
          // for example 145%
          // so, the loan to value = 100 % / 145% = 68.96%
          const loanToValue = new BigNumber(100)
            .multipliedBy(SolidityUnits.OneRay)
            .dividedBy(new BigNumber(spot))
            .dividedBy(100);
          const totalBorrowed = formatBigNumberToString(
            art.multipliedBy(rate).toString(10),
            SolidityUnits.RayDecimals + debtToken.decimals,
          );
          const totalDeposited = formatBigNumberToString(gemBalance.toString(), gemConfig.collateralToken.decimals);

          // https://docs.makerdao.com/smart-contract-modules/rates-module/jug-detailed-documentation
          const duty = new BigNumber(jugInfo[0].toString()).dividedBy(SolidityUnits.OneRay);
          const base = new BigNumber(jugBase.toString()).dividedBy(SolidityUnits.OneRay);
          const elapsed = 3600;

          const deltaRate = duty
            .plus(base)
            .pow(elapsed)
            .multipliedBy(rate.dividedBy(SolidityUnits.OneRay))
            .minus(rate.dividedBy(SolidityUnits.OneRay));

          const interestAmount = art.multipliedBy(deltaRate.multipliedBy(TimeUnits.SecondsPerYear).dividedBy(elapsed));

          const borrowRate = art.eq(0) ? new BigNumber(0) : interestAmount.dividedBy(art);

          stateData.collaterals.push({
            protocol: options.config.protocol,
            chain: options.config.chain,
            metric: options.config.metric,
            timestamp: options.timestamp,
            token: gemConfig.collateralToken,
            tokenPrice: collateralTokenPrice ? collateralTokenPrice : '',
            address: gemConfig.address,
            totalDeposited: totalDeposited,
            totalBorrowed: totalBorrowed,
            rateBorrow: borrowRate.toString(10),
            rateBorrowFee: '0',
            rateLoanToValue: loanToValue.toString(10),
          });
        }
      }
    }

    return stateData;
  }

  public async getEventLogs(options: AdapterGetEventLogsOptions): Promise<Array<any>> {
    const makerConfig = options.metricConfig as MakerLendingMarketConfig;

    // get events from dai join
    let logs = await this.services.blockchain.getContractLogs({
      chain: makerConfig.chain,
      address: makerConfig.daiJoin,
      fromBlock: options.fromBlock,
      toBlock: options.toBlock,
    });

    // get events from gem joins
    for (const gemConfig of makerConfig.gems) {
      logs = logs.concat(
        await this.services.blockchain.getContractLogs({
          chain: makerConfig.chain,
          address: gemConfig.address,
          fromBlock: options.fromBlock,
          toBlock: options.toBlock,
        }),
      );
    }

    logs = logs.concat(
      await this.services.blockchain.getContractLogs({
        chain: makerConfig.chain,
        address: makerConfig.dog,
        fromBlock: options.fromBlock,
        toBlock: options.toBlock,
      }),
    );

    return logs;
  }

  public async transformEventLogs(options: TransformEventLogOptions): Promise<TransformEventLogResult> {
    const result: TransformEventLogResult = {
      activities: [],
    };

    const eventSignatures: MakerEventInterfaces = this.abiConfigs.eventSignatures;
    const marketConfig: MakerLendingMarketConfig = options.config as MakerLendingMarketConfig;
    const debtToken = marketConfig.debtToken as Token;

    for (const log of options.logs) {
      const signature = log.topics[0];
      const address = normalizeAddress(log.address);

      if (
        signature === eventSignatures.Join ||
        signature === eventSignatures.PsmJoin ||
        signature === eventSignatures.Exit
      ) {
        const user = normalizeAddress(decodeAbiParameters([{ type: 'address' }], log.topics[1])[0].toString());
        const rawAmount = decodeAbiParameters([{ type: 'uint256' }], log.topics[3])[0].toString();

        if (compareAddress(address, marketConfig.daiJoin)) {
          // borrow/repay DAI
          const amount = formatBigNumberToString(rawAmount, debtToken.decimals);
          const action = signature === eventSignatures.Join ? ActivityActions.repay : ActivityActions.borrow;
          result.activities.push({
            chain: marketConfig.chain,
            protocol: options.config.protocol,
            address: address,
            transactionHash: log.transactionHash,
            logIndex: log.logIndex.toString(),
            blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
            action: action,
            user: user,
            token: debtToken,
            tokenAmount: amount,
          });
        } else {
          for (const gemConfig of marketConfig.gems) {
            if (compareAddress(gemConfig.address, address)) {
              // deposit/withdraw gem
              const amount = formatBigNumberToString(rawAmount, gemConfig.collateralToken.decimals);
              const action = signature === eventSignatures.Exit ? ActivityActions.withdraw : ActivityActions.deposit;
              result.activities.push({
                chain: marketConfig.chain,
                protocol: options.config.protocol,
                address: address,
                transactionHash: log.transactionHash,
                logIndex: log.logIndex.toString(),
                blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
                action: action,
                user: user,
                token: gemConfig.collateralToken,
                tokenAmount: amount,
              });

              break;
            }
          }
        }
      } else if (signature === eventSignatures.AuthJoin || signature === eventSignatures.AuthExit) {
        for (const gemConfig of marketConfig.gems) {
          if (compareAddress(gemConfig.address, address)) {
            const event: any = decodeEventLog({
              abi: this.abiConfigs.eventAbis.authGemJoin,
              data: log.data,
              topics: log.topics,
            });

            const user = normalizeAddress(event.args.urn);
            const amount = formatBigNumberToString(event.args.amt.toString(), gemConfig.collateralToken.decimals);
            const action = signature === eventSignatures.AuthJoin ? ActivityActions.deposit : ActivityActions.withdraw;

            result.activities.push({
              chain: marketConfig.chain,
              protocol: options.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: log.logIndex.toString(),
              blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
              action: action,
              user: user,
              token: gemConfig.collateralToken,
              tokenAmount: amount,
            });
          }
        }
      } else if (signature === eventSignatures.Bark && compareAddress(address, marketConfig.dog)) {
        // liquidation
        // https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation
        // https://etherscan.io/tx/0x01c4e90a4c080a3d496030a8038f2c50d92de569ebc31866e28a575e37cb3da5#eventlog
        const event: any = decodeEventLog({
          abi: this.abiConfigs.eventAbis.dog,
          data: log.data,
          topics: log.topics,
        });
        // we need to find the collateral token by ilk
        for (const gemConfig of marketConfig.gems) {
          if (gemConfig.ilk === event.args.ilk) {
            result.activities.push({
              chain: marketConfig.chain,
              protocol: options.config.protocol,
              address: gemConfig.address,
              transactionHash: log.transactionHash,
              logIndex: log.logIndex.toString(),
              blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
              action: ActivityActions.liquidate,
              user: normalizeAddress(event.args.urn),
              token: gemConfig.collateralToken,
              tokenAmount: formatBigNumberToString(event.args.ink.toString(), 18),
            });
          }
        }
      }
    }

    return result;
  }

  public async getLendingAssetDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<CdpLendingAssetDataTimeframe | null> {
    const stateData = await this.getLendingAssetDataState({
      config: options.config,
      timestamp: options.fromTime,
    });
    if (!stateData) {
      return null;
    }

    // make sure activities were synced
    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    const logs = await this.getEventLogs({
      metricConfig: options.config,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    const { activities } = await this.transformEventLogs({
      chain: options.config.chain,
      config: options.config,
      logs: logs,
    });

    const marketConfig = options.config as MakerLendingMarketConfig;
    const snapshot: CdpLendingAssetDataTimeframe = {
      ...stateData,
      timefrom: options.fromTime,
      timeto: options.toTime,

      volumeBorrowed: '0',
      volumeRepaid: '0',

      addresses: [],
      transactions: [],
      collaterals: [],
    };

    const countUsers: { [key: string]: boolean } = {};
    const transactions: { [key: string]: boolean } = {};

    const daiEvents = activities.filter(
      (activity) =>
        activity.chain === stateData.chain &&
        activity.protocol === stateData.protocol &&
        activity.address === marketConfig.daiJoin &&
        activity.token.address === marketConfig.debtToken.address,
    );

    for (const event of daiEvents) {
      const activityEvent = event as CdpLendingActivityEvent;
      if (!transactions[activityEvent.transactionHash]) {
        transactions[activityEvent.transactionHash] = true;
      }

      if (!countUsers[activityEvent.user]) {
        countUsers[activityEvent.user] = true;
      }

      switch (activityEvent.action) {
        case ActivityActions.borrow: {
          snapshot.volumeBorrowed = new BigNumber(snapshot.volumeBorrowed)
            .plus(new BigNumber(activityEvent.tokenAmount))
            .toString(10);
          break;
        }
        case ActivityActions.repay: {
          snapshot.volumeRepaid = new BigNumber(snapshot.volumeRepaid)
            .plus(new BigNumber(activityEvent.tokenAmount))
            .toString(10);
          break;
        }
      }
    }

    for (const collateral of stateData.collaterals) {
      let volumeDeposited = new BigNumber(0);
      let volumeWithdrawn = new BigNumber(0);
      let volumeLiquidated = new BigNumber(0);

      const collateralEvents = activities.filter(
        (activity) =>
          activity.chain === stateData.chain &&
          activity.protocol === stateData.protocol &&
          activity.address === collateral.address &&
          activity.token.address === collateral.token.address,
      );

      for (const event of collateralEvents) {
        const activityEvent = event as CdpLendingActivityEvent;

        if (!transactions[activityEvent.transactionHash]) {
          transactions[activityEvent.transactionHash] = true;
        }

        if (!countUsers[activityEvent.user]) {
          countUsers[activityEvent.user] = true;
        }

        switch (activityEvent.action) {
          case ActivityActions.deposit: {
            volumeDeposited = volumeDeposited.plus(new BigNumber(activityEvent.tokenAmount));
            break;
          }
          case ActivityActions.withdraw: {
            volumeWithdrawn = volumeWithdrawn.plus(new BigNumber(activityEvent.tokenAmount));
            break;
          }
          case ActivityActions.liquidate: {
            volumeLiquidated = volumeLiquidated.plus(new BigNumber(activityEvent.tokenAmount));
            break;
          }
        }
      }

      snapshot.collaterals.push({
        ...collateral,
        timefrom: options.fromTime,
        timeto: options.toTime,
        volumeDeposited: volumeDeposited.toString(10),
        volumeWithdrawn: volumeWithdrawn.toString(10),
        volumeLiquidated: volumeLiquidated.toString(10),
      });
    }

    snapshot.addresses = Object.keys(countUsers);
    snapshot.transactions = Object.keys(transactions);

    return snapshot;
  }
}
