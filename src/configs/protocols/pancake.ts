// import { DataMetrics, DexConfig, DexVersions, ProtocolConfig } from '../../types/configs';
// import { AddressesBook, SubgraphEndpoints } from '../data';
// import { ChainNames, ProtocolNames } from '../names';
//
// export interface PancakeConfig extends ProtocolConfig {
//   configs: Array<DexConfig>;
// }
//
// const PancakeSubgraphFilters = {
//   bundles: {
//     baseTokenPrice: 'ethPrice',
//   },
//   tokens: {
//     volume: 'tradeVolume',
//     liquidity: 'totalLiquidity',
//     txCount: 'totalTransactions',
//     derivedBase: 'derivedETH',
//   },
//   pools: {
//     pool: 'pair',
//     pools: 'pairs',
//     volume: 'volumeUSD',
//     liquidity: 'reserveUSD',
//     txCount: 'totalTransactions',
//     derivedBase: 'derivedETH',
//     reserve0: 'reserve0',
//     reserve1: 'reserve1',
//   },
//   factory: {
//     factories: 'factories',
//     volume: 'totalVolumeUSD',
//     liquidity: 'totalLiquidityUSD',
//     txCount: 'totalTransactions',
//   },
// };
//
// export const PancakeEthereumDexConfig: DexConfig = {
//   protocol: ProtocolNames.pancake,
//   chain: ChainNames.ethereum,
//   metric: DataMetrics.dex,
//   version: DexVersions.univ2,
//   address: AddressesBook.ethereum.PancakeFactoryV2,
//   birthday: 1664236800, // Tue Sep 27 2022 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.pancakeEthereum,
//     filters: PancakeSubgraphFilters,
//     fixedFeePercentage: 0.25,
//   },
// };
//
// export const PancakeBnbchainDexConfig: DexConfig = {
//   protocol: ProtocolNames.pancake,
//   chain: ChainNames.bnbchain,
//   metric: DataMetrics.dex,
//   version: DexVersions.univ2,
//   address: AddressesBook.bnbchain.PancakeFactoryV2,
//   birthday: 1619222400, // Sat Apr 24 2021 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.pancakeBnbchain,
//     filters: PancakeSubgraphFilters,
//     httpRequestOptions: {
//       referer: 'https://pancakeswap.finance/',
//       origin: 'https://pancakeswap.finance',
//     },
//     fixedFeePercentage: 0.25,
//   },
// };
//
// export const PancakeArbitrumDexConfig: DexConfig = {
//   protocol: ProtocolNames.pancake,
//   chain: ChainNames.arbitrum,
//   metric: DataMetrics.dex,
//   version: DexVersions.univ2,
//   address: AddressesBook.arbitrum.PancakeFactoryV2,
//   birthday: 1686787200, // Thu Jun 15 2023 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.pancakeArbitrum,
//     filters: PancakeSubgraphFilters,
//     fixedFeePercentage: 0.25,
//   },
// };
//
// export const PancakeBaseDexConfig: DexConfig = {
//   protocol: ProtocolNames.pancake,
//   chain: ChainNames.base,
//   metric: DataMetrics.dex,
//   version: DexVersions.univ2,
//   address: AddressesBook.base.PancakeFactoryV2,
//   birthday: 1692662400, // Tue Aug 22 2023 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.pancakeBase,
//     filters: PancakeSubgraphFilters,
//     fixedFeePercentage: 0.25,
//   },
// };
//
// export const PancakeConfigs: PancakeConfig = {
//   protocol: 'pancake',
//   configs: [PancakeEthereumDexConfig, PancakeBnbchainDexConfig, PancakeArbitrumDexConfig, PancakeBaseDexConfig],
// };
//
// const Pancakev3SubgraphFilters = {
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
//     factories: 'uniswapFactories',
//     volume: 'totalVolumeUSD',
//     liquidity: 'totalLiquidityUSD',
//     txCount: 'txCount',
//     fees: 'totalFeesUSD',
//   },
// };
//
// export const Pancakev3EthereumDexConfig: DexConfig = {
//   protocol: ProtocolNames.pancakev3,
//   chain: ChainNames.ethereum,
//   metric: DataMetrics.dex,
//   version: DexVersions.univ3,
//   address: AddressesBook.ethereum.PancakeFactoryV3,
//   birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.pancakev3Ethereum,
//     filters: Pancakev3SubgraphFilters,
//   },
// };
//
// export const Pancakev3BnbchainDexConfig: DexConfig = {
//   protocol: ProtocolNames.pancakev3,
//   chain: ChainNames.bnbchain,
//   metric: DataMetrics.dex,
//   version: DexVersions.univ3,
//   address: AddressesBook.bnbchain.PancakeFactoryV3,
//   birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.pancakev3Bnbchain,
//     filters: Pancakev3SubgraphFilters,
//   },
// };
//
// export const Pancakev3ArbitrumDexConfig: DexConfig = {
//   protocol: ProtocolNames.pancakev3,
//   chain: ChainNames.arbitrum,
//   metric: DataMetrics.dex,
//   version: DexVersions.univ3,
//   address: AddressesBook.arbitrum.PancakeFactoryV3,
//   birthday: 1686787200, // Thu Jun 15 2023 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.pancakev3Arbitrum,
//     filters: Pancakev3SubgraphFilters,
//   },
// };
//
// export const Pancakev3BaseDexConfig: DexConfig = {
//   protocol: ProtocolNames.pancakev3,
//   chain: ChainNames.base,
//   metric: DataMetrics.dex,
//   version: DexVersions.univ3,
//   address: AddressesBook.base.PancakeFactoryV3,
//   birthday: 1692662400, // Tue Aug 22 2023 00:00:00 GMT+0000
//   subgraph: {
//     endpoint: SubgraphEndpoints.data.pancakev3Base,
//     filters: Pancakev3SubgraphFilters,
//   },
// };
