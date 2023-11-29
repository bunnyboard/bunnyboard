import BigNumber from 'bignumber.js';

import AaveLendingPoolV1Abi from '../../../configs/abi/aave/LendingPoolV1.json';
import EnvConfig from '../../../configs/envConfig';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import logger from '../../../lib/logger';
import { queryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { formatFromDecimals, getDateString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { LendingMarketSnapshot } from '../../../types/domains';
import { ContextServices } from '../../../types/namespaces';
import { GetLendingMarketSnapshotOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';

export default class Aavev1Adapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.aavev1';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);
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

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot> | null> {
    const blockNumber = await queryBlockNumberAtTimestamp(
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

      const reserveData: any = await this.getReserveData(marketConfig, reserve, blockNumber);

      const totalBorrowed = this.getTotalBorrowed(reserveData);
      const totalDeposited = this.getTotalDeposited(reserveData);

      const tokenPrice = await this.services.oracle.getTokenPriceUsd({
        chain: token.chain,
        address: token.address,
        timestamp: options.timestamp,
      });
      const snapshot: LendingMarketSnapshot = {
        marketId: `${marketConfig.protocol}-${marketConfig.chain}-${normalizeAddress(
          marketConfig.address,
        )}-${normalizeAddress(token.address)}`,

        chain: marketConfig.chain,
        protocol: marketConfig.protocol,
        address: normalizeAddress(marketConfig.address),
        timestamp: options.timestamp,

        token: token,
        tokenPrice: tokenPrice ? tokenPrice : '0',

        totalDeposited: formatFromDecimals(totalDeposited, token.decimals),
        totalBorrowed: formatFromDecimals(totalBorrowed, token.decimals),
        totalFeesCollected: '0',

        volumeDeposited: '0',
        volumeWithdrawn: '0',
        volumeBorrowed: '0',
        volumeRepaid: '0',
        volumeLiquidated: '0',

        countAddresses: 0,
        countTransactions: 0,

        supplyRate: formatFromDecimals(reserveData.liquidityRate.toString(), 27),
        borrowRate: formatFromDecimals(reserveData.variableBorrowRate.toString(), 27),
        borrowRateStable: formatFromDecimals(reserveData.stableBorrowRate.toString(), 27),
      };

      snapshots.push(snapshot);

      logger.info('got lending market snapshot', {
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
