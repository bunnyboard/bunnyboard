import { DataMetrics, DexConfig, DexVersions, ProtocolConfig } from '../../types/configs';
import { AddressesBook, SubgraphEndpoints } from '../data';

export interface UniswapConfig extends ProtocolConfig {
  configs: Array<DexConfig>;
}

// export to easy to use in other configs
export const Uniswapv2EthereumDexConfig: DexConfig = {
  protocol: 'uniswapv2',
  chain: 'ethereum',
  metric: DataMetrics.dex,
  version: DexVersions.univ2,
  address: AddressesBook.ethereum.UniswapFactoryV2,
  birthday: 1588636800, // Tue May 05 2020 00:00:00 GMT+0000
  subgraph: {
    version: 'univ2',
    endpoint: SubgraphEndpoints.data.uniswapv2Ethereum,
    filters: {
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
    },
  },
};

export const Uniswapv2Configs: UniswapConfig = {
  protocol: 'uniswapv2',
  configs: [Uniswapv2EthereumDexConfig],
};

// export to easy to use in other configs
export const Uniswapv3EthereumDexConfig: DexConfig = {
  protocol: 'uniswapv3',
  chain: 'ethereum',
  metric: DataMetrics.dex,
  version: DexVersions.univ3,
  address: AddressesBook.ethereum.UniswapFactoryV3,
  birthday: 1620172800, // Wed May 05 2021 00:00:00 GMT+0000
  subgraph: {
    version: 'univ3',
    endpoint: SubgraphEndpoints.data.uniswapv3Ethereum,
    filters: {
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
    },
  },
};
