import { DataMetrics, DexConfig, DexVersions, ProtocolConfig } from '../../types/configs';
import { AddressesBook, SubgraphEndpoints } from '../data';
import { ChainNames, ProtocolNames } from '../names';

export interface SpookyConfig extends ProtocolConfig {
  configs: Array<DexConfig>;
}

const SpookySubgraphFilters = {
  bundles: {
    baseTokenPrice: 'ethPrice',
  },
  tokens: {
    volume: 'tradeVolume',
    liquidity: 'totalLiquidity',
    txCount: 'txCount',
    derivedBase: 'derivedETH',
  },
  pools: {
    pool: 'pair',
    pools: 'pairs',
    volume: 'volumeUSD',
    liquidity: 'reserveUSD',
    txCount: 'txCount',
    derivedBase: 'derivedETH',
    reserve0: 'reserve0',
    reserve1: 'reserve1',
  },
  factory: {
    factories: 'uniswapFactories',
    volume: 'totalVolumeUSD',
    liquidity: 'totalLiquidityUSD',
    txCount: 'txCount',
  },
  eventSwaps: {
    event: 'swaps',
    trader: 'to',
    volumeUsd: 'amountUSD',
    timestamp: 'timestamp',
  },
  factoryDayData: {
    factories: 'uniswapDayDatas',
    volume: 'dailyVolumeUSD',
    liquidity: 'totalLiquidityUSD',
    txCount: 'txCount',
  },
};

export const SpookyFantomDexConfig: DexConfig = {
  protocol: ProtocolNames.spooky,
  chain: ChainNames.fantom,
  metric: DataMetrics.dex,
  version: DexVersions.univ2,
  address: AddressesBook.fantom.SpookyFactory,
  birthday: 1618704000, // Sun Apr 18 2021 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.spookyFantom,
    filters: SpookySubgraphFilters,
    fixedFeePercentage: 0.2,
  },
};

export const SpookyConfigs: SpookyConfig = {
  protocol: ProtocolNames.spooky,
  configs: [SpookyFantomDexConfig],
};
