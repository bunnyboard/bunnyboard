import BigNumber from 'bignumber.js';
import { decodeAbiParameters, decodeEventLog } from 'viem';

import Erc20Abi from '../../../configs/abi/ERC20.json';
import AuthGemJoinAbi from '../../../configs/abi/maker/AuthGemJoin.json';
import GemJoinAbi from '../../../configs/abi/maker/GemJoin.json';
import JugAbi from '../../../configs/abi/maker/Jug.json';
import SpotAbi from '../../../configs/abi/maker/Spot.json';
import VatAbi from '../../../configs/abi/maker/Vat.json';
import { ONE_RAY, RAD_DECIMALS, RAY_DECIMALS, YEAR } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { MakerLendingMarketConfig } from '../../../configs/protocols/maker';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ActivityActions } from '../../../types/collectors/base';
import {
  CdpLendingActivityEvent,
  CdpLendingMarketDataState,
  CdpLendingMarketDataTimeframe,
} from '../../../types/collectors/cdpLending';
import {
  GetAdapterDataStateOptions,
  GetAdapterDataStateResult,
  GetAdapterDataTimeframeOptions,
  GetAdapterDataTimeframeResult,
  GetAdapterEventLogsOptions,
  TransformEventLogOptions,
  TransformEventLogResult,
} from '../../../types/collectors/options';
import { ProtocolConfig, Token } from '../../../types/configs';
import { ContextServices } from '../../../types/namespaces';
import ProtocolAdapter from '../adapter';
import { MakerEventInterfaces, MakerEventSignatures } from './abis';

