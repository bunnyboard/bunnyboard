import BigNumber from 'bignumber.js';

import AaveDataProviderV2Abi from '../../../configs/abi/aave/DataProviderV2.json';
import AaveIncentiveControllerV2Abi from '../../../configs/abi/aave/IncentiveControllerV2.json';
import AaveLendingPoolV2Abi from '../../../configs/abi/aave/LendingPoolV2.json';
import { DAY } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { formatFromDecimals } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { ContextServices } from '../../../types/namespaces';
import Aavev1Adapter, { AaveMarketRewards } from './aavev1';
import { Aavev2EventAbiMappings, Aavev2EventSignatures } from './abis';

export default class Aavev2Adapter extends Aavev1Adapter {
  public readonly name: string = 'adapter.aavev2';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = Aavev2EventSignatures;
    this.abiConfigs.eventAbiMappings = Aavev2EventAbiMappings;
  }

  // return total deposited (in wei)
  protected getTotalDeposited(reserveData: any): string {
    const totalBorrowed = new BigNumber(reserveData.totalStableDebt.toString()).plus(
      new BigNumber(reserveData.totalVariableDebt.toString()),
    );
    return new BigNumber(reserveData.availableLiquidity.toString()).plus(totalBorrowed).toString(10);
  }

  // return total borrowed (in wei)
  protected getTotalBorrowed(reserveData: any): string {
    const totalBorrowed = new BigNumber(reserveData.totalStableDebt.toString()).plus(
      new BigNumber(reserveData.totalVariableDebt.toString()),
    );

    return totalBorrowed.toString(10);
  }

  protected async getReservesList(config: AaveLendingMarketConfig, blockNumber: number): Promise<any> {
    return await this.services.blockchain.singlecall({
      chain: config.chain,
      abi: AaveLendingPoolV2Abi,
      target: config.address,
      method: 'getReservesList',
      params: [],
      blockNumber,
    });
  }

  protected async getReserveData(config: AaveLendingMarketConfig, reserve: string, blockNumber: number): Promise<any> {
    return await this.services.blockchain.singlecall({
      chain: config.chain,
      abi: AaveDataProviderV2Abi,
      target: config.dataProvider,
      method: 'getReserveData',
      params: [reserve],
      blockNumber,
    });
  }

  protected async getIncentiveRewards(
    config: AaveLendingMarketConfig,
    reserve: string,
    timestamp: number,
  ): Promise<AaveMarketRewards> {
    const rewards: AaveMarketRewards = {
      rewardsForLenders: [],
      rewardsForBorrowers: [],
    };

    const incentiveController = (config as AaveLendingMarketConfig).incentiveController;
    if (incentiveController) {
      // we calculate reward emission in a period of time

      const blockNumber = await tryQueryBlockNumberAtTimestamp(
        EnvConfig.blockchains[config.chain].blockSubgraph,
        timestamp,
      );

      // first, we need to get aToken address and debtTokenAddress for the given reserve
      const reserveTokensAddresses = await this.services.blockchain.singlecall({
        chain: config.chain,
        abi: AaveDataProviderV2Abi,
        target: config.dataProvider,
        method: 'getReserveTokensAddresses',
        params: [reserve],
        blockNumber: blockNumber,
      });
      if (reserveTokensAddresses) {
        const aTokenAssetInfo = await this.services.blockchain.singlecall({
          chain: config.chain,
          abi: AaveIncentiveControllerV2Abi,
          target: incentiveController.address,
          method: 'assets',
          params: [reserveTokensAddresses.aTokenAddress],
          blockNumber: blockNumber,
        });
        const stableDebtAssetInfo = await this.services.blockchain.singlecall({
          chain: config.chain,
          abi: AaveIncentiveControllerV2Abi,
          target: incentiveController.address,
          method: 'assets',
          params: [reserveTokensAddresses.stableDebtTokenAddress],
          blockNumber: blockNumber,
        });
        const variableDebtAssetInfo = await this.services.blockchain.singlecall({
          chain: config.chain,
          abi: AaveIncentiveControllerV2Abi,
          target: incentiveController.address,
          method: 'assets',
          params: [reserveTokensAddresses.variableDebtTokenAddress],
          blockNumber: blockNumber,
        });

        const endDayTimestamp = timestamp + DAY - 1;
        let rewardForLenders = new BigNumber(0);
        let rewardForBorrowers = new BigNumber(0);

        if (aTokenAssetInfo) {
          rewardForLenders = rewardForLenders
            .plus(new BigNumber(aTokenAssetInfo.emissionPerSecond.toString()))
            .multipliedBy(endDayTimestamp - timestamp);
        }
        if (stableDebtAssetInfo) {
          rewardForBorrowers = rewardForBorrowers
            .plus(new BigNumber(stableDebtAssetInfo.emissionPerSecond.toString()))
            .multipliedBy(endDayTimestamp - timestamp);
        }
        if (variableDebtAssetInfo) {
          rewardForBorrowers = rewardForBorrowers
            .plus(new BigNumber(variableDebtAssetInfo.emissionPerSecond.toString()))
            .multipliedBy(endDayTimestamp - timestamp);
        }

        const tokenPrice = await this.services.oracle.getTokenPriceUsd({
          chain: config.chain,
          address: incentiveController.rewardTokens[0].address,
          timestamp,
        });

        // aave v2 has only one token incentive
        rewards.rewardsForLenders.push({
          token: incentiveController.rewardTokens[0],
          tokenAmount: formatFromDecimals(rewardForLenders.toString(10), incentiveController.rewardTokens[0].decimals),
          tokenPrice: tokenPrice ? tokenPrice : '0',
        });
        rewards.rewardsForBorrowers.push({
          token: incentiveController.rewardTokens[0],
          tokenAmount: formatFromDecimals(
            rewardForBorrowers.toString(10),
            incentiveController.rewardTokens[0].decimals,
          ),
          tokenPrice: tokenPrice ? tokenPrice : '0',
        });
      }
    }

    return rewards;
  }
}
