import BigNumber from 'bignumber.js';

import { ProtocolConfigs } from '../../../configs';
import BenqiComptrollerAbi from '../../../configs/abi/benqi/BenqiComptroller.json';
import qiTokenAbi from '../../../configs/abi/benqi/qiToken.json';
import { AddressZero, DAY, YEAR } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { CompoundProtocolConfig } from '../../../configs/protocols/compound';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { formatFromDecimals } from '../../../lib/utils';
import { LendingMarketConfig, ProtocolConfig } from '../../../types/configs';
import { ContextServices } from '../../../types/namespaces';
import CompoundAdapter, { CompoundMarketRates, CompoundMarketRewards } from '../compound/compound';

export default class BenqiAdapter extends CompoundAdapter {
  public readonly name: string = 'adapter.benqi';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);
  }

  protected async getMarketRates(config: LendingMarketConfig, blockNumber: number): Promise<CompoundMarketRates> {
    const supplyRatePerTimestamp = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: qiTokenAbi,
      target: config.address,
      method: 'supplyRatePerTimestamp',
      params: [],
      blockNumber,
    });
    const borrowRatePerTimestamp = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: qiTokenAbi,
      target: config.address,
      method: 'borrowRatePerTimestamp',
      params: [],
      blockNumber,
    });

    const supplyRate = new BigNumber(supplyRatePerTimestamp ? supplyRatePerTimestamp : '0').multipliedBy(
      Math.floor(YEAR),
    );
    const borrowRate = new BigNumber(borrowRatePerTimestamp ? borrowRatePerTimestamp : '0').multipliedBy(
      Math.floor(YEAR),
    );

    return {
      supplyRate: formatFromDecimals(supplyRate.toString(10), 18),
      borrowRate: formatFromDecimals(borrowRate.toString(10), 18),
    };
  }

  protected async getMarketRewards(config: LendingMarketConfig, timestamp: number): Promise<CompoundMarketRewards> {
    const rewards: CompoundMarketRewards = {
      lenderTokenRewards: [],
      borrowerTokenRewards: [],
    };

    // compound rewards were calculated based on supply and borrow speeds
    const comptroller = ProtocolConfigs[config.protocol]
      ? (ProtocolConfigs[config.protocol] as CompoundProtocolConfig).comptrollers[config.chain]
      : null;

    if (comptroller) {
      const startDayBlock = await tryQueryBlockNumberAtTimestamp(
        EnvConfig.blockchains[config.chain].blockSubgraph,
        timestamp,
      );
      const endDayBlock = await tryQueryBlockNumberAtTimestamp(
        EnvConfig.blockchains[config.chain].blockSubgraph,
        timestamp + DAY - 1,
      );

      const numberOfBlocks = endDayBlock - startDayBlock;

      const supplyRewardSpeedAvax = await this.services.blockchain.readContract({
        chain: comptroller.chain,
        abi: BenqiComptrollerAbi,
        target: comptroller.address,
        method: 'supplyRewardSpeeds',
        params: [0, config.address],
        blockNumber: startDayBlock,
      });
      const borrowRewardSpeedAvax = await this.services.blockchain.readContract({
        chain: comptroller.chain,
        abi: BenqiComptrollerAbi,
        target: comptroller.address,
        method: 'borrowRewardSpeeds',
        params: [0, config.address],
        blockNumber: startDayBlock,
      });
      const supplyRewardSpeedQi = await this.services.blockchain.readContract({
        chain: comptroller.chain,
        abi: BenqiComptrollerAbi,
        target: comptroller.address,
        method: 'supplyRewardSpeeds',
        params: [1, config.address],
        blockNumber: startDayBlock,
      });
      const borrowRewardSpeedQi = await this.services.blockchain.readContract({
        chain: comptroller.chain,
        abi: BenqiComptrollerAbi,
        target: comptroller.address,
        method: 'borrowRewardSpeeds',
        params: [1, config.address],
        blockNumber: startDayBlock,
      });

      if (supplyRewardSpeedAvax && borrowRewardSpeedAvax) {
        const rewardAmountForLender = new BigNumber(supplyRewardSpeedAvax.toString()).multipliedBy(numberOfBlocks);
        const rewardAmountForBorrower = new BigNumber(borrowRewardSpeedAvax.toString()).multipliedBy(numberOfBlocks);

        const tokenPrice = await this.services.oracle.getTokenPriceUsd({
          chain: comptroller.chain,
          address: AddressZero, // Native AVAX
          timestamp: timestamp,
        });
        rewards.lenderTokenRewards.push({
          token: {
            chain: 'avalanche',
            symbol: 'AVAX',
            decimals: 18,
            address: AddressZero,
          },
          tokenPrice: tokenPrice ? tokenPrice : '0',
          tokenAmount: formatFromDecimals(rewardAmountForLender.toString(10), 18),
        });
        rewards.borrowerTokenRewards.push({
          token: {
            chain: 'avalanche',
            symbol: 'AVAX',
            decimals: 18,
            address: AddressZero,
          },
          tokenPrice: tokenPrice ? tokenPrice : '0',
          tokenAmount: formatFromDecimals(rewardAmountForBorrower.toString(10), 18),
        });
      }
      if (supplyRewardSpeedQi && borrowRewardSpeedQi) {
        const rewardAmountForLender = new BigNumber(supplyRewardSpeedQi.toString()).multipliedBy(numberOfBlocks);
        const rewardAmountForBorrower = new BigNumber(borrowRewardSpeedQi.toString()).multipliedBy(numberOfBlocks);

        const tokenPrice = await this.services.oracle.getTokenPriceUsd({
          chain: comptroller.chain,
          address: comptroller.governanceToken.address,
          timestamp: timestamp,
        });
        rewards.lenderTokenRewards.push({
          token: comptroller.governanceToken,
          tokenPrice: tokenPrice ? tokenPrice : '0',
          tokenAmount: formatFromDecimals(rewardAmountForLender.toString(10), comptroller.governanceToken.decimals),
        });
        rewards.borrowerTokenRewards.push({
          token: comptroller.governanceToken,
          tokenPrice: tokenPrice ? tokenPrice : '0',
          tokenAmount: formatFromDecimals(rewardAmountForBorrower.toString(10), comptroller.governanceToken.decimals),
        });
      }
    }

    return rewards;
  }
}
