import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import AaveDataProviderV2Abi from '../../../configs/abi/aave/DataProviderV2.json';
import AaveIncentiveControllerV2Abi from '../../../configs/abi/aave/IncentiveControllerV2.json';
import AaveLendingPoolV2Abi from '../../../configs/abi/aave/LendingPoolV2.json';
import { RAY_DECIMALS, YEAR } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ActivityAction, ActivityActions, TokenValueItem } from '../../../types/collectors/base';
import { CrossLendingReserveDataState, CrossLendingReserveDataTimeframe } from '../../../types/collectors/crossLending';
import {
  GetAdapterDataStateOptions,
  GetAdapterDataStateResult,
  GetAdapterDataTimeframeOptions,
  GetAdapterDataTimeframeResult,
  GetAdapterEventLogsOptions,
  TransformEventLogOptions,
  TransformEventLogResult,
} from '../../../types/collectors/options';
import { DataMetrics, ProtocolConfig } from '../../../types/configs';
import { ContextServices } from '../../../types/namespaces';
import ProtocolAdapter from '../adapter';
import { countCrossLendingDataFromActivities } from '../helpers';
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

    const eventSignatures: AaveEventInterfaces = this.abiConfigs.eventSignatures;
    for (const log of options.logs) {
      const signature = log.topics[0];
      const address = normalizeAddress(log.address);

      if (
        Object.values(this.abiConfigs.eventSignatures).indexOf(signature) !== -1 &&
        compareAddress(options.config.address, address)
      ) {
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
            if (signature === eventSignatures.Deposit || signature === eventSignatures.Borrow) {
              user = normalizeAddress(event.args.onBehalfOf.toString());
            } else if (signature === eventSignatures.Withdraw) {
              user = normalizeAddress(event.args.to.toString());
            } else if (signature === eventSignatures.Repay) {
              user = normalizeAddress(event.args.repayer.toString());
            }

            const amount = formatBigNumberToString(event.args.amount.toString(), reserve.decimals);

            result.activities.push({
              chain: options.chain,
              protocol: this.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: log.logIndex.toString(),
              blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
              timestamp: log.timestamp,
              action: action,
              user: user,
              token: reserve,
              tokenAmount: amount,
            });
          }
        } else {
          // on LiquidationCall event, we conduct 2 activities
          // the first one logIndex:0 is the debt repay activity
          // the second one logIndex:1 is the liquidate activity
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
            const amount = formatBigNumberToString(event.args.debtToCover.toString(), reserve.decimals);
            const collateralAmount = formatBigNumberToString(
              event.args.liquidatedCollateralAmount.toString(),
              collateral.decimals,
            );

            // debt cover repay activity
            result.activities.push({
              chain: options.chain,
              protocol: this.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: `${log.logIndex.toString()}:0`,
              blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
              timestamp: log.timestamp,
              action: ActivityActions.repay,
              user: user,
              token: reserve,
              tokenAmount: amount,
            });

            // liquidation activity
            result.activities.push({
              chain: options.chain,
              protocol: this.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: `${log.logIndex.toString()}:1`,
              blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
              timestamp: log.timestamp,
              action: ActivityActions.liquidate,
              user: user,
              token: collateral,
              tokenAmount: collateralAmount,
            });
          }
        }
      }
    }

    return result;
  }

  public async getDataState(options: GetAdapterDataStateOptions): Promise<GetAdapterDataStateResult> {
    const result: GetAdapterDataStateResult = {
      crossLending: [],
      cdpLending: null,
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

      const dataState: CrossLendingReserveDataState = {
        metric: DataMetrics.crossLending,
        chain: marketConfig.chain,
        protocol: marketConfig.protocol,
        address: normalizeAddress(marketConfig.address),
        timestamp: options.timestamp,

        token: token,
        tokenPrice: tokenPrice ? tokenPrice : '0',

        totalDeposited: formatBigNumberToString(totalDeposited, token.decimals),
        totalBorrowed: formatBigNumberToString(totalBorrowed.variable, token.decimals),
        totalBorrowedStable: formatBigNumberToString(totalBorrowed.stable, token.decimals),

        rateSupply: rates.supply,
        rateBorrow: rates.borrow,
        rateBorrowStable: rates.borrowStable,
        rateLoanToValue: this.getLoanToValueRate(reserveConfigData),

        rateRewardSupply: rewardRateForSupply,
        rateRewardBorrow: rewardRateForBorrow,
        rateRewardBorrowStable: rewardRateForBorrowStable,
      };

      if (result.crossLending) {
        result.crossLending.push(dataState);
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
    ).crossLending;

    const result: GetAdapterDataTimeframeResult = {
      crossLending: [],
      cdpLending: null,
    };

    if (!states) {
      return result;
    }

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

    for (const stateData of states) {
      const documents = activities.filter(
        (activity) =>
          activity.chain === stateData.chain &&
          activity.protocol === stateData.protocol &&
          activity.address === stateData.address &&
          activity.token.address === stateData.token.address,
      );

      const activityData = countCrossLendingDataFromActivities(documents);

      const snapshotData: CrossLendingReserveDataTimeframe = {
        ...stateData,
        ...activityData,

        timefrom: options.fromTime,
        timeto: options.toTime,
      };

      if (result.crossLending) {
        result.crossLending.push(snapshotData);
      }
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

  // return amount of token rewards in one year
  // based on current emission
  protected async getIncentiveRewards(
    config: AaveLendingMarketConfig,
    reserve: string,
    blockNumber: number,
  ): Promise<{
    forSupply: Array<TokenValueItem>;
    forBorrow: Array<TokenValueItem>;
    forBorrowStable: Array<TokenValueItem>;
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
    } as TokenValueItem);

    rewards.forBorrow.push({
      token: rewardToken,
      amount: formatBigNumberToString(rewardForBorrow.toString(10), rewardToken.decimals),
    } as TokenValueItem);

    rewards.forBorrowStable.push({
      token: rewardToken,
      amount: formatBigNumberToString(rewardForBorrowStable.toString(10), rewardToken.decimals),
    } as TokenValueItem);

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
