import { DataMetrics, ProtocolConfig, StakingConfig, StakingVersions, Token } from '../../types/configs';
import { TokensBookBase } from '../data';
import { ChainNames, ProtocolNames } from '../names';

export interface SushiBarConfig extends StakingConfig {
  poolId: string;
  token: Token;
  sushiLp: string;
}

export interface SushiConfig extends ProtocolConfig {
  configs: Array<SushiBarConfig>;
}

// // export to easy to use in other configs
// export const SushiEthereumDexConfig: DexConfig = {
//   protocol: 'sushi',
//   chain: 'ethereum',
//   metric: DataMetrics.dex,
//   version: DexVersions.univ2,
//   address: AddressesBook.ethereum.SushiFactoryV2,
//   birthday: 1599609600, // Wed Sep 09 2020 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.sushiEthereum,
//     filters: SushiSubgraphFilters,
//   },
// };
//
// export const SushiArbitrumDexConfig: DexConfig = {
//   protocol: 'sushi',
//   chain: 'arbitrum',
//   metric: DataMetrics.dex,
//   version: DexVersions.univ2,
//   address: AddressesBook.arbitrum.SushiFactoryV2,
//   birthday: 1630454400, // Wed Sep 01 2021 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.sushiArbitrum,
//     filters: SushiSubgraphFilters,
//   },
// };
//
// export const SushiPolygonDexConfig: DexConfig = {
//   protocol: 'sushi',
//   chain: 'polygon',
//   metric: DataMetrics.dex,
//   version: DexVersions.univ2,
//   address: AddressesBook.polygon.SushiFactoryV2,
//   birthday: 1622505600, // Tue Jun 01 2021 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.sushiPolygon,
//     filters: SushiSubgraphFilters,
//   },
// };
//
// export const SushiBnbchainDexConfig: DexConfig = {
//   protocol: 'sushi',
//   chain: 'bnbchain',
//   metric: DataMetrics.dex,
//   version: DexVersions.univ2,
//   address: AddressesBook.bnbchain.SushiFactoryV2,
//   birthday: 1622505600, // Tue Jun 01 2021 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.sushiBnbchain,
//     filters: SushiSubgraphFilters,
//   },
// };
//
// export const SushiFantomDexConfig: DexConfig = {
//   protocol: 'sushi',
//   chain: 'fantom',
//   metric: DataMetrics.dex,
//   version: DexVersions.univ2,
//   address: AddressesBook.fantom.SushiFactoryV2,
//   birthday: 1622505600, // Tue Jun 01 2021 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.sushiFantom,
//     filters: SushiSubgraphFilters,
//   },
// };
//
// export const SushiAvalancheDexConfig: DexConfig = {
//   protocol: 'sushi',
//   chain: 'avalanche',
//   metric: DataMetrics.dex,
//   version: DexVersions.univ2,
//   address: AddressesBook.avalanche.SushiFactoryV2,
//   birthday: 1633046400, // Tue Jun 01 2021 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.sushiAvalanche,
//     filters: SushiSubgraphFilters,
//   },
// };

export const SushiConfigs: SushiConfig = {
  protocol: 'sushi',
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.sushi,
      metric: DataMetrics.staking,
      version: StakingVersions.xsushi,
      poolId: 'xSushi',
      birthday: 1599696000, // Thu Sep 10 2020 00:00:00 GMT+0000
      token: TokensBookBase.ethereum.SUSHI,
      address: '0x8798249c2e607446efb7ad49ec89dd1865ff4272',
      sushiLp: '0x795065dcc9f64b5614c407a6efdc400da6221fb0',
    },
    // SushiEthereumDexConfig,
    // SushiArbitrumDexConfig,
    // SushiPolygonDexConfig,
    // SushiBnbchainDexConfig,
    // SushiFantomDexConfig,
    // SushiAvalancheDexConfig,
  ],
};

