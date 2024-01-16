import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import AaveDataProviderV2Abi from '../../../configs/abi/aave/DataProviderV2.json';
import AaveIncentiveControllerV2Abi from '../../../configs/abi/aave/IncentiveControllerV2.json';
import AaveLendingPoolV2Abi from '../../../configs/abi/aave/LendingPoolV2.json';
import { DAY, RAY_DECIMALS, YEAR } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import { tryQueryBlockNumberAtTimestamp, tryQueryBlockTimestamps } from '../../../lib/subsgraph';
import { formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { DataMetrics, ProtocolConfig } from '../../../types/configs';
import { ActivityAction, ActivityActions, BaseActivityEvent, TokenAmountEntry } from '../../../types/domains/base';
import { LendingActivityEvent, LendingMarketSnapshot, LendingMarketState } from '../../../types/domains/lending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import {
  GetAdapterDataOptions,
  GetSnapshotDataResult,
  GetStateDataResult,
  TransformEventLogOptions,
  TransformEventLogResult,
} from '../../../types/options';
import ProtocolAdapter from '../adapter';
import { AaveEventInterfaces, Aavev2EventSignatures } from './abis';

export interface AaveMarketRates {
  supply: string;
  borrow: string;
  borrowStable: string;
}

export default class Aavev2Adapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.aavev2';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = Aavev2EventSignatures;
    this.abiConfigs.eventAbis = {
      lendingPool: AaveLendingPoolV2Abi,
      dataProvider: AaveDataProviderV2Abi,
      incentiveController: AaveIncentiveControllerV2Abi,
    };
  }

  public async transformEventLogs(options: TransformEventLogOptions): Promise<TransformEventLogResult> {
    const result: TransformEventLogResult = {
      activities: [],
    };

    const eventSignatures: AaveEventInterfaces = this.abiConfigs.eventSignatures;
    for (const log of options.logs) {
      const signature = log.topics[0];
      const address = normalizeAddress(log.address);

      if (this.supportSignature(signature) && this.supportContract(address)) {
        const event: any = decodeEventLog({
          abi: this.abiConfigs.eventAbis.lendingPool,
          data: log.data,
          topics: log.topics,
        });

        if (signature !== eventSignatures.Liquidate) {
          const reserve = await this.services.blockchain.getTokenInfo({
            chain: options.chain,
            address: event.args.reserve.toString(),
          });
          if (reserve) {
            let action: ActivityAction = 'deposit';
            switch (signature) {
              case eventSignatures.Withdraw: {
                action = 'withdraw';
                break;
              }
              case eventSignatures.Borrow: {
                action = 'borrow';
                break;
              }
              case eventSignatures.Repay: {
                action = 'repay';
                break;
              }
            }

            let user = normalizeAddress(event.args.user.toString());
            let borrower: string | null = null;
            if (signature === eventSignatures.Deposit || signature === eventSignatures.Borrow) {
              user = normalizeAddress(event.args.onBehalfOf.toString());
            } else if (signature === eventSignatures.Withdraw) {
              user = normalizeAddress(event.args.to.toString());
            } else if (signature === eventSignatures.Repay) {
              user = normalizeAddress(event.args.repayer.toString());
              borrower = normalizeAddress(event.args.user.toString());
            }

            const amount = formatBigNumberToString(event.args.amount.toString(), reserve.decimals);

            result.activities.push({
              chain: options.chain,
              protocol: this.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: log.logIndex.toString(),
              blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
              action: action,
              user: user,
              token: reserve,
              tokenAmount: amount,
              borrower: borrower ? borrower : undefined,
            });
          }
        } else {
          const reserve = await this.services.blockchain.getTokenInfo({
            chain: options.chain,
            address: event.args.debtAsset.toString(),
          });
          const collateral = await this.services.blockchain.getTokenInfo({
            chain: options.chain,
            address: event.args.collateralAsset.toString(),
          });

          if (reserve && collateral) {
            const user = normalizeAddress(event.args.liquidator.toString());
            const borrower = normalizeAddress(event.args.user.toString());
            const amount = formatBigNumberToString(event.args.debtToCover.toString(), reserve.decimals);

            const collateralAmount = formatBigNumberToString(
              event.args.liquidatedCollateralAmount.toString(),
              collateral.decimals,
            );
            result.activities.push({
              chain: options.chain,
              protocol: this.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: log.logIndex.toString(),
              blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
              action: 'liquidate',
              user: user,
              token: reserve,
              tokenAmount: amount,

              borrower: borrower,
              collateralToken: collateral,
              collateralAmount: collateralAmount,
            });
          }
        }
      }
    }

    return result;
  }

  public async getStateData(options: GetAdapterDataOptions): Promise<GetStateDataResult> {
    const result: GetStateDataResult = {
      data: [],
    };

    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );

    const marketConfig: AaveLendingMarketConfig = options.config as AaveLendingMarketConfig;

    const reservesList: Array<any> = await this.getReservesList(marketConfig, blockNumber);

    for (const reserve of reservesList) {
      const token = await this.services.blockchain.getTokenInfo({
        chain: marketConfig.chain,
        address: reserve,
      });
      if (!token) {
        continue;
      }

      const tokenPrice = await this.services.oracle.getTokenPriceUsd({
        chain: token.chain,
        address: token.address,
        timestamp: options.timestamp,
      });

      const reserveData: any = await this.getReserveData(marketConfig, reserve, blockNumber);
      const reserveConfigData: any = await this.getReserveConfigData(marketConfig, reserve, blockNumber);

      const totalBorrowed = this.getTotalBorrowed(reserveData);
      const totalDeposited = this.getTotalDeposited(reserveData);
      const rates = this.getMarketRates(reserveData);

      let rewardRateForSupply = '0';
      let rewardRateForBorrow = '0';
      let rewardRateForBorrowStable = '0';

      const incentiveRewards = await this.getIncentiveRewards(marketConfig, reserve, blockNumber);
      if (incentiveRewards) {
        let totalRewardUsdPerYearForSupply = new BigNumber(0);
        let totalRewardUsdPerYearForBorrow = new BigNumber(0);
        let totalRewardUsdPerYearForBorrowStable = new BigNumber(0);
        for (const reward of incentiveRewards.forSupply) {
          if (reward.amount !== '0') {
            const rewardTokenPrice = await this.services.oracle.getTokenPriceUsd({
              chain: marketConfig.chain,
              address: reward.token.address,
              timestamp: options.timestamp,
            });
            if (rewardTokenPrice) {
              totalRewardUsdPerYearForSupply = totalRewardUsdPerYearForSupply.plus(
                new BigNumber(reward.amount).multipliedBy(rewardTokenPrice),
              );
            }
          }
        }
        for (const reward of incentiveRewards.forBorrow) {
          if (reward.amount !== '0') {
            const rewardTokenPrice = await this.services.oracle.getTokenPriceUsd({
              chain: marketConfig.chain,
              address: reward.token.address,
              timestamp: options.timestamp,
            });
            if (rewardTokenPrice) {
              totalRewardUsdPerYearForBorrow = totalRewardUsdPerYearForBorrow.plus(
                new BigNumber(reward.amount).multipliedBy(rewardTokenPrice),
              );
            }
          }
        }
        for (const reward of incentiveRewards.forBorrowStable) {
          if (reward.amount !== '0') {
            const rewardTokenPrice = await this.services.oracle.getTokenPriceUsd({
              chain: marketConfig.chain,
              address: reward.token.address,
              timestamp: options.timestamp,
            });
            if (rewardTokenPrice) {
              totalRewardUsdPerYearForBorrowStable = totalRewardUsdPerYearForBorrowStable.plus(
                new BigNumber(reward.amount).multipliedBy(rewardTokenPrice),
              );
            }
          }
        }

        const totalDepositedUsd = new BigNumber(formatBigNumberToString(totalDeposited, token.decimals)).multipliedBy(
          tokenPrice ? tokenPrice : 0,
        );
        const totalBorrowedUsd = new BigNumber(
          formatBigNumberToString(totalBorrowed.variable, token.decimals),
        ).multipliedBy(tokenPrice ? tokenPrice : 0);
        const totalBorrowedStableUsd = new BigNumber(
          formatBigNumberToString(totalBorrowed.stable, token.decimals),
        ).multipliedBy(tokenPrice ? tokenPrice : 0);
        if (totalDepositedUsd.gt(0)) {
          rewardRateForSupply = totalRewardUsdPerYearForSupply.dividedBy(totalDepositedUsd).toString(10);
        }
        if (totalBorrowedUsd.gt(0)) {
          rewardRateForBorrow = totalRewardUsdPerYearForBorrow.dividedBy(totalBorrowedUsd).toString(10);
        }
        if (totalBorrowedStableUsd.gt(0)) {
          rewardRateForBorrowStable = totalRewardUsdPerYearForBorrowStable
            .dividedBy(totalBorrowedStableUsd)
            .toString(10);
        }
      }

      const dataState: LendingMarketState = {
        type: marketConfig.type,
        metric: DataMetrics.lending,
        chain: marketConfig.chain,
        protocol: marketConfig.protocol,
        address: normalizeAddress(marketConfig.address),
        timestamp: options.timestamp,

        token: token,
        tokenPrice: tokenPrice ? tokenPrice : '0',

        totalDeposited: formatBigNumberToString(totalDeposited, token.decimals),
        totalBorrowed: formatBigNumberToString(totalBorrowed.variable, token.decimals),
        totalBorrowedStable: formatBigNumberToString(totalBorrowed.stable, token.decimals),

        supplyRate: rates.supply,
        borrowRate: rates.borrow,
        borrowRateStable: rates.borrowStable,
        loanToValueRate: this.getLoanToValueRate(reserveConfigData),
        reserveRate: this.getReserveRate(reserveConfigData),
        liquidationThresholdRate: this.getLiquidationThresholdRate(reserveConfigData),

        rewardSupplyRate: rewardRateForSupply,
        rewardBorrowRate: rewardRateForBorrow,
        rewardBorrowRateStable: rewardRateForBorrowStable,
      };

      result.data.push(dataState);
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
    const stateKey = `state-snapshot-${options.config.protocol}-${options.config.chain}-${options.config.metric}-${options.config.address}`;
    const beginBlock = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      startDayTimestamp,
    );
    const endBlock = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      endDayTimestamp,
    );
    const blocktimes = await tryQueryBlockTimestamps(
      EnvConfig.blockchains[options.config.chain].blockSubgraph as string,
      beginBlock,
      endBlock,
    );

    const activityOperations: Array<any> = [];
    const logs = await this.services.blockchain.getContractLogs({
      chain: options.config.chain,
      address: options.config.address,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    const { activities } = await this.transformEventLogs({
      chain: options.config.chain,
      logs: logs,
    });
    for (const activity of activities) {
      activityOperations.push({
        updateOne: {
          filter: {
            chain: options.config.chain,
            transactionHash: activity.transactionHash,
            logIndex: activity.logIndex,
          },
          update: {
            $set: {
              ...activity,
              timestamp: blocktimes[activity.blockNumber] ? blocktimes[activity.blockNumber] : 0,
            },
          },
          upsert: true,
        },
      });
    }

    await storages.database.bulkWrite({
      collection: EnvConfig.mongodb.collections.activities,
      operations: activityOperations,
    });

    await storages.database.update({
      collection: EnvConfig.mongodb.collections.states,
      keys: {
        name: stateKey,
      },
      updates: {
        name: stateKey,
        timestamp: options.timestamp,
      },
      upsert: true,
    });

    for (const stateData of states) {
      const documents = await storages.database.query({
        collection: EnvConfig.mongodb.collections.activities,
        query: {
          chain: stateData.chain,
          protocol: stateData.protocol,
          address: stateData.address,
          'token.address': stateData.token.address,
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
      const countLenders: { [key: string]: boolean } = {};
      const countBorrowers: { [key: string]: boolean } = {};
      const countLiquidators: { [key: string]: boolean } = {};
      const transactions: { [key: string]: boolean } = {};
      for (const document of documents) {
        const activityEvent = document as BaseActivityEvent;
        const borrower = (activityEvent as LendingActivityEvent).borrower;

        if (!transactions[document.transactionHash]) {
          transactions[document.transactionHash] = true;
        }

        if (!countUsers[activityEvent.user]) {
          countUsers[activityEvent.user] = true;
        }
        if (borrower) {
          if (!countUsers[borrower]) {
            countUsers[borrower] = true;
          }
        }

        switch (activityEvent.action) {
          case ActivityActions.deposit: {
            volumeDeposited = volumeDeposited.plus(new BigNumber(activityEvent.tokenAmount));
            if (!countLenders[activityEvent.user]) {
              countLenders[activityEvent.user] = true;
            }
            break;
          }
          case ActivityActions.withdraw: {
            volumeWithdrawn = volumeWithdrawn.plus(new BigNumber(activityEvent.tokenAmount));
            if (!countLenders[activityEvent.user]) {
              countLenders[activityEvent.user] = true;
            }
            break;
          }
          case ActivityActions.borrow: {
            volumeBorrowed = volumeBorrowed.plus(new BigNumber(activityEvent.tokenAmount));
            if (!countBorrowers[activityEvent.user]) {
              countBorrowers[activityEvent.user] = true;
            }
            break;
          }
          case ActivityActions.repay: {
            volumeRepaid = volumeRepaid.plus(new BigNumber(activityEvent.tokenAmount));
            if (!countBorrowers[activityEvent.user]) {
              countBorrowers[activityEvent.user] = true;
            }
            break;
          }
          case ActivityActions.liquidate: {
            const event = activityEvent as LendingActivityEvent;
            if (event.collateralToken && event.collateralAmount) {
              const key = `${document.address}-${document.collateralToken.address}`;
              if (!volumeLiquidated[key]) {
                const tokenPrice = await this.services.oracle.getTokenPriceUsd({
                  chain: document.collateralToken.chain,
                  address: document.collateralToken.address,
                  timestamp: document.timestamp,
                });
                volumeLiquidated[key] = {
                  token: document.collateralToken,
                  amount: '0',
                  tokenPrice: tokenPrice ? tokenPrice : ' 0',
                };
              }
              volumeLiquidated[key].amount = new BigNumber(volumeLiquidated[key].amount)
                .plus(new BigNumber(event.collateralAmount.toString()))
                .toString(10);
            }

            if (borrower) {
              if (!countBorrowers[borrower]) {
                countBorrowers[borrower] = true;
              }
            }

            // count liquidators
            if (!countLiquidators[activityEvent.user]) {
              countLiquidators[activityEvent.user] = true;
            }
            break;
          }
        }
      }

      const snapshotData: LendingMarketSnapshot = {
        ...stateData,

        volumeDeposited: volumeDeposited.toString(10),
        volumeWithdrawn: volumeWithdrawn.toString(10),
        volumeBorrowed: volumeBorrowed.toString(10),
        volumeRepaid: volumeRepaid.toString(10),
        volumeLiquidated: Object.values(volumeLiquidated),

        numberOfUniqueUsers: Object.keys(countUsers).length,
        numberOfLenders: Object.keys(countLenders).length,
        numberOfBorrowers: Object.keys(countBorrowers).length,
        numberOfLiquidators: Object.keys(countLiquidators).length,
        numberOfTransactions: Object.keys(transactions).length,
      };

      result.data.push(snapshotData);
    }

    return result;
  }

  // return total deposited (in wei)
  protected getTotalDeposited(reserveData: any): string {
    const totalBorrowed = new BigNumber(reserveData[1].toString()).plus(new BigNumber(reserveData[2].toString()));
    return new BigNumber(reserveData[0].toString()).plus(totalBorrowed).toString(10);
  }

  // return total borrowed (in wei)
  protected getTotalBorrowed(reserveData: any): {
    stable: string;
    variable: string;
  } {
    return {
      stable: reserveData[1].toString(),
      variable: reserveData[2].toString(),
    };
  }

  protected getMarketRates(reserveData: any): AaveMarketRates {
    return {
      supply: formatBigNumberToString(reserveData[3].toString(), RAY_DECIMALS),
      borrow: formatBigNumberToString(reserveData[4].toString(), RAY_DECIMALS),
      borrowStable: formatBigNumberToString(reserveData[5].toString(), RAY_DECIMALS),
    };
  }

  protected getLoanToValueRate(configData: any): string {
    return formatBigNumberToString(configData[1].toString(), 4);
  }

  protected getReserveRate(configData: any): string {
    return formatBigNumberToString(configData[4].toString(), 4);
  }

  protected getLiquidationThresholdRate(configData: any): string {
    return formatBigNumberToString(configData[2].toString(), 4);
  }

  // return amount of token rewards in one year
  // based on current emission
  protected async getIncentiveRewards(
    config: AaveLendingMarketConfig,
    reserve: string,
    blockNumber: number,
  ): Promise<{
    forSupply: Array<TokenAmountEntry>;
    forBorrow: Array<TokenAmountEntry>;
    forBorrowStable: Array<TokenAmountEntry>;
  } | null> {
    const rewards: any = {
      forSupply: [],
      forBorrow: [],
      forBorrowStable: [],
    };

    const rewardTokenAddress = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: this.abiConfigs.eventAbis.incentiveController,
      target: config.incentiveController,
      method: 'REWARD_TOKEN',
      params: [],
      blockNumber,
    });
    if (!rewardTokenAddress) {
      return null;
    }

    const rewardToken = await this.services.blockchain.getTokenInfo({
      chain: config.chain,
      address: rewardTokenAddress,
    });
    if (!rewardToken) {
      return null;
    }

    // first, we need to get aToken address and debtTokenAddress for the given reserve
    const reserveTokensAddresses = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: this.abiConfigs.eventAbis.dataProvider,
      target: config.dataProvider,
      method: 'getReserveTokensAddresses',
      params: [reserve],
      blockNumber: blockNumber,
    });
    const aTokenAssetInfo = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: this.abiConfigs.eventAbis.incentiveController,
      target: config.incentiveController,
      method: 'assets',
      params: [reserveTokensAddresses[0]],
      blockNumber: blockNumber,
    });
    const stableDebtAssetInfo = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: this.abiConfigs.eventAbis.incentiveController,
      target: config.incentiveController,
      method: 'assets',
      params: [reserveTokensAddresses[1]],
      blockNumber: blockNumber,
    });
    const variableDebtAssetInfo = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: this.abiConfigs.eventAbis.incentiveController,
      target: config.incentiveController,
      method: 'assets',
      params: [reserveTokensAddresses[2]],
      blockNumber: blockNumber,
    });

    let rewardForSupply = new BigNumber(0);
    let rewardForBorrow = new BigNumber(0);
    let rewardForBorrowStable = new BigNumber(0);

    if (aTokenAssetInfo) {
      rewardForSupply = rewardForSupply.plus(new BigNumber(aTokenAssetInfo[0].toString())).multipliedBy(YEAR);
    }
    if (variableDebtAssetInfo) {
      rewardForBorrow = rewardForBorrow.plus(new BigNumber(variableDebtAssetInfo[0].toString())).multipliedBy(YEAR);
    }
    if (stableDebtAssetInfo) {
      rewardForBorrowStable = rewardForBorrowStable
        .plus(new BigNumber(stableDebtAssetInfo[0].toString()))
        .multipliedBy(YEAR);
    }

    rewards.forSupply.push({
      token: rewardToken,
      amount: formatBigNumberToString(rewardForSupply.toString(10), rewardToken.decimals),
    } as TokenAmountEntry);

    rewards.forBorrow.push({
      token: rewardToken,
      amount: formatBigNumberToString(rewardForBorrow.toString(10), rewardToken.decimals),
    } as TokenAmountEntry);

    rewards.forBorrowStable.push({
      token: rewardToken,
      amount: formatBigNumberToString(rewardForBorrowStable.toString(10), rewardToken.decimals),
    } as TokenAmountEntry);

    return rewards;
  }

  protected async getReservesList(config: AaveLendingMarketConfig, blockNumber: number): Promise<any> {
    return await this.services.blockchain.readContract({
      chain: config.chain,
      abi: this.abiConfigs.eventAbis.lendingPool,
      target: config.address,
      method: 'getReservesList',
      params: [],
      blockNumber,
    });
  }

  protected async getReserveData(config: AaveLendingMarketConfig, reserve: string, blockNumber: number): Promise<any> {
    return await this.services.blockchain.readContract({
      chain: config.chain,
      abi: this.abiConfigs.eventAbis.dataProvider,
      target: config.dataProvider,
      method: 'getReserveData',
      params: [reserve],
      blockNumber,
    });
  }

  protected async getReserveConfigData(
    config: AaveLendingMarketConfig,
    reserve: string,
    blockNumber: number,
  ): Promise<any> {
    return await this.services.blockchain.readContract({
      chain: config.chain,
      abi: this.abiConfigs.eventAbis.dataProvider,
      target: config.dataProvider,
      method: 'getReserveConfigurationData',
      params: [reserve],
      blockNumber,
    });
  }
}
