import BigNumber from 'bignumber.js';

import AaveDataProviderV2Abi from '../../../configs/abi/aave/DataProviderV2.json';
import AaveLendingPoolV2Abi from '../../../configs/abi/aave/LendingPoolV2.json';
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

export default class Aavev2Adapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.aavev2';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);
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

    const reservesList: Array<any> = await this.services.blockchain.singlecall({
      chain: marketConfig.chain,
      abi: AaveLendingPoolV2Abi,
      target: marketConfig.address,
      method: 'getReservesList',
      params: [],
      blockNumber,
    });

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

      const snapshot: LendingMarketSnapshot = {
        marketId: `${marketConfig.protocol}-${marketConfig.chain}-${normalizeAddress(
          marketConfig.address,
        )}-${normalizeAddress(token.address)}`,

        chain: marketConfig.chain,
        protocol: marketConfig.protocol,
        address: normalizeAddress(marketConfig.address),
        timestamp: options.timestamp,

        token: token,
        tokenPrice: '0',

        totalDeposited: formatFromDecimals(totalDeposited, token.decimals),
        totalBorrowed: formatFromDecimals(totalBorrowed, token.decimals),

        supplyRate: formatFromDecimals(reserveData.liquidityRate.toString(), 27),
        borrowRate: formatFromDecimals(reserveData.variableBorrowRate.toString(), 27),
        borrowRateStable: formatFromDecimals(reserveData.stableBorrowRate.toString(), 27),
      };

      snapshots.push(snapshot);

      logger.debug('got lending market snapshot', {
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
