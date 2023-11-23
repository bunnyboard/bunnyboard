import { LendingMarketConfig, ProtocolConfig } from '../../types/configs';

export interface AaveLendingMarketConfig extends LendingMarketConfig {
  dataProvider: string;
}

export interface AaveProtocolConfig extends ProtocolConfig {
  lendingMarkets: Array<AaveLendingMarketConfig>;
}

export const Aavev2Configs: AaveProtocolConfig = {
  protocol: 'aavev2',
  chains: ['ethereum'],
  lendingMarkets: [
    {
      chain: 'ethereum',
      protocol: 'aavev2',
      version: 'aavev2',
      birthday: 1606780800, // Tue Dec 01 2020 00:00:00 GMT+0000
      address: '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9',
      dataProvider: '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d',
    },
  ],
};

export const Aavev3Configs: AaveProtocolConfig = {
  protocol: 'aavev3',
  chains: ['ethereum'],
  lendingMarkets: [
    {
      chain: 'ethereum',
      protocol: 'aavev3',
      version: 'aavev3',
      birthday: 1672444800, // Sat Dec 31 2022 00:00:00 GMT+0000
      address: '0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2',
      dataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3',
    },
  ],
};
