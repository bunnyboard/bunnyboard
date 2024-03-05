import BigNumber from 'bignumber.js';

import ChefIncentiveControllerAbi from '../../../configs/abi/radiant/ChefIncentiveController.json';
import { TimeUnits } from '../../../configs/constants';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import { formatBigNumberToString } from '../../../lib/utils';
import { TokenValueItem } from '../../../types/collectors/base';
import { ProtocolConfig, Token } from '../../../types/configs';
import { ContextServices } from '../../../types/namespaces';
import Aavev2Adapter from '../aave/aavev2';

const RadiantTokens: { [key: string]: Token } = {
  ethereum: {
    chain: 'ethereum',
    symbol: 'RDNT',
    decimals: 18,
    address: '0x137ddb47ee24eaa998a535ab00378d6bfa84f893',
  },
  arbitrum: {
    chain: 'arbitrum',
    symbol: 'RDNT',
    decimals: 18,
    address: '0x3082cc23568ea640225c2467653db90e9250aaa0',
  },
  bnbchain: {
    chain: 'bnbchain',
    symbol: 'RDNT',
    decimals: 18,
    address: '0xf7de7e8a6bd59ed41a4b5fe50278b3b7f31384df',
  },
};

export default class RadiantAdapter extends Aavev2Adapter {
  public readonly name: string = 'adapter.radiant';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);
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

    const rewardToken = RadiantTokens[config.chain];

    const totalAllocPoint = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: ChefIncentiveControllerAbi,
      target: config.incentiveController,
      method: 'totalAllocPoint',
      params: [],
      blockNumber: blockNumber,
    });
    const rewardsPerSecond = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: ChefIncentiveControllerAbi,
      target: config.incentiveController,
      method: 'rewardsPerSecond',
      params: [],
      blockNumber: blockNumber,
    });

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
      abi: ChefIncentiveControllerAbi,
      target: config.incentiveController,
      method: 'poolInfo',
      params: [reserveTokensAddresses[0]],
      blockNumber: blockNumber,
    });
    const variableDebtAssetInfo = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: ChefIncentiveControllerAbi,
      target: config.incentiveController,
      method: 'poolInfo',
      params: [reserveTokensAddresses[2]],
      blockNumber: blockNumber,
    });

    if (aTokenAssetInfo && variableDebtAssetInfo) {
      const rewardForSupply = new BigNumber(rewardsPerSecond.toString())
        .multipliedBy(TimeUnits.SecondsPerYear)
        .multipliedBy(new BigNumber(aTokenAssetInfo[1].toString())) // allocPoint
        .dividedBy(new BigNumber(totalAllocPoint));
      const rewardForBorrow = new BigNumber(rewardsPerSecond.toString())
        .multipliedBy(TimeUnits.SecondsPerYear)
        .multipliedBy(new BigNumber(variableDebtAssetInfo[1].toString())) // allocPoint
        .dividedBy(new BigNumber(totalAllocPoint));

      rewards.forSupply.push({
        token: rewardToken,
        amount: formatBigNumberToString(rewardForSupply.toString(10), rewardToken.decimals),
      } as TokenValueItem);

      rewards.forBorrow.push({
        token: rewardToken,
        amount: formatBigNumberToString(rewardForBorrow.toString(10), rewardToken.decimals),
      } as TokenValueItem);
    }

    return rewards;
  }
}
