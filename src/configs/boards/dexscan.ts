import { DexConfig } from '../../types/configs';
import {
  SushiArbitrumDexConfig,
  SushiAvalancheDexConfig,
  SushiBnbchainDexConfig,
  SushiEthereumDexConfig,
  SushiFantomDexConfig,
  SushiPolygonDexConfig,
  Sushiv3ArbitrumDexConfig,
  Sushiv3AvalancheDexConfig,
  Sushiv3BaseDexConfig,
  Sushiv3BnbchainDexConfig,
  Sushiv3EthereumDexConfig,
  Sushiv3FantomDexConfig,
  Sushiv3OptimismDexConfig,
  Sushiv3PolygonDexConfig,
} from '../protocols/sushi';
import {
  Uniswapv2EthereumDexConfig,
  Uniswapv3ArbitrumDexConfig,
  Uniswapv3BaseDexConfig,
  Uniswapv3BnbchainDexConfig,
  Uniswapv3EthereumDexConfig,
  Uniswapv3OptimismDexConfig,
} from '../protocols/uniswap';

export const DexscanMinimumLiquidityUsdToConsider = 10000;

export const DexscanConfigs: Array<DexConfig> = [
  Uniswapv2EthereumDexConfig,

  Uniswapv3EthereumDexConfig,
  Uniswapv3ArbitrumDexConfig,
  Uniswapv3OptimismDexConfig,
  // Uniswapv3PolygonDexConfig,
  Uniswapv3BaseDexConfig,
  Uniswapv3BnbchainDexConfig,

  SushiEthereumDexConfig,
  SushiArbitrumDexConfig,
  SushiPolygonDexConfig,
  SushiBnbchainDexConfig,
  SushiFantomDexConfig,
  SushiAvalancheDexConfig,

  Sushiv3EthereumDexConfig,
  Sushiv3ArbitrumDexConfig,
  Sushiv3OptimismDexConfig,
  Sushiv3BaseDexConfig,
  Sushiv3PolygonDexConfig,
  Sushiv3BnbchainDexConfig,
  Sushiv3FantomDexConfig,
  Sushiv3AvalancheDexConfig,
];
