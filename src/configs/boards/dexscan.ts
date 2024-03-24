import { DexConfig } from '../../types/configs';
import { SushiEthereumDexConfig } from '../protocols/sushi';
import { Uniswapv2EthereumDexConfig, Uniswapv3EthereumDexConfig } from '../protocols/uniswap';

export const DexscanConfigs: Array<DexConfig> = [
  Uniswapv2EthereumDexConfig,
  Uniswapv3EthereumDexConfig,
  SushiEthereumDexConfig,
];