export default class MakerAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.maker';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = MakerEventSignatures;
    this.abiConfigs.eventAbis = {
      gemJoin: GemJoinAbi,
      authGemJoin: AuthGemJoinAbi,
      vat: VatAbi,
      spot: SpotAbi,
      jug: JugAbi,
    };
  }

  public async getDataState(options: GetAdapterDataStateOptions): Promise<GetAdapterDataStateResult> {
    const result: GetAdapterDataStateResult = {
      crossLending: null,
      cdpLending: [],
    };

    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );

    const marketConfig: MakerLendingMarketConfig = options.config as MakerLendingMarketConfig;
    const debtToken = marketConfig.debtToken as Token;

    // get total debt
    const debt = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: this.abiConfigs.eventAbis.vat,
      target: marketConfig.vat,
      method: 'debt',
      params: [],
      blockNumber: blockNumber,
    });
    const jugBase = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: this.abiConfigs.eventAbis.jug,
      target: marketConfig.jug,
      method: 'base',
      params: [],
      blockNumber: blockNumber,
    });

    const debtTokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: debtToken.chain,
      address: debtToken.address,
      timestamp: options.timestamp,
    });

    const stateData: CdpLendingMarketDataState = {
      protocol: options.config.protocol,
      chain: options.config.chain,
      metric: options.config.metric,
      timestamp: options.timestamp,
      token: marketConfig.debtToken,
      tokenPrice: debtTokenPrice ? debtTokenPrice : '0',
      totalBorrowed: formatBigNumberToString(debt.toString(), RAD_DECIMALS),
      collaterals: [],
    };

    for (const gemConfig of marketConfig.gems) {
      const gem = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: this.abiConfigs.eventAbis.gemJoin,
        target: gemConfig.address,
        method: 'gem',
        params: [],
      });
      const ilk = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: this.abiConfigs.eventAbis.gemJoin,
        target: gemConfig.address,
        method: 'ilk',
        params: [],
      });

      const collateralToken = await this.services.blockchain.getTokenInfo({
        chain: marketConfig.chain,
        address: gem,
      });
      const gemBalance = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: Erc20Abi,
        target: gem,
        method: 'balanceOf',
        params: [gemConfig.address],
        blockNumber: blockNumber,
      });

      if (collateralToken && gemBalance) {
        const vatInfo = await this.services.blockchain.readContract({
          chain: marketConfig.chain,
          abi: this.abiConfigs.eventAbis.vat,
          target: marketConfig.vat,
          method: 'ilks',
          params: [ilk],
          blockNumber: blockNumber,
        });
        const spotInfo = await this.services.blockchain.readContract({
          chain: marketConfig.chain,
          abi: this.abiConfigs.eventAbis.spot,
          target: marketConfig.spot,
          method: 'ilks',
          params: [ilk],
          blockNumber: blockNumber,
        });
        const jugInfo = await this.services.blockchain.readContract({
          chain: marketConfig.chain,
          abi: this.abiConfigs.eventAbis.jug,
          target: marketConfig.jug,
          method: 'ilks',
          params: [ilk],
          blockNumber: blockNumber,
        });

        const collateralTokenPrice = await this.services.oracle.getTokenPriceUsd({
          chain: marketConfig.chain,
          address: collateralToken.address,
          timestamp: options.timestamp,
        });

        const art = new BigNumber(vatInfo[0].toString());
        const rate = new BigNumber(vatInfo[1].toString());
        const spot = new BigNumber(spotInfo[1].toString());

        // spot is the collateral ratio borrowers must maintain to avoid liquidation
        // for example 145%
        // so, the loan to value = 100 % / 145% = 68.96%
        const loanToValue = new BigNumber(100).multipliedBy(ONE_RAY).dividedBy(new BigNumber(spot));
        const totalBorrowed = formatBigNumberToString(
          art.multipliedBy(rate).toString(10),
          RAY_DECIMALS + debtToken.decimals,
        );
        const totalDeposited = formatBigNumberToString(gemBalance.toString(), collateralToken.decimals);

        // https://docs.makerdao.com/smart-contract-modules/rates-module/jug-detailed-documentation
        const duty = new BigNumber(jugInfo[0].toString()).dividedBy(ONE_RAY);
        const base = new BigNumber(jugBase.toString()).dividedBy(ONE_RAY);
        const elapsed = 3600;

        const deltaRate = duty
          .plus(base)
          .pow(elapsed)
          .multipliedBy(rate.dividedBy(ONE_RAY))
          .minus(rate.dividedBy(ONE_RAY));

        const interestAmount = art.multipliedBy(deltaRate.multipliedBy(YEAR).dividedBy(elapsed));

        const borrowRate = art.eq(0) ? new BigNumber(0) : interestAmount.dividedBy(art);

        stateData.collaterals.push({
          token: collateralToken,
          tokenPrice: collateralTokenPrice ? collateralTokenPrice : '',
          address: gemConfig.address,
          totalDebts: totalBorrowed,
          totalDeposited: totalDeposited,
          rateBorrow: borrowRate.toString(10),
          rateLoanToValue: loanToValue.toString(10),
        });
      }
    }

    if (result.cdpLending) {
      result.cdpLending.push(stateData);
    }

    return result;
  }

  public async getEventLogs(options: GetAdapterEventLogsOptions): Promise<Array<any>> {
    const config = options.config as MakerLendingMarketConfig;

    // get events from dai join
    let logs = await this.services.blockchain.getContractLogs({
      chain: options.config.chain,
      address: config.daiJoin,
      fromBlock: options.fromBlock,
      toBlock: options.toBlock,
    });

    // get events from gem joins
    for (const gemConfig of config.gems) {
      logs = logs.concat(
        await this.services.blockchain.getContractLogs({
          chain: options.config.chain,
          address: gemConfig.address,
          fromBlock: options.fromBlock,
          toBlock: options.toBlock,
        }),
      );
    }

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
            protocol: this.config.protocol,
            address: address,
            transactionHash: log.transactionHash,
            logIndex: log.logIndex.toString(),
            blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
            timestamp: log.timestamp,
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
                protocol: this.config.protocol,
                address: address,
                transactionHash: log.transactionHash,
                logIndex: log.logIndex.toString(),
                blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
                timestamp: log.timestamp,
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
              protocol: this.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: log.logIndex.toString(),
              blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
              timestamp: log.timestamp,
              action: action,
              user: user,
              token: gemConfig.collateralToken,
              tokenAmount: amount,
            });
          }
        }
      }
    }

    return result;
  }

  public async getDataTimeframe(options: GetAdapterDataTimeframeOptions): Promise<GetAdapterDataTimeframeResult> {
    const states = (
      await this.getDataState({
        config: options.config,
        timestamp: options.fromTime,
      })
    ).cdpLending;

    const result: GetAdapterDataTimeframeResult = {
      crossLending: null,
      cdpLending: [],
    };

    if (!states) {
      return result;
    }

    // make sure activities were synced
    const beginBlock = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.fromTime,
    );
    const endBlock = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.toTime,
    );

    const logs = await this.getEventLogs({
      config: options.config,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    const { activities } = await this.transformEventLogs({
      chain: options.config.chain,
      config: options.config,
      logs: logs,
    });

    const marketConfig = options.config as MakerLendingMarketConfig;
    for (const stateData of states) {
      const snapshot: CdpLendingMarketDataTimeframe = {
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
          volumeDeposited: volumeDeposited.toString(10),
          volumeWithdrawn: volumeWithdrawn.toString(10),
          volumeLiquidated: volumeLiquidated.toString(10),
        });
      }

      snapshot.addresses = Object.keys(countUsers);
      snapshot.transactions = Object.keys(transactions);

      if (result.cdpLending) {
        result.cdpLending.push(snapshot);
      }
    }

    return result;
  }
}
