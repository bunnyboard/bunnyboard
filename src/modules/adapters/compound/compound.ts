import BigNumber from 'bignumber.js';

import { ProtocolConfigs } from '../../../configs';
import CompoundComptrollerAbi from '../../../configs/abi/compound/Comptroller.json';
import cErc20Abi from '../../../configs/abi/compound/cErc20.json';
import { ChainBlockPeriods, DAY, YEAR } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { CompoundLendingMarketConfig, CompoundProtocolConfig } from '../../../configs/protocols/compound';
import logger from '../../../lib/logger';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { formatFromDecimals, getDateString, normalizeAddress } from '../../../lib/utils';
import { LendingMarketConfig, ProtocolConfig } from '../../../types/configs';
import { TokenRewardEntry } from '../../../types/domains/base';
import { LendingCdpSnapshot, LendingMarketSnapshot } from '../../../types/domains/lending';
import { ContextServices } from '../../../types/namespaces';
import { GetLendingMarketSnapshotOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import { CompoundEventAbiMappings, CompoundEventSignatures } from './abis';

export interface CompoundMarketRates {
  borrowRate: string;
  supplyRate: string;
}

export interface CompoundMarketRewards {
  lenderTokenRewards: Array<TokenRewardEntry>;
  borrowerTokenRewards: Array<TokenRewardEntry>;
}

export default class CompoundAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.compound';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = CompoundEventSignatures;
    this.abiConfigs.eventAbiMappings = CompoundEventAbiMappings;
  }

  protected async getMarketRates(config: LendingMarketConfig, blockNumber: number): Promise<CompoundMarketRates> {
    const supplyRatePerBlock = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: cErc20Abi,
      target: config.address,
      method: 'supplyRatePerBlock',
      params: [],
      blockNumber,
    });
    const borrowRatePerBlock = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: cErc20Abi,
      target: config.address,
      method: 'borrowRatePerBlock',
      params: [],
      blockNumber,
    });

    const supplyRate = new BigNumber(supplyRatePerBlock ? supplyRatePerBlock : '0').multipliedBy(
      Math.floor(YEAR / ChainBlockPeriods[config.chain]),
    );
    const borrowRate = new BigNumber(borrowRatePerBlock).multipliedBy(
      Math.floor(YEAR / ChainBlockPeriods[config.chain]),
    );

    return {
      supplyRate: formatFromDecimals(supplyRate.toString(10), 18),
      borrowRate: formatFromDecimals(borrowRate.toString(10), 18),
    };
  }

  protected async getMarketRewardsSpeed(
    config: LendingMarketConfig,
    blockNumber: number,
  ): Promise<{
    supplySpeed: string;
    borrowSpeed: string;
  } | null> {
    // compound rewards were calculated based on supply and borrow speeds
    const comptroller = ProtocolConfigs[config.protocol]
      ? (ProtocolConfigs[config.protocol] as CompoundProtocolConfig).comptrollers[config.chain]
      : null;
    if (comptroller) {
      const supplySpeed = await this.services.blockchain.readContract({
        chain: config.chain,
        abi: CompoundComptrollerAbi,
        target: comptroller.address,
        method: 'compSupplySpeeds',
        params: [config.address],
        blockNumber: blockNumber,
      });
      const borrowSpeed = await this.services.blockchain.readContract({
        chain: config.chain,
        abi: CompoundComptrollerAbi,
        target: comptroller.address,
        method: 'compBorrowSpeeds',
        params: [config.address],
        blockNumber: blockNumber,
      });

      if (supplySpeed && borrowSpeed) {
        return {
          supplySpeed: supplySpeed.toString(),
          borrowSpeed: borrowSpeed.toString(),
        };
      }
    }

    return null;
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
      const speeds = await this.getMarketRewardsSpeed(config, startDayBlock);

      if (speeds) {
        const rewardAmountForLender = new BigNumber(speeds.supplySpeed.toString()).multipliedBy(numberOfBlocks);
        const rewardAmountForBorrower = new BigNumber(speeds.borrowSpeed.toString()).multipliedBy(numberOfBlocks);

        const tokenPrice = await this.services.oracle.getTokenPriceUsd({
          chain: config.chain,
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

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot | LendingCdpSnapshot> | null> {
    const marketConfig = options.config as CompoundLendingMarketConfig;

    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[marketConfig.chain].blockSubgraph,
      options.timestamp,
    );
    if (blockNumber === 0) {
      return null;
    }

    const snapshots: Array<LendingMarketSnapshot> = [];

    const totalCash = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: cErc20Abi,
      target: marketConfig.address,
      method: 'getCash',
      params: [],
      blockNumber,
    });
    const totalBorrows = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: cErc20Abi,
      target: marketConfig.address,
      method: 'totalBorrows',
      params: [],
      blockNumber,
    });
    const totalReserves = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: cErc20Abi,
      target: marketConfig.address,
      method: 'totalReserves',
      params: [],
      blockNumber,
    });

    // get market rates
    const { supplyRate, borrowRate } = await this.getMarketRates(options.config, blockNumber);

    const totalDeposited = new BigNumber(totalCash.toString())
      .plus(new BigNumber(totalBorrows.toString()))
      .minus(new BigNumber(totalReserves.toString()));
    const totalBorrowed = new BigNumber(totalBorrows.toString());
    const totalFeesCollected = totalDeposited.multipliedBy(new BigNumber(borrowRate)).dividedBy(365);

    const token = (options.config as CompoundLendingMarketConfig).underlying;
    const tokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: token.chain,
      address: token.address,
      timestamp: options.timestamp,
    });

    const rewards = await this.getMarketRewards(options.config, options.timestamp);

    snapshots.push({
      type: 'cross',
      chain: marketConfig.chain,
      protocol: marketConfig.protocol,
      address: normalizeAddress(marketConfig.address),
      timestamp: options.timestamp,

      token: token,
      tokenPrice: tokenPrice ? tokenPrice : '0',

      totalDeposited: formatFromDecimals(totalDeposited.toString(10), token.decimals),
      totalBorrowed: formatFromDecimals(totalBorrowed.toString(10), token.decimals),
      totalFeesCollected: formatFromDecimals(totalFeesCollected.toString(10), token.decimals),

      supplyRate: supplyRate,
      borrowRate: borrowRate,

      rewardForLenders: rewards.lenderTokenRewards,
      rewardForBorrowers: rewards.borrowerTokenRewards,
    });

    logger.info('updated lending market snapshot', {
      service: this.name,
      protocol: this.config.protocol,
      chain: marketConfig.chain,
      version: marketConfig.version,
      token: `${token.symbol}:${token.address}`,
      date: getDateString(options.timestamp),
    });

    return snapshots;
  }
}
