import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import AaveDataProviderV3Abi from '../../../configs/abi/aave/DataProviderV3.json';
import AaveIncentiveControllerV3Abi from '../../../configs/abi/aave/IncentiveControllerV3.json';
import AaveLendingPoolV3Abi from '../../../configs/abi/aave/LendingPoolV3.json';
import { DAY, ONE_RAY, RAY_DECIMALS } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { formatFromDecimals, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { LendingActivityAction } from '../../../types/domains/base';
import { LendingActivityEvent } from '../../../types/domains/lending';
import { ContextServices } from '../../../types/namespaces';
import { AaveMarketRates, AaveMarketRewards } from './aavev1';
import Aavev2Adapter from './aavev2';
import { AaveEventInterfaces, Aavev3EventSignatures } from './abis';

export default class Aavev3Adapter extends Aavev2Adapter {
  public readonly name: string = 'adapter.aavev3';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = Aavev3EventSignatures;
  }

  protected async getReserveData(config: AaveLendingMarketConfig, reserve: string, blockNumber: number): Promise<any> {
    return await this.services.blockchain.readContract({
      chain: config.chain,
      abi: AaveDataProviderV3Abi,
      target: config.dataProvider,
      method: 'getReserveData',
      params: [reserve],
      blockNumber,
    });
  }

  // return total deposited (in wei)
  protected getTotalDeposited(reserveData: any): string {
    return new BigNumber(reserveData[2].toString()).toString(10);
  }

  // return total borrowed (in wei)
  protected getTotalBorrowed(reserveData: any): string {
    const totalBorrowed = new BigNumber(reserveData[2].toString()).plus(new BigNumber(reserveData[4].toString()));

    return totalBorrowed.toString(10);
  }

  // return total borrowed (in wei)
  protected getTotalFeesCollected(reserveData: any): string {
    const totalBorrowStable = new BigNumber(reserveData[3].toString());
    const totalBorrowVariable = new BigNumber(reserveData[4].toString());

    const borrowRateStable = new BigNumber(reserveData[7].toString());
    const borrowRateVariable = new BigNumber(reserveData[6].toString());

    const feesCollectedStable = totalBorrowStable.multipliedBy(borrowRateStable).dividedBy(ONE_RAY).dividedBy(365);
    const feesCollectedVariable = totalBorrowVariable
      .multipliedBy(borrowRateVariable)
      .dividedBy(ONE_RAY)
      .dividedBy(365);

    return feesCollectedStable.plus(feesCollectedVariable).toString(10);
  }

  protected getMarketRates(reserveData: any): AaveMarketRates {
    return {
      supply: formatFromDecimals(reserveData[5].toString(), RAY_DECIMALS),
      borrow: formatFromDecimals(reserveData[6].toString(), RAY_DECIMALS),
      borrowStable: formatFromDecimals(reserveData[7].toString(), RAY_DECIMALS),
    };
  }

  protected async getIncentiveRewards(
    config: AaveLendingMarketConfig,
    reserve: string,
    timestamp: number,
  ): Promise<AaveMarketRewards> {
    const tokenRewards: AaveMarketRewards = {
      rewardsForLenders: [],
      rewardsForBorrowers: [],
    };

    const incentiveController = (config as AaveLendingMarketConfig).incentiveController;
    if (incentiveController) {
      const blockNumber = await tryQueryBlockNumberAtTimestamp(
        EnvConfig.blockchains[config.chain].blockSubgraph,
        timestamp,
      );

      // get reward token list
      const rewardsList = await this.services.blockchain.readContract({
        chain: config.chain,
        abi: AaveIncentiveControllerV3Abi,
        target: incentiveController.address,
        method: 'getRewardsList',
        params: [],
        blockNumber: blockNumber,
      });
      if (!rewardsList || rewardsList.length === 0) {
        return tokenRewards;
      }

      for (const rewardTokenAddress of rewardsList) {
        const rewardToken = await this.services.blockchain.getTokenInfo({
          chain: config.chain,
          address: rewardTokenAddress,
        });
        if (rewardToken) {
          const rewardTokenPrice = await this.services.oracle.getTokenPriceUsd({
            chain: config.chain,
            address: rewardTokenAddress,
            timestamp: timestamp,
          });

          const reserveTokensAddresses = await this.services.blockchain.readContract({
            chain: config.chain,
            target: config.dataProvider,
            abi: AaveDataProviderV3Abi,
            method: 'getReserveTokensAddresses',
            params: [reserve],
          });
          if (reserveTokensAddresses) {
            const aTokenAssetInfo = await this.services.blockchain.readContract({
              chain: config.chain,
              abi: AaveIncentiveControllerV3Abi,
              target: incentiveController.address,
              method: 'getRewardsData',
              params: [reserveTokensAddresses[0], rewardTokenAddress],
              blockNumber: blockNumber,
            });
            const stableDebtAssetInfo = await this.services.blockchain.readContract({
              chain: config.chain,
              abi: AaveIncentiveControllerV3Abi,
              target: incentiveController.address,
              method: 'getRewardsData',
              params: [reserveTokensAddresses[1]],
              blockNumber: blockNumber,
            });
            const variableDebtAssetInfo = await this.services.blockchain.readContract({
              chain: config.chain,
              abi: AaveIncentiveControllerV3Abi,
              target: incentiveController.address,
              method: 'getRewardsData',
              params: [reserveTokensAddresses[2]],
              blockNumber: blockNumber,
            });

            const endDayTimestamp = timestamp + DAY - 1;
            let rewardForLender = new BigNumber(0);
            let rewardForBorrower = new BigNumber(0);

            if (aTokenAssetInfo) {
              rewardForLender = rewardForLender
                .plus(new BigNumber(aTokenAssetInfo[1].toString()))
                .multipliedBy(endDayTimestamp - timestamp);
            }
            if (stableDebtAssetInfo) {
              rewardForBorrower = rewardForBorrower
                .plus(new BigNumber(stableDebtAssetInfo[1].toString()))
                .multipliedBy(endDayTimestamp - timestamp);
            }
            if (variableDebtAssetInfo) {
              rewardForBorrower = rewardForBorrower
                .plus(new BigNumber(variableDebtAssetInfo[1].toString()))
                .multipliedBy(endDayTimestamp - timestamp);
            }

            tokenRewards.rewardsForLenders.push({
              token: rewardToken,
              tokenAmount: formatFromDecimals(rewardForLender.toString(10), rewardToken.decimals),
              tokenPrice: rewardTokenPrice ? rewardTokenPrice : '0',
            });
            tokenRewards.rewardsForBorrowers.push({
              token: rewardToken,
              tokenAmount: formatFromDecimals(rewardForBorrower.toString(10), rewardToken.decimals),
              tokenPrice: rewardTokenPrice ? rewardTokenPrice : '0',
            });
          }
        }
      }
    }

    return tokenRewards;
  }

  protected async transformEventLogs(
    config: AaveLendingMarketConfig,
    logs: Array<any>,
  ): Promise<Array<LendingActivityEvent>> {
    const activities: Array<LendingActivityEvent> = [];

    const eventSignatures: AaveEventInterfaces = this.abiConfigs.eventSignatures;
    for (const log of logs) {
      const signature = log.topics[0];
      if (Object.values(eventSignatures).indexOf(signature) !== -1) {
        const event: any = decodeEventLog({
          abi: AaveLendingPoolV3Abi,
          data: log.data,
          topics: log.topics,
        });

        if (signature !== eventSignatures.Liquidate) {
          const reserve = await this.services.blockchain.getTokenInfo({
            chain: config.chain,
            address: event.args.reserve.toString(),
          });
          if (reserve) {
            let action: LendingActivityAction = 'deposit';
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

            const amount = formatFromDecimals(event.args.amount.toString(), reserve.decimals);

            activities.push({
              chain: config.chain,
              protocol: this.config.protocol,
              address: config.address,
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
            chain: config.chain,
            address: event.args.debtAsset.toString(),
          });
          const collateral = await this.services.blockchain.getTokenInfo({
            chain: config.chain,
            address: event.args.collateralAsset.toString(),
          });

          if (reserve && collateral) {
            const user = normalizeAddress(event.args.liquidator.toString());
            const borrower = normalizeAddress(event.args.user.toString());
            const amount = formatFromDecimals(event.args.debtToCover.toString(), reserve.decimals);

            const collateralAmount = formatFromDecimals(
              event.args.liquidatedCollateralAmount.toString(),
              collateral.decimals,
            );
            activities.push({
              chain: config.chain,
              protocol: this.config.protocol,
              address: config.address,
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

    return activities;
  }
}
