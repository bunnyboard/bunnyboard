import { DataMetrics, DexConfig, DexVersions, ProtocolConfig } from '../../types/configs';
import { AddressesBook } from '../data';

export interface UniswapConfig extends ProtocolConfig {
  configs: Array<DexConfig>;
}

// export to easy to use in other configs
export const Uniswapv2EthereumDexConfig: DexConfig = {
  protocol: 'uniswapv2',
  chain: 'ethereum',
  metric: DataMetrics.dex,
  version: DexVersions.uniswapv2,
  address: AddressesBook.ethereum.UniswapFactoryV2,
  birthday: 1588636800, /// Tue May 05 2020 00:00:00 GMT+0000
};

export const Uniswapv2Configs: UniswapConfig = {
  protocol: 'uniswapv2',
  configs: [Uniswapv2EthereumDexConfig],
};
