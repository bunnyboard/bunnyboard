import BigNumber from 'bignumber.js';

import AaveDataProviderV3Abi from '../../../configs/abi/aave/DataProviderV3.json';
import AaveIncentiveControllerV3Abi from '../../../configs/abi/aave/IncentiveControllerV3.json';
import { DAY } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { formatFromDecimals } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { TokenRewardEntry } from '../../../types/domains';
import { ContextServices } from '../../../types/namespaces';
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
    return await this.services.blockchain.singlecall({
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
    return new BigNumber(reserveData.totalAToken.toString()).toString(10);
  }

  // return total borrowed (in wei)
  protected getTotalBorrowed(reserveData: any): string {
    const totalBorrowed = new BigNumber(reserveData.totalStableDebt.toString()).plus(
      new BigNumber(reserveData.totalVariableDebt.toString()),
    );

    return totalBorrowed.toString(10);
  }

  protected async getIncentiveRewards(
    config: AaveLendingMarketConfig,
    reserve: string,
    timestamp: number,
  ): Promise<Array<TokenRewardEntry>> {
    const tokenRewards: Array<TokenRewardEntry> = [];

    const incentiveController = (config as AaveLendingMarketConfig).incentiveController;
    if (incentiveController) {
      const blockNumber = await tryQueryBlockNumberAtTimestamp(
        EnvConfig.blockchains[config.chain].blockSubgraph,
        timestamp,
      );

      // get reward token list
      const rewardsList = await this.services.blockchain.singlecall({
        chain: config.chain,
        abi: AaveIncentiveControllerV3Abi,
        target: incentiveController.address,
        method: 'getRewardsList',
        params: [],
        blockNumber: blockNumber,
      });
      if (!rewardsList || rewardsList.length === 0) {
        return [];
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

          const reserveTokensAddresses = await this.services.blockchain.singlecall({
            chain: config.chain,
            target: config.dataProvider,
            abi: AaveDataProviderV3Abi,
            method: 'getReserveTokensAddresses',
            params: [reserve],
          });
          if (reserveTokensAddresses) {
            const aTokenAssetInfo = await this.services.blockchain.singlecall({
              chain: config.chain,
              abi: AaveIncentiveControllerV3Abi,
              target: incentiveController.address,
              method: 'getRewardsData',
              params: [reserveTokensAddresses.aTokenAddress, rewardTokenAddress],
              blockNumber: blockNumber,
            });
            const stableDebtAssetInfo = await this.services.blockchain.singlecall({
              chain: config.chain,
              abi: AaveIncentiveControllerV3Abi,
              target: incentiveController.address,
              method: 'getRewardsData',
              params: [reserveTokensAddresses.stableDebtTokenAddress],
              blockNumber: blockNumber,
            });
            const variableDebtAssetInfo = await this.services.blockchain.singlecall({
              chain: config.chain,
              abi: AaveIncentiveControllerV3Abi,
              target: incentiveController.address,
              method: 'getRewardsData',
              params: [reserveTokensAddresses.variableDebtTokenAddress],
              blockNumber: blockNumber,
            });

            const endDayTimestamp = timestamp + DAY - 1;
            let rewardAmount = new BigNumber(0);

            if (aTokenAssetInfo) {
              rewardAmount = rewardAmount
                .plus(new BigNumber(aTokenAssetInfo.emissionPerSecond.toString()))
                .multipliedBy(endDayTimestamp - timestamp);
            }
            if (stableDebtAssetInfo) {
              rewardAmount = rewardAmount
                .plus(new BigNumber(stableDebtAssetInfo.emissionPerSecond.toString()))
                .multipliedBy(endDayTimestamp - timestamp);
            }
            if (variableDebtAssetInfo) {
              rewardAmount = rewardAmount
                .plus(new BigNumber(variableDebtAssetInfo.emissionPerSecond.toString()))
                .multipliedBy(endDayTimestamp - timestamp);
            }

            tokenRewards.push({
              token: rewardToken,
              tokenAmount: formatFromDecimals(rewardAmount.toString(10), rewardToken.decimals),
              tokenPrice: rewardTokenPrice ? rewardTokenPrice : '0',
            });
          }
        }
      }
    }

    return tokenRewards;
  }
}
