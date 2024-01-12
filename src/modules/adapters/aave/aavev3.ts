import BigNumber from 'bignumber.js';

import AaveDataProviderV3Abi from '../../../configs/abi/aave/DataProviderV3.json';
import AaveIncentiveControllerV3Abi from '../../../configs/abi/aave/IncentiveControllerV3.json';
import AaveLendingPoolV3Abi from '../../../configs/abi/aave/LendingPoolV3.json';
import { RAY_DECIMALS, YEAR } from '../../../configs/constants';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import { formatBigNumberToString } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { TokenAmountEntry } from '../../../types/domains/base';
import { ContextServices } from '../../../types/namespaces';
import Aavev2Adapter, { AaveMarketRates } from './aavev2';
import { Aavev3EventSignatures } from './abis';

export default class Aavev3Adapter extends Aavev2Adapter {
  public readonly name: string = 'adapter.aavev3';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = Aavev3EventSignatures;
    this.abiConfigs.eventAbis = {
      lendingPool: AaveLendingPoolV3Abi,
      dataProvider: AaveDataProviderV3Abi,
      incentiveController: AaveIncentiveControllerV3Abi,
    };
  }

  // return total deposited (in wei)
  protected getTotalDeposited(reserveData: any): string {
    return new BigNumber(reserveData[2].toString()).toString(10);
  }

  // return total borrowed (in wei)
  protected getTotalBorrowed(reserveData: any): {
    stable: string;
    variable: string;
  } {
    return {
      stable: reserveData[3].toString(),
      variable: reserveData[4].toString(),
    };
  }

  protected getMarketRates(reserveData: any): AaveMarketRates {
    return {
      supply: formatBigNumberToString(reserveData[5].toString(), RAY_DECIMALS),
      borrow: formatBigNumberToString(reserveData[6].toString(), RAY_DECIMALS),
      borrowStable: formatBigNumberToString(reserveData[7].toString(), RAY_DECIMALS),
    };
  }

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

    // get reward token list
    const rewardsList = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: this.abiConfigs.eventAbis.incentiveController,
      target: config.incentiveController,
      method: 'getRewardsList',
      params: [],
      blockNumber: blockNumber,
    });
    if (!rewardsList || rewardsList.length === 0) {
      return null;
    }

    let rewardForSupply = new BigNumber(0);
    let rewardForBorrow = new BigNumber(0);
    let rewardForBorrowStable = new BigNumber(0);

    for (const rewardTokenAddress of rewardsList) {
      const rewardToken = await this.services.blockchain.getTokenInfo({
        chain: config.chain,
        address: rewardTokenAddress,
      });
      if (rewardToken) {
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
            target: config.incentiveController,
            method: 'getRewardsData',
            params: [reserveTokensAddresses[0], rewardTokenAddress],
            blockNumber: blockNumber,
          });
          const stableDebtAssetInfo = await this.services.blockchain.readContract({
            chain: config.chain,
            abi: AaveIncentiveControllerV3Abi,
            target: config.incentiveController,
            method: 'getRewardsData',
            params: [reserveTokensAddresses[1]],
            blockNumber: blockNumber,
          });
          const variableDebtAssetInfo = await this.services.blockchain.readContract({
            chain: config.chain,
            abi: AaveIncentiveControllerV3Abi,
            target: config.incentiveController,
            method: 'getRewardsData',
            params: [reserveTokensAddresses[2]],
            blockNumber: blockNumber,
          });

          if (aTokenAssetInfo) {
            rewardForSupply = rewardForSupply.plus(new BigNumber(aTokenAssetInfo[0].toString())).multipliedBy(YEAR);
          }
          if (variableDebtAssetInfo) {
            rewardForBorrow = rewardForBorrow
              .plus(new BigNumber(variableDebtAssetInfo[0].toString()))
              .multipliedBy(YEAR);
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
        }
      }
    }

    return rewards;
  }
}
