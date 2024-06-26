// import { DataMetrics, DexConfig, DexVersions, ProtocolConfig } from '../../types/configs';
// import { AddressesBook, SubgraphEndpoints } from '../data';
// import { ChainNames, ProtocolNames } from '../names';
//
// export interface UniswapConfig extends ProtocolConfig {
//   configs: Array<DexConfig>;
// }
//
// // export to easy to use in other configs
// export const Uniswapv2EthereumDexConfig: DexConfig = {
//   protocol: 'uniswapv2',
//   chain: ChainNames.ethereum,
//   metric: DataMetrics.dex,
//   version: DexVersions.univ2,
//   address: AddressesBook.ethereum.UniswapFactoryV2,
//   birthday: 1590969600, // Mon Jun 01 2020 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.uniswapv2Ethereum,
//     filters: {
//       bundles: {
//         baseTokenPrice: 'ethPrice',
//       },
//       tokens: {
//         volume: 'tradeVolume',
//         liquidity: 'totalLiquidity',
//         txCount: 'txCount',
//         derivedBase: 'derivedETH',
//       },
//       pools: {
//         pool: 'pair',
//         pools: 'pairs',
//         volume: 'volumeUSD',
//         liquidity: 'reserveUSD',
//         txCount: 'txCount',
//         derivedBase: 'derivedETH',
//         reserve0: 'reserve0',
//         reserve1: 'reserve1',
//       },
//       factory: {
//         factories: 'uniswapFactories',
//         volume: 'totalVolumeUSD',
//         liquidity: 'totalLiquidityUSD',
//         txCount: 'txCount',
//       },
//       eventSwaps: {
//         event: 'swaps',
//         trader: 'to',
//         volumeUsd: 'amountUSD',
//         timestamp: 'timestamp',
//       },
//     },
//   },
// };
//
// export const Uniswapv2Configs: UniswapConfig = {
//   protocol: 'uniswapv2',
//   configs: [Uniswapv2EthereumDexConfig],
// };
//
// const Uniswapv3SubgraphFilters = {
//   bundles: {
//     baseTokenPrice: 'ethPriceUSD',
//   },
//   tokens: {
//     volume: 'volume',
//     liquidity: 'totalValueLocked',
//     txCount: 'txCount',
//     derivedBase: 'derivedETH',
//     fees: 'feesUSD',
//   },
//   pools: {
//     pool: 'pool',
//     pools: 'pools',
//     volume: 'volumeUSD',
//     liquidity: 'totalValueLockedUSD',
//     txCount: 'txCount',
//     derivedBase: 'derivedETH',
//     fees: 'feesUSD',
//     feesTiger: 'feeTier',
//     reserve0: 'totalValueLockedToken0',
//     reserve1: 'totalValueLockedToken1',
//   },
//   factory: {
//     factories: 'factories',
//     volume: 'totalVolumeUSD',
//     liquidity: 'totalValueLockedUSD',
//     txCount: 'txCount',
//     fees: 'totalFeesUSD',
//   },
//   eventSwaps: {
//     event: 'swaps',
//     volumeUsd: 'amountUSD',
//     trader: 'recipient',
//     timestamp: 'timestamp',
//   },
// };
//
// // export to easy to use in other configs
// export const Uniswapv3EthereumDexConfig: DexConfig = {
//   protocol: 'uniswapv3',
//   chain: ChainNames.ethereum,
//   metric: DataMetrics.dex,
//   version: DexVersions.univ3,
//   address: AddressesBook.ethereum.UniswapFactoryV3,
//   birthday: 1620172800, // Wed May 05 2021 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.uniswapv3Ethereum,
//     filters: Uniswapv3SubgraphFilters,
//   },
// };
//
// export const Uniswapv3ArbitrumDexConfig: DexConfig = {
//   protocol: 'uniswapv3',
//   chain: ChainNames.arbitrum,
//   metric: DataMetrics.dex,
//   version: DexVersions.univ3,
//   address: AddressesBook.arbitrum.UniswapFactoryV3,
//   birthday: 1630454400, // Wed Jun 02 2021 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.uniswapv3Arbitrum,
//     filters: Uniswapv3SubgraphFilters,
//   },
// };
//
// export const Uniswapv3OptimismDexConfig: DexConfig = {
//   protocol: 'uniswapv3',
//   chain: ChainNames.optimism,
//   metric: DataMetrics.dex,
//   version: DexVersions.univ3,
//   address: AddressesBook.optimism.UniswapFactoryV3,
//   birthday: 1637020800, // Tue Nov 16 2021 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.uniswapv3Optimism,
//     filters: Uniswapv3SubgraphFilters,
//   },
// };
//
// export const Uniswapv3PolygonDexConfig: DexConfig = {
//   protocol: 'uniswapv3',
//   chain: ChainNames.polygon,
//   metric: DataMetrics.dex,
//   version: DexVersions.univ3,
//   address: AddressesBook.polygon.UniswapFactoryV3,
//   birthday: 1640995200, // Tue Dec 21 2021 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.uniswapv3Polygon,
//     filters: Uniswapv3SubgraphFilters,
//   },
// };
//
// export const Uniswapv3BaseDexConfig: DexConfig = {
//   protocol: 'uniswapv3',
//   chain: ChainNames.base,
//   metric: DataMetrics.dex,
//   version: DexVersions.univ3,
//   address: AddressesBook.base.UniswapFactoryV3,
//   birthday: 1691193600, // Mon Jul 17 2023 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.uniswapv3Base,
//     filters: Uniswapv3SubgraphFilters,
//   },
// };
//
// export const Uniswapv3BnbchainDexConfig: DexConfig = {
//   protocol: 'uniswapv3',
//   chain: ChainNames.bnbchain,
//   metric: DataMetrics.dex,
//   version: DexVersions.univ3,
//   address: AddressesBook.bnbchain.UniswapFactoryV3,
//   birthday: 1678492800, // Fri Mar 10 2023 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.uniswapv3Bnbchain,
//     filters: Uniswapv3SubgraphFilters,
//   },
// };
//
// export const Uniswapv3Configs: UniswapConfig = {
//   protocol: ProtocolNames.uniswapv3,
//   configs: [
//     Uniswapv3EthereumDexConfig,
//     Uniswapv3ArbitrumDexConfig,
//     Uniswapv3OptimismDexConfig,
//     Uniswapv3BaseDexConfig,
//     Uniswapv3PolygonDexConfig,
//     Uniswapv3BnbchainDexConfig,
//   ],
// };
