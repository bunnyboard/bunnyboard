import { CdpLendingMarketConfig, DataMetrics, LendingMarketVersions, ProtocolConfig } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';

export interface GravitaLendingMarketConfig extends CdpLendingMarketConfig {
  address: string; // debt token address
  adminContract: string;
  borrowOperations: string;
  vesselManager: string;
  oracle: string;
}

export interface GravitaProtocolConfig extends ProtocolConfig {
  configs: Array<GravitaLendingMarketConfig>;
}

export const GravitaConfigs: GravitaProtocolConfig = {
  protocol: ProtocolNames.gravita,
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.gravita,
      metric: DataMetrics.cdpLending,
      version: LendingMarketVersions.cdp.gravita,
      birthday: 1684281600, // Wed May 17 2023 00:00:00 GMT+0000
      address: '0x15f74458ae0bfdaa1a96ca1aa779d715cc1eefe4', // GRAI,
      debtToken: {
        chain: ChainNames.ethereum,
        symbol: 'GRAI',
        decimals: 18,
        address: '0x15f74458ae0bfdaa1a96ca1aa779d715cc1eefe4',
      },
      adminContract: '0xf7cc67326f9a1d057c1e4b110ef6c680b13a1f53',
      borrowOperations: '0x2bca0300c2aa65de6f19c2d241b54a445c9990e2',
      vesselManager: '0xdb5dacb1dfbe16326c3656a88017f0cb4ece0977',
      oracle: '0x89f1eccf2644902344db02788a790551bb070351',
    },
    {
      chain: ChainNames.arbitrum,
      protocol: ProtocolNames.gravita,
      metric: DataMetrics.cdpLending,
      version: LendingMarketVersions.cdp.gravita,
      birthday: 1687996800, // Thu Jun 29 2023 00:00:00 GMT+0000
      address: '0x894134a25a5fac1c2c26f1d8fbf05111a3cb9487', // GRAI,
      debtToken: {
        chain: ChainNames.arbitrum,
        symbol: 'GRAI',
        decimals: 18,
        address: '0x894134a25a5fac1c2c26f1d8fbf05111a3cb9487',
      },
      adminContract: '0x4928c8f8c20a1e3c295dddbe05095a9abbdb3d14',
      borrowOperations: '0x89f1eccf2644902344db02788a790551bb070351',
      vesselManager: '0x6adaa3eba85c77e8566b73aefb4c2f39df4046ca',
      oracle: '0xf0e0915d233c616cb727e0b2ca29ff0cbd51b66a',
    },
    {
      chain: ChainNames.linea,
      protocol: ProtocolNames.gravita,
      metric: DataMetrics.cdpLending,
      version: LendingMarketVersions.cdp.gravita,
      birthday: 1699488000, // Thu Nov 09 2023 00:00:00 GMT+0000
      address: '0x894134a25a5fac1c2c26f1d8fbf05111a3cb9487', // GRAI,
      debtToken: {
        chain: ChainNames.linea,
        symbol: 'GRAI',
        decimals: 18,
        address: '0x894134a25a5fac1c2c26f1d8fbf05111a3cb9487',
      },
      adminContract: '0xc8a25ea0cbd92a6f787aeed8387e04559053a9f8',
      borrowOperations: '0x40e0e274a42d9b1a9d4b64dc6c46d21228d45c20',
      vesselManager: '0xdc44093198ee130f92defed22791aa8d8df7fbfa',
      oracle: '0xad1b9867befd148c9476b9dd1e7c749bfcefbb2e',
    },
    {
      chain: ChainNames.mantle,
      protocol: ProtocolNames.gravita,
      metric: DataMetrics.cdpLending,
      version: LendingMarketVersions.cdp.gravita,
      birthday: 1704240000, // Wed Jan 03 2024 00:00:00 GMT+0000
      address: '0x894134a25a5fac1c2c26f1d8fbf05111a3cb9487', // GRAI,
      debtToken: {
        chain: ChainNames.mantle,
        symbol: 'GRAI',
        decimals: 18,
        address: '0x894134a25a5fac1c2c26f1d8fbf05111a3cb9487',
      },
      adminContract: '0x4f39f12064d83f6dd7a2bdb0d53af8be560356a6',
      borrowOperations: '0xdb5dacb1dfbe16326c3656a88017f0cb4ece0977',
      vesselManager: '0x5c3b45c9f9c6e3d37de94bc03318622d3dd3f525',
      oracle: '0x53525a62e55b6002792b993a2c27af70d12443e4',
    },
    {
      chain: ChainNames.optimism,
      protocol: ProtocolNames.gravita,
      metric: DataMetrics.cdpLending,
      version: LendingMarketVersions.cdp.gravita,
      birthday: 1704240000, // Wed Jan 03 2024 00:00:00 GMT+0000
      address: '0x894134a25a5fac1c2c26f1d8fbf05111a3cb9487', // GRAI,
      debtToken: {
        chain: ChainNames.optimism,
        symbol: 'GRAI',
        decimals: 18,
        address: '0x894134a25a5fac1c2c26f1d8fbf05111a3cb9487',
      },
      adminContract: '0x326398de2db419ee39f97600a5eee97093cf3b27',
      borrowOperations: '0x82e34e39126190e622ebb2801e047d587ac94c5d',
      vesselManager: '0x40e0e274a42d9b1a9d4b64dc6c46d21228d45c20',
      oracle: '0x15f74458ae0bfdaa1a96ca1aa779d715cc1eefe4',
    },
    {
      chain: ChainNames.polygonzkevm,
      protocol: ProtocolNames.gravita,
      metric: DataMetrics.cdpLending,
      version: LendingMarketVersions.cdp.gravita,
      birthday: 1690848000, // Tue Aug 01 2023 00:00:00 GMT+0000
      address: '0xca68ad4ee5c96871ec6c6dac2f714a8437a3fe66', // GRAI,
      debtToken: {
        chain: ChainNames.polygonzkevm,
        symbol: 'GRAI',
        decimals: 18,
        address: '0xca68ad4ee5c96871ec6c6dac2f714a8437a3fe66',
      },
      adminContract: '0x6b42581ac12f442503dfb3dff2bc75ed83850637',
      borrowOperations: '0xc818f878f27d0273fb53b71d281c82921f0af15c',
      vesselManager: '0x57a1953bf194a1ef73396e442ac7dc761dcd23cc',
      oracle: '0x5c3b45c9f9c6e3d37de94bc03318622d3dd3f525',
    },
    {
      chain: ChainNames.zksync,
      protocol: ProtocolNames.gravita,
      metric: DataMetrics.cdpLending,
      version: LendingMarketVersions.cdp.gravita,
      birthday: 1689379200, // Sat Jul 15 2023 00:00:00 GMT+0000
      address: '0x5fc44e95eaa48f9eb84be17bd3ac66b6a82af709', // GRAI,
      debtToken: {
        chain: ChainNames.zksync,
        symbol: 'GRAI',
        decimals: 18,
        address: '0x5fc44e95eaa48f9eb84be17bd3ac66b6a82af709',
      },
      adminContract: '0x441f6b484fd60c31b3ca9c61014030b0403f805a',
      borrowOperations: '0xd085fd2338cefb9cbd212f74d479072c1e7a25bf',
      vesselManager: '0x8d9cdd9372740933702d606ead3bb55dffdc6303',
      oracle: '0x086d0981204b3e603bf8b70d42680da10b4dda31',
    },
  ],
};
