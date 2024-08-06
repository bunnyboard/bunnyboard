import { DataMetrics, DexConfig, DexVersions, ProtocolConfig } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';

export interface UniswapConfig extends ProtocolConfig {
  configs: Array<DexConfig>;
}

export const Uniswapv2Configs: UniswapConfig = {
  protocol: 'uniswapv2',
  configs: [
    {
      protocol: ProtocolNames.uniswapv2,
      chain: ChainNames.ethereum,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f',
      birthblock: 10000836,
      birthday: 1590969600, // Mon Jun 01 2020 00:00:00 GMT+0000
    },
    {
      protocol: ProtocolNames.uniswapv2,
      chain: ChainNames.arbitrum,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0xf1d7cc64fb4452f05c498126312ebe29f30fbcf9',
      birthblock: 150442612,
      birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
    },
    {
      protocol: ProtocolNames.uniswapv2,
      chain: ChainNames.avalanche,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0x9e5a52f57b3038f1b8eee45f28b3c1967e22799c',
      birthblock: 37767796,
      birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
    },
    {
      protocol: ProtocolNames.uniswapv2,
      chain: ChainNames.base,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0x8909dc15e40173ff4699343b6eb8132c65e18ec6',
      birthblock: 6601916,
      birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
    },
    {
      protocol: ProtocolNames.uniswapv2,
      chain: ChainNames.optimism,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0x0c3c1c532f1e39edf36be9fe0be1410313e074bf',
      birthblock: 112197987,
      birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
    },
    {
      protocol: ProtocolNames.uniswapv2,
      chain: ChainNames.polygon,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0x9e5a52f57b3038f1b8eee45f28b3c1967e22799c',
      birthblock: 49948179,
      birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
    },
    {
      protocol: ProtocolNames.uniswapv2,
      chain: ChainNames.blast,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0x5c346464d33f90babaf70db6388507cc889c1070',
      birthblock: 399406,
      birthday: 1709683200, // Wed Mar 06 2024 00:00:00 GMT+0000
    },
    {
      protocol: ProtocolNames.uniswapv2,
      chain: ChainNames.zora,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0x0f797dc7efaea995bb916f268d919d0a1950ee3c',
      birthblock: 10973309,
      birthday: 1708732800, // Sat Feb 24 2024 00:00:00 GMT+0000
    },
  ],
};

export const Uniswapv3Configs: UniswapConfig = {
  protocol: ProtocolNames.uniswapv3,
  configs: [
    {
      protocol: ProtocolNames.uniswapv3,
      chain: ChainNames.ethereum,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x1f98431c8ad98523631ae4a59f267346ea31f984',
      birthblock: 12369622,
      birthday: 1620172800, // Wed May 05 2021 00:00:00 GMT+0000
    },
    {
      protocol: ProtocolNames.uniswapv3,
      chain: ChainNames.arbitrum,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x1f98431c8ad98523631ae4a59f267346ea31f984',
      birthblock: 166,
      birthday: 1622505600, // Tue Jun 01 2021 00:00:00 GMT+0000
    },
    {
      protocol: ProtocolNames.uniswapv3,
      chain: ChainNames.avalanche,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x740b1c1de25031c31ff4fc9a62f554a55cdc1bad',
      birthblock: 27832973,
      birthday: 1679702400, // Sat Mar 25 2023 00:00:00 GMT+0000
    },
    {
      protocol: ProtocolNames.uniswapv3,
      chain: ChainNames.bnbchain,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0xdb1d10011ad0ff90774d0c6bb92e5c5c8b4461f7',
      birthblock: 26324015,
      birthday: 1678406400, // Fri Mar 10 2023 00:00:00 GMT+0000
    },
    {
      protocol: ProtocolNames.uniswapv3,
      chain: ChainNames.base,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x33128a8fc17869897dce68ed026d694621f6fdfd',
      birthblock: 1371681,
      birthday: 1689552000, // Mon Jul 17 2023 00:00:00 GMT+0000
    },
    {
      protocol: ProtocolNames.uniswapv3,
      chain: ChainNames.blast,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x792edade80af5fc680d96a2ed80a44247d2cf6fd',
      birthblock: 400904,
      birthday: 1709683200, // Wed Mar 06 2024 00:00:00 GMT+0000
    },
    {
      protocol: ProtocolNames.uniswapv3,
      chain: ChainNames.celo,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0xafe208a311b21f13ef87e33a90049fc17a7acdec',
      birthblock: 13916356,
      birthday: 1657238400, // Fri Jul 08 2022 00:00:00 GMT+0000
    },
    {
      protocol: ProtocolNames.uniswapv3,
      chain: ChainNames.optimism,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x1f98431c8ad98523631ae4a59f267346ea31f984',
      birthblock: 1,
      birthday: 1636675200, // Fri Nov 12 2021 00:00:00 GMT+0000
    },
    {
      protocol: ProtocolNames.uniswapv3,
      chain: ChainNames.polygon,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x1f98431c8ad98523631ae4a59f267346ea31f984',
      birthblock: 22757548,
      birthday: 1640044800, // Tue Dec 21 2021 00:00:00 GMT+0000
    },
    {
      protocol: ProtocolNames.uniswapv3,
      chain: ChainNames.zksync,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x8fda5a7a8dca67bbcdd10f02fa0649a937215422',
      birthblock: 12637076,
      birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
    },
    {
      protocol: ProtocolNames.uniswapv3,
      chain: ChainNames.zora,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x7145f8aeef1f6510e92164038e1b6f8cb2c42cbb',
      birthblock: 10320369,
      birthday: 1707436800, // Fri Feb 09 2024 00:00:00 GMT+0000
    },
  ],
};
