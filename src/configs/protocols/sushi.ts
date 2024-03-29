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
    endpoint: SubgraphEndpoints.data.sushiArbitrum,
    filters: SushiSubgraphFilters,
  },
};

export const SushiPolygonDexConfig: DexConfig = {
  protocol: 'sushi',
  chain: 'polygon',
  metric: DataMetrics.dex,
  version: DexVersions.univ2,
  address: AddressesBook.polygon.SushiFactoryV2,
  birthday: 1614384000, // Sat Feb 27 2021 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.sushiPolygon,
    filters: SushiSubgraphFilters,
  },
};

export const SushiBnbchainDexConfig: DexConfig = {
  protocol: 'sushi',
  chain: 'bnbchain',
  metric: DataMetrics.dex,
  version: DexVersions.univ2,
  address: AddressesBook.bnbchain.SushiFactoryV2,
  birthday: 1614384000, // Sat Feb 27 2021 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.sushiBnbchain,
    filters: SushiSubgraphFilters,
  },
};

export const SushiFantomDexConfig: DexConfig = {
  protocol: 'sushi',
  chain: 'fantom',
  metric: DataMetrics.dex,
  version: DexVersions.univ2,
  address: AddressesBook.fantom.SushiFactoryV2,
  birthday: 1614384000, // Sat Feb 27 2021 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.sushiFantom,
    filters: SushiSubgraphFilters,
  },
};

export const SushiAvalancheDexConfig: DexConfig = {
  protocol: 'sushi',
  chain: 'avalanche',
  metric: DataMetrics.dex,
  version: DexVersions.univ2,
  address: AddressesBook.avalanche.SushiFactoryV2,
  birthday: 1615334400, // Wed Mar 10 2021 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.sushiAvalanche,
    filters: SushiSubgraphFilters,
  },
};

export const SushiConfigs: SushiConfig = {
  protocol: 'sushi',
  configs: [
    SushiEthereumDexConfig,
    SushiArbitrumDexConfig,
    SushiPolygonDexConfig,
    SushiBnbchainDexConfig,
    SushiFantomDexConfig,
    SushiAvalancheDexConfig,
  ],
};

const Sushiv3SubgraphFilters = {
  bundles: {
    baseTokenPrice: 'ethPriceUSD',
  },
  tokens: {
    volume: 'volume',
    liquidity: 'totalValueLocked',
    txCount: 'txCount',
    derivedBase: 'derivedETH',
    fees: 'feesUSD',
  },
  pools: {
    pool: 'pool',
    pools: 'pools',
    volume: 'volumeUSD',
    liquidity: 'totalValueLockedUSD',
    txCount: 'txCount',
    derivedBase: 'derivedETH',
    fees: 'feesUSD',
    feesTiger: 'feeTier',
    reserve0: 'totalValueLockedToken0',
    reserve1: 'totalValueLockedToken1',
  },
  factory: {
    factories: 'uniswapFactories',
    volume: 'totalVolumeUSD',
    liquidity: 'totalLiquidityUSD',
    txCount: 'txCount',
    fees: 'totalFeesUSD',
  },
};

export const Sushiv3EthereumDexConfig: DexConfig = {
  protocol: 'sushiv3',
  chain: 'ethereum',
  metric: DataMetrics.dex,
  version: DexVersions.univ3,
  address: AddressesBook.ethereum.SushiFactoryV3,
  birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.sushiv3Ethereum,
    filters: Sushiv3SubgraphFilters,
  },
};

export const Sushiv3ArbitrumDexConfig: DexConfig = {
  protocol: 'sushiv3',
  chain: 'arbitrum',
  metric: DataMetrics.dex,
  version: DexVersions.univ3,
  address: AddressesBook.arbitrum.SushiFactoryV3,
  birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.sushiv3Arbitrum,
    filters: Sushiv3SubgraphFilters,
  },
};

export const Sushiv3OptimismDexConfig: DexConfig = {
  protocol: 'sushiv3',
  chain: 'optimism',
  metric: DataMetrics.dex,
  version: DexVersions.univ3,
  address: AddressesBook.optimism.SushiFactoryV3,
  birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.sushiv3Optimism,
    filters: Sushiv3SubgraphFilters,
  },
};

export const Sushiv3BaseDexConfig: DexConfig = {
  protocol: 'sushiv3',
  chain: 'base',
  metric: DataMetrics.dex,
  version: DexVersions.univ3,
  address: AddressesBook.base.SushiFactoryV3,
  birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.sushiv3Base,
    filters: Sushiv3SubgraphFilters,
  },
};

export const Sushiv3PolygonDexConfig: DexConfig = {
  protocol: 'sushiv3',
  chain: 'polygon',
  metric: DataMetrics.dex,
  version: DexVersions.univ3,
  address: AddressesBook.polygon.SushiFactoryV3,
  birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.sushiv3Polygon,
    filters: Sushiv3SubgraphFilters,
  },
};

export const Sushiv3BnbchainDexConfig: DexConfig = {
  protocol: 'sushiv3',
  chain: 'bnbchain',
  metric: DataMetrics.dex,
  version: DexVersions.univ3,
  address: AddressesBook.bnbchain.SushiFactoryV3,
  birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.sushiv3Bnbchain,
    filters: Sushiv3SubgraphFilters,
  },
};

export const Sushiv3FantomDexConfig: DexConfig = {
  protocol: 'sushiv3',
  chain: 'fantom',
  metric: DataMetrics.dex,
  version: DexVersions.univ3,
  address: AddressesBook.fantom.SushiFactoryV3,
  birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.sushiv3Fantom,
    filters: Sushiv3SubgraphFilters,
  },
};

export const Sushiv3AvalancheDexConfig: DexConfig = {
  protocol: 'sushiv3',
  chain: 'avalanche',
  metric: DataMetrics.dex,
  version: DexVersions.univ3,
  address: AddressesBook.avalanche.SushiFactoryV3,
  birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.sushiv3Avalanche,
    filters: Sushiv3SubgraphFilters,
  },
};
