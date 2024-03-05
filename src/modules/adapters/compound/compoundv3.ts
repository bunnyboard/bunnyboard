import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import CometAbi from '../../../configs/abi/compound/Comet.json';
import CometRewardsAbi from '../../../configs/abi/compound/CometRewards.json';
import { Erc20TransferEventSignature, TimeUnits } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { Compoundv3LendingMarketConfig } from '../../../configs/protocols/compound';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ActivityActions } from '../../../types/collectors/base';
import {
  CdpLendingActivityEvent,
  CdpLendingAssetDataState,
  CdpLendingAssetDataTimeframe,
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
import { ProtocolConfig } from '../../../types/configs';
import { ContextServices } from '../../../types/namespaces';
import CompoundLibs from '../../libs/compound';
import ProtocolAdapter from '../adapter';
import { Compoundv3EventInterfaces, Compoundv3EventSignatures } from './abis';

export default class Compoundv3Adapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.compoundv3';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = Compoundv3EventSignatures;
    this.abiConfigs.eventAbis = {
      comet: CometAbi,
      cometRewards: CometRewardsAbi,
    };
  }

  public async getDataState(options: GetAdapterDataStateOptions): Promise<GetAdapterDataStateResult> {
    const result: GetAdapterDataStateResult = {
      crossLending: null,
      cdpLending: [],
    };

    const marketConfig: Compoundv3LendingMarketConfig = options.config as Compoundv3LendingMarketConfig;
    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[marketConfig.chain].blockSubgraph,
      options.timestamp,
    );

    const cometInfo = await CompoundLibs.getCometInfo(marketConfig, blockNumber);
    const debtTokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: marketConfig.debtToken.chain,
      address: marketConfig.debtToken.address,
      timestamp: options.timestamp,
    });

    const marketState: CdpLendingAssetDataState = {
      chain: options.config.chain,
      protocol: options.config.protocol,
      metric: options.config.metric,
      timestamp: options.timestamp,
      token: marketConfig.debtToken,
      tokenPrice: debtTokenPrice ? debtTokenPrice : '0',
      totalBorrowed: '0',
      totalDeposited: '0',
      rateSupply: '0',
      collaterals: [],
    };

    const totalSupply = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: this.abiConfigs.eventAbis.comet,
      target: marketConfig.address,
      method: 'totalSupply',
      params: [],
      blockNumber: blockNumber,
    });
    const totalBorrow = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: this.abiConfigs.eventAbis.comet,
      target: marketConfig.address,
      method: 'totalBorrow',
      params: [],
      blockNumber: blockNumber,
    });

    const utilization = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: this.abiConfigs.eventAbis.comet,
      target: marketConfig.address,
      method: 'getUtilization',
      params: [],
      blockNumber: blockNumber,
    });
    const supplyRate = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: this.abiConfigs.eventAbis.comet,
      target: marketConfig.address,
      method: 'getSupplyRate',
      params: [utilization.toString()],
      blockNumber: blockNumber,
    });
    const borrowRate = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: this.abiConfigs.eventAbis.comet,
      target: marketConfig.address,
      method: 'getBorrowRate',
      params: [utilization.toString()],
      blockNumber: blockNumber,
    });
    marketState.totalDeposited = formatBigNumberToString(totalSupply.toString(), marketConfig.debtToken.decimals);
    marketState.totalBorrowed = formatBigNumberToString(totalBorrow.toString(), marketConfig.debtToken.decimals);
    marketState.rateSupply = formatBigNumberToString(
      new BigNumber(supplyRate.toString()).multipliedBy(TimeUnits.SecondsPerYear).toString(10),
      18,
    );

    for (const asset of cometInfo.collaterals) {
      const assetPrice = await this.services.oracle.getTokenPriceUsd({
        chain: asset.chain,
        address: asset.address,
        timestamp: options.timestamp,
      });
      const assetInfo = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: this.abiConfigs.eventAbis.comet,
        target: marketConfig.address,
        method: 'getAssetInfoByAddress',
        params: [asset.address],
        blockNumber: blockNumber,
      });
      const totalCollaterals = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: this.abiConfigs.eventAbis.comet,
        target: marketConfig.address,
        method: 'totalsCollateral',
        params: [asset.address],
        blockNumber: blockNumber,
      });

      const totalDeposited = formatBigNumberToString(totalCollaterals[0].toString(), asset.decimals);
      const loanToValue = formatBigNumberToString(assetInfo.borrowCollateralFactor.toString(), 18);

      marketState.collaterals.push({
        chain: options.config.chain,
        protocol: options.config.protocol,
        metric: options.config.metric,
        timestamp: options.timestamp,
        address: marketConfig.address,
        token: asset,
        tokenPrice: assetPrice ? assetPrice : '0',
        totalDeposited: totalDeposited,
        rateBorrow: formatBigNumberToString(
          new BigNumber(borrowRate.toString()).multipliedBy(TimeUnits.SecondsPerYear).toString(10),
          18,
        ),
        feeBorrow: '0',
        rateLoanToValue: loanToValue,
      });
    }

    if (result.cdpLending) {
      result.cdpLending.push(marketState);
    }

    return result;
  }

  public async getEventLogs(options: GetAdapterEventLogsOptions): Promise<Array<any>> {
    return await this.services.blockchain.getContractLogs({
      chain: options.config.chain,
      address: options.config.address,
      fromBlock: options.fromBlock,
      toBlock: options.toBlock,
    });
  }

  public async transformEventLogs(options: TransformEventLogOptions): Promise<TransformEventLogResult> {
    const result: TransformEventLogResult = {
      activities: [],
    };

    const marketConfig: Compoundv3LendingMarketConfig = options.config as Compoundv3LendingMarketConfig;
    const eventSignatures: Compoundv3EventInterfaces = this.abiConfigs.eventSignatures as Compoundv3EventInterfaces;
    for (const log of options.logs) {
      const signature = log.topics[0];
      const address = normalizeAddress(log.address);

      if (compareAddress(address, marketConfig.address)) {
        const event: any = decodeEventLog({
          abi: this.abiConfigs.eventAbis.comet,
          data: log.data,
          topics: log.topics,
        });

        switch (signature) {
          case eventSignatures.SupplyCollateral:
          case eventSignatures.WithdrawCollateral: {
            const token = await this.services.blockchain.getTokenInfo({
              chain: marketConfig.chain,
              address: event.args.asset,
            });
            if (token) {
              const user = event.args.from ? normalizeAddress(event.args.from) : normalizeAddress(event.args.src);
              const amount = formatBigNumberToString(event.args.amount.toString(), token.decimals);
              const action =
                signature === eventSignatures.SupplyCollateral ? ActivityActions.deposit : ActivityActions.withdraw;

              result.activities.push({
                chain: options.chain,
                protocol: this.config.protocol,
                address: address,
                transactionHash: log.transactionHash,
                logIndex: log.logIndex.toString(),
                blockNumber: Number(log.blockNumber),
                timestamp: log.timestamp,
                action: action,
                user: user,
                token: token,
                tokenAmount: amount,
              });
            }
            break;
          }
          case eventSignatures.Supply:
          case eventSignatures.Withdraw: {
            let action = ActivityActions.deposit;

            // on compound v3, we detect supply transaction by looking Comet Transfer event from the same transaction
            // when user deposit base asset, if there is a Transfer event emitted on transaction,
            // the transaction action is deposit, otherwise, the transaction action is repay.
            if (signature === Compoundv3EventSignatures.Supply) {
              action = ActivityActions.repay;

              for (const logItem of options.logs.filter(
                (item) =>
                  Number(item.blockNumber) === Number(log.blockNumber) && item.transactionHash === log.transactionHash,
              )) {
                if (
                  logItem.topics[0] === Erc20TransferEventSignature &&
                  compareAddress(logItem.address, marketConfig.address)
                ) {
                  action = ActivityActions.deposit;
                }
              }
            } else {
              action = ActivityActions.borrow;

              for (const logItem of options.logs.filter(
                (item) =>
                  Number(item.blockNumber) === Number(log.blockNumber) && item.transactionHash === log.transactionHash,
              )) {
                if (
                  logItem.topics[0] === Erc20TransferEventSignature &&
                  compareAddress(logItem.address, marketConfig.address)
                ) {
                  action = ActivityActions.withdraw;
                }
              }
            }

            const user = event.args.from ? normalizeAddress(event.args.from) : normalizeAddress(event.args.src);
            const amount = formatBigNumberToString(event.args.amount.toString(), marketConfig.debtToken.decimals);

            result.activities.push({
              chain: options.chain,
              protocol: this.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: log.logIndex.toString(),
              blockNumber: Number(log.blockNumber),
              timestamp: log.timestamp,
              action: action,
              user: user,
              token: marketConfig.debtToken,
              tokenAmount: amount,
            });

            break;
          }
          case eventSignatures.AbsorbCollateral: {
            const token = await this.services.blockchain.getTokenInfo({
              chain: marketConfig.chain,
              address: event.args.asset,
            });
            if (token) {
              const user = normalizeAddress(event.args.absorber);
              const amount = formatBigNumberToString(event.args.collateralAbsorbed.toString(), token.decimals);

              result.activities.push({
                chain: options.chain,
                protocol: this.config.protocol,
                address: address,
                transactionHash: log.transactionHash,
                logIndex: log.logIndex.toString(),
                blockNumber: Number(log.blockNumber),
                timestamp: log.timestamp,
                action: ActivityActions.liquidate,
                user: user,
                token: token,
                tokenAmount: amount,
              });

              break;
            }
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

    const marketConfig = options.config as Compoundv3LendingMarketConfig;
    for (const stateData of states) {
      const snapshot: CdpLendingAssetDataTimeframe = {
        ...stateData,
        timefrom: options.fromTime,
        timeto: options.toTime,

        volumeBorrowed: '0',
        volumeRepaid: '0',
        volumeDeposited: '0',
        volumeWithdrawn: '0',

        addresses: [],
        transactions: [],

        collaterals: [],
      };

      const addresses: { [key: string]: boolean } = {};
      const transactions: { [key: string]: boolean } = {};

      const baseTokenEvents = activities.filter(
        (activity) =>
          activity.chain === stateData.chain &&
          activity.protocol === stateData.protocol &&
          activity.address === marketConfig.address &&
          activity.token.address === marketConfig.debtToken.address,
      );

      let volumeBorrowedBaseToken = new BigNumber(0);
      let volumeRepaidBaseToken = new BigNumber(0);
      let volumeDepositedBaseToken = new BigNumber(0);
      let volumeWithdrawnBaseToken = new BigNumber(0);
      for (const event of baseTokenEvents) {
        const activityEvent = event as CdpLendingActivityEvent;
        if (!transactions[activityEvent.transactionHash]) {
          transactions[activityEvent.transactionHash] = true;
        }

        if (!addresses[activityEvent.user]) {
          addresses[activityEvent.user] = true;
        }

        switch (activityEvent.action) {
          case ActivityActions.deposit: {
            volumeDepositedBaseToken = volumeDepositedBaseToken.plus(new BigNumber(activityEvent.tokenAmount));
            break;
          }
          case ActivityActions.withdraw: {
            volumeWithdrawnBaseToken = volumeWithdrawnBaseToken.plus(new BigNumber(activityEvent.tokenAmount));
            break;
          }
          case ActivityActions.borrow: {
            volumeBorrowedBaseToken = volumeBorrowedBaseToken.plus(new BigNumber(activityEvent.tokenAmount));
            break;
          }
          case ActivityActions.repay: {
            volumeRepaidBaseToken = volumeRepaidBaseToken.plus(new BigNumber(activityEvent.tokenAmount));
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
            activity.address === marketConfig.address &&
            activity.token.address === collateral.token.address,
        );

        for (const event of collateralEvents) {
          const activityEvent = event as CdpLendingActivityEvent;

          if (!transactions[activityEvent.transactionHash]) {
            transactions[activityEvent.transactionHash] = true;
          }

          if (!addresses[activityEvent.user]) {
            addresses[activityEvent.user] = true;
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

      snapshot.addresses = Object.keys(addresses);
      snapshot.transactions = Object.keys(transactions);

      if (result.cdpLending) {
        result.cdpLending.push(snapshot);
      }
    }

    return result;
  }
}
