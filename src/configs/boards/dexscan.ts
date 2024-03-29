import { DexConfig } from '../../types/configs';
import {
  KyberswapArbitrumDexConfig,
  KyberswapAvalancheDexConfig,
  KyberswapBaseDexConfig,
  KyberswapBnbchainDexConfig,
  KyberswapEthereumDexConfig,
  KyberswapFantomDexConfig,
  KyberswapOptimismDexConfig,
  KyberswapPolygonDexConfig,
} from '../protocols/kyberswap';
import {
  PancakeArbitrumDexConfig,
  PancakeBaseDexConfig,
  PancakeEthereumDexConfig,
  Pancakev3ArbitrumDexConfig,
  Pancakev3BaseDexConfig,
  Pancakev3EthereumDexConfig,
} from '../protocols/pancake';
import { SpookyEthereumDexConfig } from '../protocols/spooky';
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

export const DexscanMinimumVolumeCumulativeUsdToConsider = 1000000;

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

  // PancakeBnbchainDexConfig,
  PancakeEthereumDexConfig,
  PancakeArbitrumDexConfig,
  PancakeBaseDexConfig,

  // Pancakev3BnbchainDexConfig,
  Pancakev3EthereumDexConfig,
  Pancakev3ArbitrumDexConfig,
  Pancakev3BaseDexConfig,

  KyberswapEthereumDexConfig,
  KyberswapArbitrumDexConfig,
  KyberswapOptimismDexConfig,
  KyberswapBaseDexConfig,
  KyberswapPolygonDexConfig,
  KyberswapBnbchainDexConfig,
  KyberswapAvalancheDexConfig,
  KyberswapFantomDexConfig,

  SpookyEthereumDexConfig,
];
