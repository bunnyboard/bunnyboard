import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import BorrowOperationsAbi from '../../../configs/abi/liquity/BorrowOperations.json';
import TroveManagerAbi from '../../../configs/abi/liquity/TroveManager.json';
import { DAY } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { LiquityLendingMarketConfig, LiquityTrove } from '../../../configs/protocols/liquity';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig, Token } from '../../../types/configs';
import { ActivityAction, ActivityActions } from '../../../types/domains/base';
import {
  CdpLendingActivityEvent,
  CdpLendingMarketSnapshot,
  CdpLendingMarketState,
} from '../../../types/domains/lending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import {
  GetAdapterDataOptions,
  GetAdapterEventLogsOptions,
  GetSnapshotDataResult,
  GetStateDataResult,
  TransformEventLogOptions,
  TransformEventLogResult,
} from '../../../types/options';
import ProtocolAdapter from '../adapter';
import { LiquityEventInterfaces, LiquityEventSignatures } from './abis';

interface GetTroveStateInfo {
  debtAmount: string;
  collAmount: string;
  isBorrow: boolean;
}

export default class LiquityAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.liquity';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = LiquityEventSignatures;
    this.abiConfigs.eventAbis = {
      borrowOperation: BorrowOperationsAbi,
      troveManager: TroveManagerAbi,
    };
  }

  protected async getTroveState(
    chain: string,
    troveManager: string,
    decodedEvent: any,
    blockNumber: number,
  ): Promise<GetTroveStateInfo> {
    const troveInfo = await this.services.blockchain.readContract({
      chain: chain,
      target: troveManager,
      abi: TroveManagerAbi,
      method: 'Troves',
      params: [decodedEvent.args._borrower],
      blockNumber: blockNumber - 1,
    });

    const previousDebt = new BigNumber(troveInfo[0]);
    const newDebt = new BigNumber(decodedEvent.args._debt);
    const previousColl = new BigNumber(troveInfo[1]);
    const newColl = new BigNumber(decodedEvent.args._coll);

    return {
      debtAmount: newDebt.minus(previousDebt).abs().toString(10),
      collAmount: newColl.minus(previousColl).abs().toString(10),
      isBorrow: previousDebt.lte(newDebt),
    };
  }

  protected async getBorrowingFee(chain: string, troveManager: string, blockNumber: number): Promise<string> {
    const borrowingFee = await this.services.blockchain.readContract({
      chain: chain,
      target: troveManager,
      abi: TroveManagerAbi,
      method: 'getBorrowingRate',
      params: [],
      blockNumber: blockNumber,
    });
    return borrowingFee.toString();
  }

  public async getStateData(options: GetAdapterDataOptions): Promise<GetStateDataResult> {
    const result: GetStateDataResult = {
      crossLending: null,
      cdpLending: [],
    };

    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );

    const marketConfig: LiquityLendingMarketConfig = options.config as LiquityLendingMarketConfig;
    const debtToken = marketConfig.debtToken as Token;
    const debtTokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: debtToken.chain,
      address: debtToken.address,
      timestamp: options.timestamp,
    });

    const marketState: CdpLendingMarketState = {
      chain: options.config.chain,
      protocol: options.config.protocol,
      metric: options.config.metric,
      timestamp: options.timestamp,
      token: debtToken,
      tokenPrice: debtTokenPrice ? debtTokenPrice : '0',
      totalDebts: '0',
      rateSupply: '0',
      collaterals: [],
    };

    for (const troveConfig of marketConfig.troves) {
      const collateralToken = troveConfig.collateralToken;
      const totalDebt = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: this.abiConfigs.eventAbis.troveManager,
        target: marketConfig.address,
        method: 'getEntireSystemDebt',
        params: [],
        blockNumber: blockNumber,
      });
      const totalColl = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: this.abiConfigs.eventAbis.troveManager,
        target: marketConfig.address,
        method: 'getEntireSystemColl',
        params: [],
        blockNumber: blockNumber,
      });
      const collateralTokenPrice = await this.services.oracle.getTokenPriceUsd({
        chain: collateralToken.chain,
        address: collateralToken.address,
        timestamp: options.timestamp,
      });

      const borrowingFee = await this.getBorrowingFee(marketConfig.chain, troveConfig.troveManager, blockNumber);

      marketState.totalDebts = new BigNumber(marketState.totalDebts)
        .plus(formatBigNumberToString(totalDebt.toString(), debtToken.decimals))
        .toString(10);

      marketState.collaterals.push({
        address: troveConfig.troveManager,
        token: collateralToken,
        tokenPrice: collateralTokenPrice ? collateralTokenPrice : '0',
        totalDeposited: formatBigNumberToString(totalColl.toString(), collateralToken.decimals),
        rateBorrow: formatBigNumberToString(borrowingFee, 18),

        // liquity must maintain 110% collateral value on debts
        // so, the loan to value is always 100 / 110 -> 0.9 -> 90%
        rateLoanToValueRate: '0.9',
      });
    }

    if (result.cdpLending) {
      result.cdpLending.push(marketState);
    }

    return result;
  }

  public async getEventLogs(options: GetAdapterEventLogsOptions): Promise<Array<any>> {
    const config = options.config as LiquityLendingMarketConfig;

    // get logs from borrow operation
    let logs = await this.services.blockchain.getContractLogs({
      chain: options.config.chain,
      address: options.config.address,
      fromBlock: options.fromBlock,
      toBlock: options.toBlock,
    });

    // get logs from trove managers
    for (const trove of config.troves) {
      logs = logs.concat(
        // get liquidation events
        await this.services.blockchain.getContractLogs({
          chain: options.config.chain,
          address: trove.troveManager,
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

    const eventSignatures: LiquityEventInterfaces = this.abiConfigs.eventSignatures;
    const marketConfig: LiquityLendingMarketConfig = options.config as LiquityLendingMarketConfig;
    const debtToken = marketConfig.debtToken as Token;
    for (const log of options.logs) {
      const signature = log.topics[0];
      const address = normalizeAddress(log.address);

      // todo: find the correct trove manager contract
      const trove: LiquityTrove = marketConfig.troves[0];

      if (signature === eventSignatures.TroveUpdated && compareAddress(address, marketConfig.address)) {
        // borrow/repay
        const event: any = decodeEventLog({
          abi: this.abiConfigs.eventAbis.borrowOperation,
          data: log.data,
          topics: log.topics,
        });
        const operation = Number(event.args._operation);
        const user = normalizeAddress(event.args._borrower);
        if (operation === 0) {
          // open trove
          const amount = formatBigNumberToString(event.args._debt.toString(), debtToken.decimals);
          const collateralAmount = formatBigNumberToString(event.args._coll.toString(), trove.collateralToken.decimals);

          // push the borrow event
          if (amount !== '0') {
            result.activities.push({
              chain: marketConfig.chain,
              protocol: this.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: `${log.logIndex.toString()}:0`,
              blockNumber: Number(log.blockNumber),
              timestamp: log.timestamp,
              action: 'borrow',
              user: user,
              token: debtToken,
              tokenAmount: amount,
            });
          }

          // push the deposit event
          if (collateralAmount !== '0') {
            result.activities.push({
              chain: marketConfig.chain,
              protocol: this.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: `${log.logIndex.toString()}:1`,
              blockNumber: Number(log.blockNumber),
              timestamp: log.timestamp,
              action: 'deposit',
              user: user,
              token: trove.collateralToken,
              tokenAmount: collateralAmount,
            });
          }
        } else {
          const info: GetTroveStateInfo = await this.getTroveState(
            marketConfig.chain,
            trove.troveManager,
            event,
            Number(log.blockNumber),
          );
          const action: ActivityAction = info.isBorrow ? ActivityActions.borrow : ActivityActions.repay;
          const collateralAction: ActivityAction = info.isBorrow ? ActivityActions.deposit : ActivityActions.withdraw;

          const amount = formatBigNumberToString(info.debtAmount, marketConfig.debtToken.decimals);
          const collateralAmount = formatBigNumberToString(info.collAmount, trove.collateralToken.decimals);

          if (amount !== '0') {
            result.activities.push({
              chain: marketConfig.chain,
              protocol: this.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: `${log.logIndex.toString()}:0`,
              blockNumber: Number(log.blockNumber),
              timestamp: log.timestamp,
              action: action,
              user: user,
              token: debtToken,
              tokenAmount: amount,
            });
          }
          if (collateralAmount !== '0') {
            result.activities.push({
              chain: marketConfig.chain,
              protocol: this.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: `${log.logIndex.toString()}:1`,
              blockNumber: Number(log.blockNumber),
              timestamp: log.timestamp,
              action: collateralAction,
              user: user,
              token: trove.collateralToken,
              tokenAmount: collateralAmount,
            });
          }
        }
      } else if (signature === eventSignatures.TroveLiquidated && compareAddress(address, trove.troveManager)) {
        const event: any = decodeEventLog({
          abi: this.abiConfigs.eventAbis.troveManager,
          data: log.data,
          topics: log.topics,
        });
        const amount = formatBigNumberToString(event.args._debt.toString(), debtToken.decimals);
        const collateralAmount = formatBigNumberToString(event.args._coll.toString(), trove.collateralToken.decimals);
        const borrower = normalizeAddress(event.args._borrower);

        if (amount !== '0') {
          result.activities.push({
            chain: marketConfig.chain,
            protocol: this.config.protocol,
            address: address,
            transactionHash: log.transactionHash,
            logIndex: `${log.logIndex.toString()}:0`,
            blockNumber: Number(log.blockNumber),
            timestamp: log.timestamp,
            action: ActivityActions.repay,
            user: borrower,
            token: debtToken,
            tokenAmount: amount,
          });
        }
        if (collateralAmount !== '0') {
          result.activities.push({
            chain: marketConfig.chain,
            protocol: this.config.protocol,
            address: address,
            transactionHash: log.transactionHash,
            logIndex: `${log.logIndex.toString()}:1`,
            blockNumber: Number(log.blockNumber),
            timestamp: log.timestamp,
            action: ActivityActions.liquidate,
            user: borrower,
            token: trove.collateralToken,
            tokenAmount: collateralAmount,
          });
        }
      }
    }

    return result;
  }

  public async getSnapshotData(
    options: GetAdapterDataOptions,
    storages: ContextStorages,
  ): Promise<GetSnapshotDataResult> {
    const states = (await this.getStateData(options)).cdpLending;

    const result: GetSnapshotDataResult = {
      crossLending: null,
      cdpLending: [],
    };

    if (!states) {
      return result;
    }

    const startDayTimestamp = options.timestamp;
    const endDayTimestamp = options.timestamp + DAY - 1;

    // sync activities
    await this.syncActivities(options, storages);

    for (const stateData of states) {
      let volumeBorrowed = new BigNumber(0);
      let volumeRepaid = new BigNumber(0);

      const countBorrowers: { [key: string]: boolean } = {};
      const transactions: { [key: string]: boolean } = {};

      const snapshot: CdpLendingMarketSnapshot = {
        ...stateData,
        collaterals: [],

        volumeBorrowed: '0',
        volumeRepaid: '0',
        totalFeesPaid: '0',
        numberOfUsers: 0,
        numberOfTransactions: 0,
      };

      // count borrow/repay events
      const lusdEvents = await storages.database.query({
        collection: EnvConfig.mongodb.collections.activities,
        query: {
          chain: stateData.chain,
          protocol: stateData.protocol,
          address: options.config.address, // borrow operation
          'token.address': stateData.token.address,
          timestamp: {
            $gte: startDayTimestamp,
            $lte: endDayTimestamp,
          },
        },
      });

      for (const event of lusdEvents) {
        const activityEvent = event as CdpLendingActivityEvent;
        if (!transactions[activityEvent.transactionHash]) {
          transactions[activityEvent.transactionHash] = true;
        }

        if (!countBorrowers[activityEvent.user]) {
          countBorrowers[activityEvent.user] = true;
        }

        switch (activityEvent.action) {
          case ActivityActions.borrow: {
            volumeBorrowed = volumeBorrowed.plus(new BigNumber(activityEvent.tokenAmount));
            break;
          }
          case ActivityActions.repay: {
            volumeRepaid = volumeRepaid.plus(new BigNumber(activityEvent.tokenAmount));
            break;
          }
        }
      }

      snapshot.volumeBorrowed = volumeBorrowed.toString(10);
      snapshot.volumeRepaid = volumeRepaid.toString(10);

      for (const collateral of stateData.collaterals) {
        let volumeDeposited = new BigNumber(0);
        let volumeWithdrawn = new BigNumber(0);
        let volumeLiquidated = new BigNumber(0);

        // count deposit/withdraw/liquidate events
        const collateralEvents = await storages.database.query({
          collection: EnvConfig.mongodb.collections.activities,
          query: {
            chain: stateData.chain,
            protocol: stateData.protocol,
            address: options.config.address, // borrow operation
            'token.address': collateral.token.address,
            timestamp: {
              $gte: startDayTimestamp,
              $lte: endDayTimestamp,
            },
          },
        });
        for (const event of collateralEvents) {
          const activityEvent = event as CdpLendingActivityEvent;

          if (!transactions[activityEvent.transactionHash]) {
            transactions[activityEvent.transactionHash] = true;
          }

          if (!countBorrowers[activityEvent.user]) {
            countBorrowers[activityEvent.user] = true;
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

      snapshot.numberOfUsers = Object.keys(countBorrowers).length;
      snapshot.numberOfTransactions = Object.keys(transactions).length;

      if (result.cdpLending) {
        result.cdpLending.push(snapshot);
      }
    }

    return result;
  }
}
