import { DataMetrics, DexConfig, DexVersions, ProtocolConfig } from '../../types/configs';
import { AddressesBook, SubgraphEndpoints } from '../data';

export interface SushiConfig extends ProtocolConfig {
  configs: Array<DexConfig>;
}

const SushiSubgraphFilters = {
  bundles: {
    baseTokenPrice: 'ethPrice',
  },
  tokens: {
    volume: 'volume',
    liquidity: 'liquidity',
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
    factories: 'factories',
    volume: 'volumeUSD',
    liquidity: 'liquidityUSD',
    txCount: 'txCount',
  },
};

// export to easy to use in other configs
export const SushiEthereumDexConfig: DexConfig = {
  protocol: 'sushi',
  chain: 'ethereum',
  metric: DataMetrics.dex,
  version: DexVersions.univ2,
  address: AddressesBook.ethereum.SushiFactoryV2,
  birthday: 1599264000, /// Sat Sep 05 2020 00:00:00 GMT+0000
  subgraph: {
    version: 'univ2',
    endpoint: SubgraphEndpoints.data.sushiEthereum,
    filters: SushiSubgraphFilters,
  },
};

export const SushiArbitrumDexConfig: DexConfig = {
  protocol: 'sushi',
  chain: 'arbitrum',
  metric: DataMetrics.dex,
  version: DexVersions.univ2,
  address: AddressesBook.arbitrum.SushiFactoryV2,
  birthday: 1622505600, // Tue Jun 01 2021 00:00:00 GMT+0000
  subgraph: {
    version: 'univ2',
    endpoint: SubgraphEndpoints.data.sushiArbitrum,
    filters: SushiSubgraphFilters,
  },
};

export const SushiConfigs: SushiConfig = {
  protocol: 'sushi',
  configs: [SushiEthereumDexConfig, SushiArbitrumDexConfig],
};
