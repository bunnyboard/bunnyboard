import { LendingMarketConfig, ProtocolConfig } from '../../types/configs';

export interface AaveLendingMarketConfig extends LendingMarketConfig {
  dataProvider: string;
}

export interface AaveProtocolConfig extends ProtocolConfig {
  lendingMarkets: Array<AaveLendingMarketConfig>;
}

export const Aavev2Configs: AaveProtocolConfig = {
  protocol: 'aavev2',
  lendingMarkets: [
    {
      chain: 'ethereum',
      protocol: 'aavev2',
      version: 'aavev2',
      birthday: 1606780800, // Tue Dec 01 2020 00:00:00 GMT+0000
      address: '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9',
      dataProvider: '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d',
    },
    {
      chain: 'polygon',
      protocol: 'aavev2',
      version: 'aavev2',
      birthday: 1617235200, // Thu Apr 01 2021 00:00:00 GMT+0000
      address: '0x8dff5e27ea6b7ac08ebfdf9eb090f32ee9a30fcf',
      dataProvider: '0x7551b5D2763519d4e37e8B81929D336De671d46d',
    },
    {
      chain: 'avalanche',
      protocol: 'aavev2',
      version: 'aavev2',
      birthday: 1632182400, // Tue Sep 21 2021 00:00:00 GMT+0000
      address: '0x4f01aed16d97e3ab5ab2b501154dc9bb0f1a5a2c',
      dataProvider: '0x65285E9dfab318f57051ab2b139ccCf232945451',
    },
  ],
};

export const Aavev3Configs: AaveProtocolConfig = {
  protocol: 'aavev3',
  lendingMarkets: [
    {
      chain: 'ethereum',
      protocol: 'aavev3',
      version: 'aavev3',
      birthday: 1672444800, // Sat Dec 31 2022 00:00:00 GMT+0000
      address: '0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2',
      dataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3',
    },
    {
      chain: 'optimism',
      protocol: 'aavev3',
      version: 'aavev3',
      birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
      address: '0x794a61358d6845594f94dc1db02a252b5b4814ad',
      dataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    },
    {
      chain: 'arbitrum',
      protocol: 'aavev3',
      version: 'aavev3',
      birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
      address: '0x794a61358d6845594f94dc1db02a252b5b4814ad',
      dataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    },
    {
      chain: 'polygon',
      protocol: 'aavev3',
      version: 'aavev3',
      birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
      address: '0x794a61358d6845594f94dc1db02a252b5b4814ad',
      dataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    },
    {
      chain: 'avalanche',
      protocol: 'aavev3',
      version: 'aavev3',
      birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
      address: '0x794a61358d6845594f94dc1db02a252b5b4814ad',
      dataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    },
    {
      chain: 'fantom',
      protocol: 'aavev3',
      version: 'aavev3',
      birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
      address: '0x794a61358d6845594f94dc1db02a252b5b4814ad',
      dataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    },
    {
      chain: 'base',
      protocol: 'aavev3',
      version: 'aavev3',
      birthday: 1691539200, // Wed Aug 09 2023 00:00:00 GMT+0000
      address: '0xa238dd80c259a72e81d7e4664a9801593f98d1c5',
      dataProvider: '0x2d8A3C5677189723C4cB8873CfC9C8976FDF38Ac',
    },
  ],
};
