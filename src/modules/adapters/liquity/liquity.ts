import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import BorrowOperationsAbi from '../../../configs/abi/liquity/BorrowOperations.json';
import TroveManagerAbi from '../../../configs/abi/liquity/TroveManager.json';
import { DAY } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { LiquityLendingMarketConfig } from '../../../configs/protocols/liquity';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { DataMetrics, ProtocolConfig, Token } from '../../../types/configs';
import { ActivityAction, ActivityActions, TokenAmountEntry } from '../../../types/domains/base';
import { LendingActivityEvent, LendingMarketState } from '../../../types/domains/lending';
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
    market: LiquityLendingMarketConfig,
    decodedEvent: any,
    blockNumber: number,
  ): Promise<GetTroveStateInfo> {
    const troveInfo = await this.services.blockchain.readContract({
      chain: market.chain,
      target: market.troveManager,
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
      debtAmount: formatBigNumberToString(
        newDebt.minus(previousDebt).abs().toString(10),
        (market.debtToken as Token).decimals,
      ),
      collAmount: formatBigNumberToString(
        newColl.minus(previousColl).abs().toString(10),
        (market.collateralToken as Token).decimals,
      ),
      isBorrow: previousDebt.lte(newDebt),
    };
  }

  protected async getBorrowingFee(config: LiquityLendingMarketConfig, blockNumber: number): Promise<string> {
    const borrowingFee = await this.services.blockchain.readContract({
      chain: config.chain,
      target: config.troveManager,
      abi: TroveManagerAbi,
      method: 'getBorrowingRate',
      params: [],
      blockNumber: blockNumber,
    });
    return formatBigNumberToString(borrowingFee.toString(), 18);
  }

  public async getStateData(options: GetAdapterDataOptions): Promise<GetStateDataResult> {
    const result: GetStateDataResult = {
      data: [],
    };

    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );

    const marketConfig: LiquityLendingMarketConfig = options.config as LiquityLendingMarketConfig;
    const debtToken = marketConfig.debtToken as Token;
    const collateralToken = marketConfig.collateralToken as Token;

    const totalDebt = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: this.abiConfigs.eventAbis.troveManager,
      target: marketConfig.troveManager,
      method: 'getEntireSystemDebt',
      params: [],
      blockNumber: blockNumber,
    });
    const totalColl = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: this.abiConfigs.eventAbis.troveManager,
      target: marketConfig.troveManager,
      method: 'getEntireSystemColl',
      params: [],
      blockNumber: blockNumber,
    });

    const debtTokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: debtToken.chain,
      address: debtToken.address,
      timestamp: options.timestamp,
    });
    const collateralTokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: collateralToken.chain,
      address: collateralToken.address,
      timestamp: options.timestamp,
    });

    const borrowingFee = await this.getBorrowingFee(marketConfig, blockNumber);

    const dataState: LendingMarketState = {
      type: marketConfig.type,
      metric: DataMetrics.lending,
      chain: marketConfig.chain,
      protocol: marketConfig.protocol,
      address: normalizeAddress(marketConfig.address),
      timestamp: options.timestamp,

      token: debtToken,
      tokenPrice: debtTokenPrice ? debtTokenPrice : '0',
      collateralToken: collateralToken,
      collateralTokenPrice: collateralTokenPrice ? collateralTokenPrice : '0',

      totalDeposited: formatBigNumberToString(totalColl.toString(), collateralToken.decimals),
      totalBorrowed: formatBigNumberToString(totalDebt.toString(), debtToken.decimals),

      supplyRate: '0',
      borrowRate: borrowingFee,

      // liquity must maintain 110% collateral value on debts
      // so, the loan to value is always 100 / 110 -> 0.9 -> 90%
      loanToValueRate: '0.9',
      liquidationThresholdRate: '0.9',
      reserveRate: '0',
    };

    result.data.push(dataState);

    return result;
  }

  public async getEventLogs(options: GetAdapterEventLogsOptions): Promise<Array<any>> {
    const config = options.config as LiquityLendingMarketConfig;

    let logs = await this.services.blockchain.getContractLogs({
      chain: options.config.chain,
      address: options.config.address,
      fromBlock: options.fromBlock,
      toBlock: options.toBlock,
    });
    logs = logs.concat(
      await this.services.blockchain.getContractLogs({
        chain: options.config.chain,
        address: config.troveManager,
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

    const eventSignatures: LiquityEventInterfaces = this.abiConfigs.eventSignatures;
    const marketConfig: LiquityLendingMarketConfig = options.config as LiquityLendingMarketConfig;
    const debtToken = marketConfig.debtToken as Token;
    const collateralToken = marketConfig.collateralToken as Token;
    for (const log of options.logs) {
      const signature = log.topics[0];
      const address = normalizeAddress(log.address);

      if (signature === eventSignatures.TroveUpdated && address === marketConfig.address) {
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
          const collateralAmount = formatBigNumberToString(event.args._coll.toString(), collateralToken.decimals);

          result.activities.push({
            chain: marketConfig.chain,
            protocol: this.config.protocol,
            address: marketConfig.address,
            transactionHash: log.transactionHash,
            logIndex: log.logIndex.toString(),
            blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
            timestamp: log.timestamp,
            action: 'borrow',
            user: user,
            token: debtToken,
            tokenAmount: amount,
            collateralToken: collateralToken,
            collateralAmount: collateralAmount,
          });
        } else {
          const info: GetTroveStateInfo = await this.getTroveState(marketConfig, event, Number(log.blockNumber));
          const action: ActivityAction = info.isBorrow ? ActivityActions.borrow : ActivityActions.repay;
          result.activities.push({
            chain: marketConfig.chain,
            protocol: this.config.protocol,
            address: marketConfig.address,
            transactionHash: log.transactionHash,
            logIndex: log.logIndex.toString(),
            blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
            timestamp: log.timestamp,
            action: action,
            user: user,
            token: debtToken,
            tokenAmount: info.debtAmount,
            collateralToken: collateralToken,
            collateralAmount: info.collAmount,
          });
        }
      } else if (signature === eventSignatures.TroveLiquidated && address === marketConfig.troveManager) {
        const event: any = decodeEventLog({
          abi: this.abiConfigs.eventAbis.troveManager,
          data: log.data,
          topics: log.topics,
        });
        const amount = formatBigNumberToString(event.args._debt.toString(), debtToken.decimals);
        const collateralAmount = formatBigNumberToString(event.args._coll.toString(), collateralToken.decimals);
        const borrower = normalizeAddress(event.args._borrower);

        result.activities.push({
          chain: marketConfig.chain,
          protocol: this.config.protocol,
          address: marketConfig.address,
          transactionHash: log.transactionHash,
          logIndex: log.logIndex.toString(),
          blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
          timestamp: log.timestamp,
          action: ActivityActions.liquidate,
          user: borrower,
          token: debtToken,
          tokenAmount: amount,
          collateralToken: collateralToken,
          collateralAmount: collateralAmount,
          borrower: borrower,
        });
      }
    }

    return result;
  }

  public async getSnapshotData(
    options: GetAdapterDataOptions,
    storages: ContextStorages,
  ): Promise<GetSnapshotDataResult> {
    const states = (await this.getStateData(options)).data;

    const result: GetSnapshotDataResult = {
      data: [],
    };

    const startDayTimestamp = options.timestamp;
    const endDayTimestamp = options.timestamp + DAY - 1;

    // sync activities
    await this.syncActivities(options, storages);

    for (const stateData of states) {
      const documents = await storages.database.query({
        collection: EnvConfig.mongodb.collections.activities,
        query: {
          chain: stateData.chain,
          protocol: stateData.protocol,
          address: stateData.address,
          'token.address': stateData.token.address,
          'collateralToken.address': (stateData.collateralToken as Token).address,
          timestamp: {
            $gte: startDayTimestamp,
            $lte: endDayTimestamp,
          },
        },
      });

      let volumeDeposited = new BigNumber(0);
      let volumeWithdrawn = new BigNumber(0);
      let volumeBorrowed = new BigNumber(0);
      let volumeRepaid = new BigNumber(0);
      const volumeLiquidated: { [key: string]: TokenAmountEntry } = {};
      const countUsers: { [key: string]: boolean } = {};
      const countBorrowers: { [key: string]: boolean } = {};
      const transactions: { [key: string]: boolean } = {};

      for (const document of documents) {
        const activityEvent = document as LendingActivityEvent;

        if (!transactions[document.transactionHash]) {
          transactions[document.transactionHash] = true;
        }

        if (!countUsers[activityEvent.user]) {
          countUsers[activityEvent.user] = true;
        }

        if (!countBorrowers[activityEvent.user]) {
          countBorrowers[activityEvent.user] = true;
        }

        switch (activityEvent.action) {
          case ActivityActions.borrow: {
            volumeDeposited = volumeDeposited.plus(new BigNumber(activityEvent.collateralAmount as string));
            volumeBorrowed = volumeBorrowed.plus(new BigNumber(activityEvent.tokenAmount));
            break;
          }
          case ActivityActions.repay: {
            volumeWithdrawn = volumeWithdrawn.plus(new BigNumber(activityEvent.collateralAmount as string));
            volumeRepaid = volumeRepaid.plus(new BigNumber(activityEvent.tokenAmount));
            break;
          }
          case ActivityActions.liquidate: {
            volumeRepaid = volumeRepaid.plus(new BigNumber(activityEvent.tokenAmount as string));

            if (activityEvent.collateralToken && activityEvent.collateralAmount) {
              const key = `${document.address}-${activityEvent.collateralToken.address}`;
              if (!volumeLiquidated[key]) {
                const tokenPrice = await this.services.oracle.getTokenPriceUsd({
                  chain: activityEvent.collateralToken.chain,
                  address: activityEvent.collateralToken.address,
                  timestamp: document.timestamp,
                });
                volumeLiquidated[key] = {
                  token: activityEvent.collateralToken,
                  amount: '0',
                  tokenPrice: tokenPrice ? tokenPrice : ' 0',
                };
              }
              volumeLiquidated[key].amount = new BigNumber(volumeLiquidated[key].amount)
                .plus(new BigNumber(activityEvent.collateralAmount.toString()))
                .toString(10);
            }

            break;
          }
        }
      }

      result.data.push({
        ...stateData,
        volumeDeposited: volumeDeposited.toString(10),
        volumeWithdrawn: volumeWithdrawn.toString(10),
        volumeBorrowed: volumeBorrowed.toString(10),
        volumeRepaid: volumeRepaid.toString(10),
        volumeLiquidated: Object.values(volumeLiquidated),
        totalFeesPaid: volumeBorrowed.multipliedBy(new BigNumber(stateData.borrowRate)).toString(10),
        numberOfUniqueUsers: Object.keys(countUsers).length,
        numberOfLenders: 0,
        numberOfBorrowers: Object.keys(countBorrowers).length,
        numberOfLiquidators: 0,
        numberOfTransactions: Object.keys(transactions).length,
      });
    }

    return result;
  }
}
