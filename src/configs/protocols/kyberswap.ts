import { DataMetrics, DexConfig, DexVersions, ProtocolConfig } from '../../types/configs';
import { AddressesBook, SubgraphEndpoints } from '../data';
import { ChainNames, ProtocolNames } from '../names';

export interface KyberswapConfig extends ProtocolConfig {
  configs: Array<DexConfig>;
}

const KyberswapSubgraphFilters = {
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
    factories: 'factories',
    volume: 'totalVolumeUSD',
    liquidity: 'totalValueLockedUSD',
    txCount: 'txCount',
    fees: 'totalFeesUSD',
  },
};

export const KyberswapEthereumDexConfig: DexConfig = {
  protocol: ProtocolNames.kyberswap,
  chain: ChainNames.ethereum,
  metric: DataMetrics.dex,
  version: DexVersions.univ3,
  address: AddressesBook.ethereum.KyberswapFactory,
  birthday: 1686355200, // Sat Jun 10 2023 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.kyberswapElasticEthereum,
    filters: KyberswapSubgraphFilters,
  },
};

export const KyberswapArbitrumDexConfig: DexConfig = {
  protocol: ProtocolNames.kyberswap,
  chain: ChainNames.arbitrum,
  metric: DataMetrics.dex,
  version: DexVersions.univ3,
  address: AddressesBook.arbitrum.KyberswapFactory,
  birthday: 1686355200, // Sat Jun 10 2023 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.kyberswapElasticArbitrum,
    filters: KyberswapSubgraphFilters,
  },
};

export const KyberswapOptimismDexConfig: DexConfig = {
  protocol: ProtocolNames.kyberswap,
  chain: ChainNames.optimism,
  metric: DataMetrics.dex,
  version: DexVersions.univ3,
  address: AddressesBook.optimism.KyberswapFactory,
  birthday: 1686355200, // Sat Jun 10 2023 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.kyberswapElasticOptimism,
    filters: KyberswapSubgraphFilters,
  },
};

export const KyberswapBaseDexConfig: DexConfig = {
  protocol: ProtocolNames.kyberswap,
  chain: ChainNames.base,
  metric: DataMetrics.dex,
  version: DexVersions.univ3,
  address: AddressesBook.base.KyberswapFactory,
  birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.kyberswapElasticBase,
    filters: KyberswapSubgraphFilters,
  },
};

export const KyberswapBnbchainDexConfig: DexConfig = {
  protocol: ProtocolNames.kyberswap,
  chain: ChainNames.bnbchain,
  metric: DataMetrics.dex,
  version: DexVersions.univ3,
  address: AddressesBook.bnbchain.KyberswapFactory,
  birthday: 1686355200, // Sat Jun 10 2023 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.kyberswapElasticBnbchain,
    filters: KyberswapSubgraphFilters,
  },
};

export const KyberswapPolygonDexConfig: DexConfig = {
  protocol: ProtocolNames.kyberswap,
  chain: ChainNames.polygon,
  metric: DataMetrics.dex,
  version: DexVersions.univ3,
  address: AddressesBook.polygon.KyberswapFactory,
  birthday: 1686355200, // Sat Jun 10 2023 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.kyberswapElasticPolygon,
    filters: KyberswapSubgraphFilters,
  },
};

export const KyberswapAvalancheDexConfig: DexConfig = {
  protocol: ProtocolNames.kyberswap,
  chain: ChainNames.avalanche,
  metric: DataMetrics.dex,
  version: DexVersions.univ3,
  address: AddressesBook.avalanche.KyberswapFactory,
  birthday: 1686355200, // Sat Jun 10 2023 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.kyberswapElasticAvalanche,
    filters: KyberswapSubgraphFilters,
  },
};

export const KyberswapFantomDexConfig: DexConfig = {
  protocol: ProtocolNames.kyberswap,
  chain: ChainNames.fantom,
  metric: DataMetrics.dex,
  version: DexVersions.univ3,
  address: AddressesBook.fantom.KyberswapFactory,
  birthday: 1686355200, // Sat Jun 10 2023 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.kyberswapElasticFantom,
    filters: KyberswapSubgraphFilters,
  },
};

export const KyberswapScrollDexConfig: DexConfig = {
  protocol: ProtocolNames.kyberswap,
  chain: ChainNames.scroll,
  metric: DataMetrics.dex,
  version: DexVersions.univ3,
  address: AddressesBook.scroll.KyberswapFactory,
  birthday: 1698796800, // Wed Nov 01 2023 00:00:00 GMT+0000
  subgraph: {
    endpoint: SubgraphEndpoints.data.kyberswapElasticScroll,
    filters: KyberswapSubgraphFilters,
  },
};

export const KyberswapConfigs: KyberswapConfig = {
  protocol: ProtocolNames.kyberswap,
  configs: [
    KyberswapEthereumDexConfig,
    KyberswapArbitrumDexConfig,
    KyberswapOptimismDexConfig,
    KyberswapBaseDexConfig,
    KyberswapBnbchainDexConfig,
    KyberswapPolygonDexConfig,
    KyberswapAvalancheDexConfig,
    KyberswapFantomDexConfig,
    KyberswapScrollDexConfig,
  ],
};