// export const Sushiv3EthereumDexConfig: DexConfig = {
//   protocol: 'sushiv3',
//   chain: 'ethereum',
//   metric: DataMetrics.dex,
//   version: DexVersions.univ3,
//   address: AddressesBook.ethereum.SushiFactoryV3,
//   birthday: 1680739200, // Thu Apr 06 2023 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.sushiv3Ethereum,
//     filters: Sushiv3SubgraphFilters,
//   },
// };
//
// export const Sushiv3ArbitrumDexConfig: DexConfig = {
//   protocol: 'sushiv3',
//   chain: 'arbitrum',
//   metric: DataMetrics.dex,
//   version: DexVersions.univ3,
//   address: AddressesBook.arbitrum.SushiFactoryV3,
//   birthday: 1680739200, // Thu Apr 06 2023 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.sushiv3Arbitrum,
//     filters: Sushiv3SubgraphFilters,
//   },
// };
//
// export const Sushiv3OptimismDexConfig: DexConfig = {
//   protocol: 'sushiv3',
//   chain: 'optimism',
//   metric: DataMetrics.dex,
//   version: DexVersions.univ3,
//   address: AddressesBook.optimism.SushiFactoryV3,
//   birthday: 1680739200, // Thu Apr 06 2023 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.sushiv3Optimism,
//     filters: Sushiv3SubgraphFilters,
//   },
// };
//
// export const Sushiv3BaseDexConfig: DexConfig = {
//   protocol: 'sushiv3',
//   chain: 'base',
//   metric: DataMetrics.dex,
//   version: DexVersions.univ3,
//   address: AddressesBook.base.SushiFactoryV3,
//   birthday: 1691625600, // Thu Aug 10 2023 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.sushiv3Base,
//     filters: Sushiv3SubgraphFilters,
//   },
// };
//
// export const Sushiv3PolygonDexConfig: DexConfig = {
//   protocol: 'sushiv3',
//   chain: 'polygon',
//   metric: DataMetrics.dex,
//   version: DexVersions.univ3,
//   address: AddressesBook.polygon.SushiFactoryV3,
//   birthday: 1680739200, // Thu Apr 06 2023 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.sushiv3Polygon,
//     filters: Sushiv3SubgraphFilters,
//   },
// };
//
// export const Sushiv3BnbchainDexConfig: DexConfig = {
//   protocol: 'sushiv3',
//   chain: 'bnbchain',
//   metric: DataMetrics.dex,
//   version: DexVersions.univ3,
//   address: AddressesBook.bnbchain.SushiFactoryV3,
//   birthday: 1680739200, // Thu Apr 06 2023 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.sushiv3Bnbchain,
//     filters: Sushiv3SubgraphFilters,
//   },
// };
//
// export const Sushiv3FantomDexConfig: DexConfig = {
//   protocol: 'sushiv3',
//   chain: 'fantom',
//   metric: DataMetrics.dex,
//   version: DexVersions.univ3,
//   address: AddressesBook.fantom.SushiFactoryV3,
//   birthday: 1680739200, // Thu Apr 06 2023 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.sushiv3Fantom,
//     filters: Sushiv3SubgraphFilters,
//   },
// };
//
// export const Sushiv3AvalancheDexConfig: DexConfig = {
//   protocol: 'sushiv3',
//   chain: 'avalanche',
//   metric: DataMetrics.dex,
//   version: DexVersions.univ3,
//   address: AddressesBook.avalanche.SushiFactoryV3,
//   birthday: 1680739200, // Thu Apr 06 2023 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.sushiv3Avalanche,
//     filters: Sushiv3SubgraphFilters,
//   },
// };
//
// export const Sushiv3Configs: SushiConfig = {
//   protocol: ProtocolNames.sushiv3,
//   configs: [
//     Sushiv3EthereumDexConfig,
//     Sushiv3ArbitrumDexConfig,
//     Sushiv3OptimismDexConfig,
//     Sushiv3BaseDexConfig,
//     Sushiv3PolygonDexConfig,
//     Sushiv3BnbchainDexConfig,
//     Sushiv3AvalancheDexConfig,
//     Sushiv3FantomDexConfig,
//   ],
// };
