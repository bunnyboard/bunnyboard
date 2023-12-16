import BigNumber from 'bignumber.js';

import AaveDataProviderV3Abi from '../../../configs/abi/aave/DataProviderV3.json';
import AaveIncentiveControllerV3Abi from '../../../configs/abi/aave/IncentiveControllerV3.json';
import { DAY, ONE_RAY, RAY_DECIMALS } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { formatFromDecimals } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { ContextServices } from '../../../types/namespaces';
import { AaveMarketRates, AaveMarketRewards } from './aavev1';
import Aavev2Adapter from './aavev2';
import { Aavev3EventAbiMappings, Aavev3EventSignatures } from './abis';

export default class Aavev3Adapter extends Aavev2Adapter {
  public readonly name: string = 'adapter.aavev3';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = Aavev3EventSignatures;
    this.abiConfigs.eventAbiMappings = Aavev3EventAbiMappings;
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
}
