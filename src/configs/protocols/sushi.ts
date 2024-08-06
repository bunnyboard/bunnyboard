import {
  DataMetrics,
  DexConfig,
  DexVersions,
  ProtocolConfig,
  StakingConfig,
  StakingVersions,
  Token,
} from '../../types/configs';
import { TokensBook } from '../data';
import { ChainNames, ProtocolNames } from '../names';

export interface SushiBarConfig extends StakingConfig {
  poolId: string;
  token: Token;
  sushiLp: string;
}

export interface SushiConfig extends ProtocolConfig {
  configs: Array<SushiBarConfig | DexConfig>;
}

export const SushiConfigs: SushiConfig = {
  protocol: 'sushi',
  configs: [
    // dex v2
    {
      chain: ChainNames.arbitrum,
      protocol: ProtocolNames.sushi,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      birthblock: 228460, // the first pair was deployed
      birthday: 1622419200, // Mon May 31 2021 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.avalanche,
      protocol: ProtocolNames.sushi,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      birthblock: 506191,
      birthday: 1615334400, // Wed Mar 10 2021 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.base,
      protocol: ProtocolNames.sushi,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0x71524b4f93c58fcbf659783284e38825f0622859',
      birthblock: 2631214,
      birthday: 1692057600, // Tue Aug 15 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.blast,
      protocol: ProtocolNames.sushi,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0x42fa929fc636e657ac568c0b5cf38e203b67ac2b',
      birthblock: 285621,
      birthday: 1709424000, // Sun Mar 03 2024 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.bnbchain,
      protocol: ProtocolNames.sushi,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      birthblock: 5205069,
      birthday: 1614384000, // Sat Feb 27 2021 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.celo,
      protocol: ProtocolNames.sushi,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      birthblock: 7253488,
      birthday: 1623888000, // Thu Jun 17 2021 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.sushi,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac',
      birthblock: 10794229,
      birthday: 1599264000, // Sat Sep 05 2020 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.fantom,
      protocol: ProtocolNames.sushi,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      birthblock: 2457879,
      birthday: 1614384000, // Sat Feb 27 2021 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.gnosis,
      protocol: ProtocolNames.sushi,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      birthblock: 14735904,
      birthday: 1614384000, // Sat Feb 27 2021 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.optimism,
      protocol: ProtocolNames.sushi,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0xfbc12984689e5f15626bad03ad60160fe98b303c',
      birthblock: 110882086,
      birthday: 1697414400, // Mon Oct 16 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.polygon,
      protocol: ProtocolNames.sushi,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      birthblock: 11333218,
      birthday: 1614384000, // Sat Feb 27 2021 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.scroll,
      protocol: ProtocolNames.sushi,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0xb45e53277a7e0f1d35f2a77160e91e25507f1763',
      birthblock: 81841,
      birthday: 1697587200, // Wed Oct 18 2023 00:00:00 GMT+0000
    },

    // SUSHI staking
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.sushi,
      metric: DataMetrics.staking,
      version: StakingVersions.xsushi,
      poolId: 'xSushi',
      birthday: 1599696000, // Thu Sep 10 2020 00:00:00 GMT+0000
      token: TokensBook.ethereum['0x6b3595068778dd592e39a122f4f5a5cf09c90fe2'],
      address: '0x8798249c2e607446efb7ad49ec89dd1865ff4272',
      sushiLp: '0x795065dcc9f64b5614c407a6efdc400da6221fb0',
    },
  ],
};

export const Sushiv3Configs: SushiConfig = {
  protocol: ProtocolNames.sushiv3,
  configs: [
    {
      chain: ChainNames.arbitrum,
      protocol: ProtocolNames.sushiv3,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x1af415a1eba07a4986a52b6f2e7de7003d82231e',
      birthblock: 75998697,
      birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.avalanche,
      protocol: ProtocolNames.sushiv3,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x3e603c14af37ebdad31709c4f848fc6ad5bec715',
      birthblock: 28186391,
      birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.base,
      protocol: ProtocolNames.sushiv3,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      birthblock: 1759510,
      birthday: 1690329600, // Wed Jul 26 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.blast,
      protocol: ProtocolNames.sushiv3,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x7680d4b43f3d1d54d6cfeeb2169463bfa7a6cf0d',
      birthblock: 284122,
      birthday: 1709424000, // Sun Mar 03 2024 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.bnbchain,
      protocol: ProtocolNames.sushiv3,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x126555dd55a39328f69400d6ae4f782bd4c34abb',
      birthblock: 26976538,
      birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.sushiv3,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0xbaceb8ec6b9355dfc0269c18bac9d6e2bdc29c4f',
      birthblock: 16955547,
      birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.fantom,
      protocol: ProtocolNames.sushiv3,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x7770978eed668a3ba661d51a773d3a992fc9ddcb',
      birthblock: 58860670,
      birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.gnosis,
      protocol: ProtocolNames.sushiv3,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0xf78031cbca409f2fb6876bdfdbc1b2df24cf9bef',
      birthblock: 27232871,
      birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.optimism,
      protocol: ProtocolNames.sushiv3,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x9c6522117e2ed1fe5bdb72bb0ed5e3f2bde7dbe0',
      birthblock: 85432013,
      birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.polygon,
      protocol: ProtocolNames.sushiv3,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x917933899c6a5f8e37f31e19f92cdbff7e8ff0e2',
      birthblock: 41024971,
      birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.scroll,
      protocol: ProtocolNames.sushiv3,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x46b3fdf7b5cde91ac049936bf0bdb12c5d22202e',
      birthblock: 82522,
      birthday: 1697587200, // Wed Oct 18 2023 00:00:00 GMT+0000
    },
  ],
};
