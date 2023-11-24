import BigNumber from 'bignumber.js';

import cErc20Abi from '../../../configs/abi/compound/cErc20.json';
import { ChainBlockPeriods, YEAR } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { CompoundLendingMarketConfig } from '../../../configs/protocols/compound';
import logger from '../../../lib/logger';
import { queryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { formatFromDecimals, getDateString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { LendingMarketSnapshot } from '../../../types/domains';
import { ContextServices } from '../../../types/namespaces';
import { GetLendingMarketSnapshotOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';

export default class CompoundAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.compound';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);
  }

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot> | null> {
    const marketConfig = options.config as CompoundLendingMarketConfig;

    const blockNumber = await queryBlockNumberAtTimestamp(
      EnvConfig.blockchains[marketConfig.chain].blockSubgraph,
      options.timestamp,
    );
    if (blockNumber === 0) {
      return null;
    }

    const snapshots: Array<LendingMarketSnapshot> = [];

    const totalCash = await this.services.blockchain.singlecall({
      chain: marketConfig.chain,
      abi: cErc20Abi,
      target: marketConfig.address,
      method: 'getCash',
      params: [],
      blockNumber,
    });
    const totalBorrows = await this.services.blockchain.singlecall({
      chain: marketConfig.chain,
      abi: cErc20Abi,
      target: marketConfig.address,
      method: 'totalBorrows',
      params: [],
      blockNumber,
    });
    const totalReserves = await this.services.blockchain.singlecall({
      chain: marketConfig.chain,
      abi: cErc20Abi,
      target: marketConfig.address,
      method: 'totalReserves',
      params: [],
      blockNumber,
    });
    const supplyRatePerBlock = await this.services.blockchain.singlecall({
      chain: marketConfig.chain,
      abi: cErc20Abi,
      target: marketConfig.address,
      method: 'supplyRatePerBlock',
      params: [],
      blockNumber,
    });
    const borrowRatePerBlock = await this.services.blockchain.singlecall({
      chain: marketConfig.chain,
      abi: cErc20Abi,
      target: marketConfig.address,
      method: 'borrowRatePerBlock',
      params: [],
      blockNumber,
    });

    const supplyRate = new BigNumber(supplyRatePerBlock ? supplyRatePerBlock : '0').multipliedBy(
      Math.floor(YEAR / ChainBlockPeriods[options.config.chain]),
    );
    const borrowRate = new BigNumber(borrowRatePerBlock).multipliedBy(
      Math.floor(YEAR / ChainBlockPeriods[options.config.chain]),
    );

    const totalDeposited = new BigNumber(totalCash.toString())
      .plus(new BigNumber(totalBorrows.toString()))
      .minus(new BigNumber(totalReserves.toString()));
    const totalBorrowed = new BigNumber(totalBorrows.toString());

    const token = (options.config as CompoundLendingMarketConfig).underlying;

    snapshots.push({
      marketId: `${marketConfig.protocol}-${marketConfig.chain}-${normalizeAddress(
        marketConfig.address,
      )}-${normalizeAddress(token.address)}`,

      chain: marketConfig.chain,
      protocol: marketConfig.protocol,
      address: normalizeAddress(marketConfig.address),
      timestamp: options.timestamp,

      token: token,
      tokenPrice: '0',

      totalDeposited: formatFromDecimals(totalDeposited.toString(10), token.decimals),
      totalBorrowed: formatFromDecimals(totalBorrowed.toString(10), token.decimals),

      supplyRate: formatFromDecimals(supplyRate.toString(10), 18),
      borrowRate: formatFromDecimals(borrowRate.toString(10), 18),
    });

    logger.debug('got lending market snapshot', {
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
