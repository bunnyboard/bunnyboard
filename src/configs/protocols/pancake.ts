import { DataMetrics, DexConfig, DexVersions, ProtocolConfig } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';

export interface PancakeConfig extends ProtocolConfig {
  configs: Array<DexConfig>;
}

export const PancakeConfigs: PancakeConfig = {
  protocol: ProtocolNames.pancake,
  configs: [
    // dex v2
    {
      chain: ChainNames.bnbchain,
      protocol: ProtocolNames.pancake,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.0025', // 0.25%
      address: '0xca143ce32fe78f1f7019d7d551a6402fc5350c73',
      birthblock: 6809737,
      birthday: 1619222400, // Sat Apr 24 2021 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.pancake,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.0025', // 0.25%
      address: '0x1097053fd2ea711dad45caccc45eff7548fcb362',
      birthblock: 15614590,
      birthday: 1664236800, // Tue Sep 27 2022 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.zksync,
      protocol: ProtocolNames.pancake,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.0025', // 0.25%
      address: '0xd03d8d566183f0086d8d09a84e1e30b58dd5619d',
      birthblock: 8637655,
      birthday: 1689465600, // Sun Jul 16 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.arbitrum,
      protocol: ProtocolNames.pancake,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.0025', // 0.25%
      address: '0x02a84c1b3bbd7401a5f7fa98a384ebc70bb5749e',
      birthblock: 101022992,
      birthday: 1686787200, // Thu Jun 15 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.base,
      protocol: ProtocolNames.pancake,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.0025', // 0.25%
      address: '0x02a84c1b3bbd7401a5f7fa98a384ebc70bb5749e',
      birthblock: 2910387,
      birthday: 1692662400, // Tue Aug 22 2023 00:00:00 GMT+0000
    },
  ],
};

export const Pancakev3Configs: PancakeConfig = {
  protocol: ProtocolNames.pancakev3,
  configs: [
    {
      chain: ChainNames.bnbchain,
      protocol: ProtocolNames.pancakev3,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865',
      birthblock: 26956207,
      birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.pancakev3,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865',
      birthblock: 16950686,
      birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.arbitrum,
      protocol: ProtocolNames.pancakev3,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865',
      birthblock: 101028949,
      birthday: 1686787200, // Thu Jun 15 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.base,
      protocol: ProtocolNames.pancakev3,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x0bfbcf9fa4f9c56b0f40a671ad40e0805a091865',
      birthblock: 2912007,
      birthday: 1692662400, // Tue Aug 22 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.zksync,
      protocol: ProtocolNames.pancakev3,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x1bb72e0cbbea93c08f535fc7856e0338d7f7a8ab',
      birthblock: 8639214,
      birthday: 1689465600, // Sun Jul 16 2023 00:00:00 GMT+0000
    },
  ],
};
