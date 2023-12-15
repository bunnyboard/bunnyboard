import BigNumber from 'bignumber.js';

import AaveLendingPoolV1Abi from '../../../configs/abi/aave/LendingPoolV1.json';
import { ONE_RAY, RAY_DECIMALS } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import logger from '../../../lib/logger';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { formatFromDecimals, getDateString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { TokenRewardEntry } from '../../../types/domains/base';
import { LendingCdpSnapshot, LendingMarketSnapshot } from '../../../types/domains/lending';
import { ContextServices } from '../../../types/namespaces';
import { GetLendingMarketSnapshotOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import { Aavev1EventAbiMappings, Aavev1EventSignatures } from './abis';

export interface AaveMarketEventStats {
  volumeDeposited: string;
  volumeWithdrawn: string;
  volumeBorrowed: string;
  volumeRepaid: string;
  volumeLiquidated: string;
  counterLenders: number;
  counterBorrowers: number;
  counterLiquidators: number;
  countTransactions: number;
}

export interface AaveMarketRewards {
  rewardsForLenders: Array<TokenRewardEntry>;
  rewardsForBorrowers: Array<TokenRewardEntry>;
}

export default class Aavev1Adapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.aavev1';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = Aavev1EventSignatures;
    this.abiConfigs.eventAbiMappings = Aavev1EventAbiMappings;
  }

  // return total deposited (in wei)
  protected getTotalDeposited(reserveData: any): string {
    return reserveData.totalLiquidity.toString();
  }

  // return total borrowed (in wei)
  protected getTotalBorrowed(reserveData: any): string {
    const totalBorrowed = new BigNumber(reserveData.totalBorrowsStable.toString()).plus(
      new BigNumber(reserveData.totalBorrowsVariable.toString()),
    );

    return totalBorrowed.toString(10);
  }

  // return total borrowed (in wei)
  protected getTotalFeesCollected(reserveData: any): string {
    const totalBorrowStable = new BigNumber(reserveData.totalBorrowsStable.toString());
    const totalBorrowVariable = new BigNumber(reserveData.totalBorrowsVariable.toString());

    const borrowRateStable = new BigNumber(reserveData.stableBorrowRate.toString());
    const borrowRateVariable = new BigNumber(reserveData.variableBorrowRate.toString());

    const feesCollectedStable = totalBorrowStable.multipliedBy(borrowRateStable).dividedBy(ONE_RAY).dividedBy(365);
    const feesCollectedVariable = totalBorrowVariable
      .multipliedBy(borrowRateVariable)
      .dividedBy(ONE_RAY)
      .dividedBy(365);

    return feesCollectedStable.plus(feesCollectedVariable).toString(10);
  }

  protected async getReservesList(config: AaveLendingMarketConfig, blockNumber: number): Promise<any> {
    return await this.services.blockchain.singlecall({
      chain: config.chain,
      abi: AaveLendingPoolV1Abi,
      target: config.address,
      method: 'getReserves',
      params: [],
      blockNumber,
    });
  }

  protected async getReserveData(config: AaveLendingMarketConfig, reserve: string, blockNumber: number): Promise<any> {
    return await this.services.blockchain.singlecall({
      chain: config.chain,
      abi: AaveLendingPoolV1Abi,
      target: config.address,
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
    return {
      rewardsForLenders: [],
      rewardsForBorrowers: [],
    };
  }

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot | LendingCdpSnapshot> | null> {
    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );
    if (blockNumber === 0) {
      return null;
    }

    const marketConfig = options.config as AaveLendingMarketConfig;

    const snapshots: Array<LendingMarketSnapshot> = [];

    const reservesList: Array<any> = await this.getReservesList(marketConfig, blockNumber);

    for (const reserve of reservesList) {
      const token = await this.services.blockchain.getTokenInfo({
        chain: marketConfig.chain,
        address: reserve,
      });
      if (!token) {
        return null;
      }
      const tokenPrice = await this.services.oracle.getTokenPriceUsd({
        chain: token.chain,
        address: token.address,
        timestamp: options.timestamp,
      });

      const reserveData: any = await this.getReserveData(marketConfig, reserve, blockNumber);

      const totalBorrowed = this.getTotalBorrowed(reserveData);
      const totalDeposited = this.getTotalDeposited(reserveData);
      const totalFeesCollected = this.getTotalFeesCollected(reserveData);

      const tokenRewards = await this.getIncentiveRewards(marketConfig, reserve, options.timestamp);

      const snapshot: LendingMarketSnapshot = {
        type: 'cross',
        chain: marketConfig.chain,
        protocol: marketConfig.protocol,
        address: normalizeAddress(marketConfig.address),
        timestamp: options.timestamp,

        token: token,
        tokenPrice: tokenPrice ? tokenPrice : '0',

        totalDeposited: formatFromDecimals(totalDeposited, token.decimals),
        totalBorrowed: formatFromDecimals(totalBorrowed, token.decimals),
        totalFeesCollected: formatFromDecimals(totalFeesCollected, token.decimals),

        supplyRate: formatFromDecimals(reserveData.liquidityRate.toString(), RAY_DECIMALS),
        borrowRate: formatFromDecimals(reserveData.variableBorrowRate.toString(), RAY_DECIMALS),
        borrowRateStable: formatFromDecimals(reserveData.stableBorrowRate.toString(), RAY_DECIMALS),

        rewardForLenders: tokenRewards.rewardsForLenders,
        rewardForBorrowers: tokenRewards.rewardsForBorrowers,
      };

      snapshots.push(snapshot);

      logger.info('updated lending market snapshot', {
        service: this.name,
        protocol: this.config.protocol,
        chain: marketConfig.chain,
        version: marketConfig.version,
        token: `${token.symbol}:${token.address}`,
        date: getDateString(options.timestamp),
      });
    }

    return snapshots;
  }
}
