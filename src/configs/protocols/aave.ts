import { LendingMarketConfig, ProtocolConfig, Token } from '../../types/configs';
import AvalancheTokenList from '../tokenlists/avalanche.json';
import EthereumTokenList from '../tokenlists/ethereum.json';
import PolygonTokenList from '../tokenlists/polygon.json';

export interface AaveLendingMarketConfig extends LendingMarketConfig {
  dataProvider: string;
  incentiveController?: {
    address: string;
    rewardTokens: Array<Token>;
  };
}

export interface AaveProtocolConfig extends ProtocolConfig {
  lendingMarkets: Array<AaveLendingMarketConfig>;
}

export const Aavev1Configs: AaveProtocolConfig = {
  protocol: 'aavev1',
  lendingMarkets: [
    {
      chain: 'ethereum',
      protocol: 'aavev1',
      type: 'cross',
      version: 'aavev1',
      birthday: 1578528000, // Thu Jan 09 2020 00:00:00 GMT+0000
      address: '0x398ec7346dcd622edc5ae82352f02be94c62d119',
      dataProvider: '', // don't use
    },
  ],
};

export const Aavev2Configs: AaveProtocolConfig = {
  protocol: 'aavev2',
  lendingMarkets: [
    {
      chain: 'ethereum',
      protocol: 'aavev2',
      type: 'cross',
      version: 'aavev2',
      birthday: 1606780800, // Tue Dec 01 2020 00:00:00 GMT+0000
      address: '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9',
      dataProvider: '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d',
      incentiveController: {
        address: '0xd784927Ff2f95ba542BfC824c8a8a98F3495f6b5',
        rewardTokens: [EthereumTokenList.AAVE],
      },
    },
    {
      chain: 'polygon',
      protocol: 'aavev2',
      type: 'cross',
      version: 'aavev2',
      birthday: 1617235200, // Thu Apr 01 2021 00:00:00 GMT+0000
      address: '0x8dff5e27ea6b7ac08ebfdf9eb090f32ee9a30fcf',
      dataProvider: '0x7551b5D2763519d4e37e8B81929D336De671d46d',
      incentiveController: {
        address: '0x357D51124f59836DeD84c8a1730D72B749d8BC23',
        rewardTokens: [PolygonTokenList.WMATIC],
      },
    },
    {
      chain: 'avalanche',
      protocol: 'aavev2',
      type: 'cross',
      version: 'aavev2',
      birthday: 1632182400, // Tue Sep 21 2021 00:00:00 GMT+0000
      address: '0x4f01aed16d97e3ab5ab2b501154dc9bb0f1a5a2c',
      dataProvider: '0x65285E9dfab318f57051ab2b139ccCf232945451',
      incentiveController: {
        address: '0x01D83Fe6A10D2f2B7AF17034343746188272cAc9',
        rewardTokens: [AvalancheTokenList.WAVAX],
      },
    },
  ],
};

export const Aavev3Configs: AaveProtocolConfig = {
  protocol: 'aavev3',
  lendingMarkets: [
    // {
    //   chain: 'ethereum',
    //   protocol: 'aavev3',
    //   type: 'cross',
    //   version: 'aavev3',
    //   birthday: 1674864000, // Sat Jan 28 2023 00:00:00 GMT+0000
    //   address: '0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2',
    //   dataProvider: '0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3',
    //   incentiveController: {
    //     address: '0x8164Cc65827dcFe994AB23944CBC90e0aa80bFcb',
    //     rewardTokens: [], // will query reward list from contract
    //   },
    // },
    // {
    //   chain: 'optimism',
    //   protocol: 'aavev3',
    //   type: 'cross',
    //   version: 'aavev3',
    //   birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
    //   address: '0x794a61358d6845594f94dc1db02a252b5b4814ad',
    //   dataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    //   incentiveController: {
    //     address: '0x929EC64c34a17401F460460D4B9390518E5B473e',
    //     rewardTokens: [], // will query reward list from contract
    //   },
    // },
    // {
    //   chain: 'arbitrum',
    //   protocol: 'aavev3',
    //   type: 'cross',
    //   version: 'aavev3',
    //   birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
    //   address: '0x794a61358d6845594f94dc1db02a252b5b4814ad',
    //   dataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    //   incentiveController: {
    //     address: '0x929EC64c34a17401F460460D4B9390518E5B473e',
    //     rewardTokens: [], // will query reward list from contract
    //   },
    // },
    // {
    //   chain: 'polygon',
    //   protocol: 'aavev3',
    //   type: 'cross',
    //   version: 'aavev3',
    //   birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
    //   address: '0x794a61358d6845594f94dc1db02a252b5b4814ad',
    //   dataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    //   incentiveController: {
    //     address: '0x929EC64c34a17401F460460D4B9390518E5B473e',
    //     rewardTokens: [], // will query reward list from contract
    //   },
    // },
    // {
    //   chain: 'avalanche',
    //   protocol: 'aavev3',
    //   type: 'cross',
    //   version: 'aavev3',
    //   birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
    //   address: '0x794a61358d6845594f94dc1db02a252b5b4814ad',
    //   dataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    //   incentiveController: {
    //     address: '0x929EC64c34a17401F460460D4B9390518E5B473e',
    //     rewardTokens: [], // will query reward list from contract
    //   },
    // },
    // {
    //   chain: 'fantom',
    //   protocol: 'aavev3',
    //   type: 'cross',
    //   version: 'aavev3',
    //   birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
    //   address: '0x794a61358d6845594f94dc1db02a252b5b4814ad',
    //   dataProvider: '0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654',
    //   incentiveController: {
    //     address: '0x929EC64c34a17401F460460D4B9390518E5B473e',
    //     rewardTokens: [], // will query reward list from contract
    //   },
    // },
    // {
    //   chain: 'base',
    //   protocol: 'aavev3',
    //   type: 'cross',
    //   version: 'aavev3',
    //   birthday: 1691539200, // Wed Aug 09 2023 00:00:00 GMT+0000
    //   address: '0xa238dd80c259a72e81d7e4664a9801593f98d1c5',
    //   dataProvider: '0x2d8A3C5677189723C4cB8873CfC9C8976FDF38Ac',
    //   incentiveController: {
    //     address: '0xf9cc4F0D883F1a1eb2c253bdb46c254Ca51E1F44',
    //     rewardTokens: [], // will query reward list from contract
    //   },
    // },
    // {
    //   chain: 'metis',
    //   protocol: 'aavev3',
    //   type: 'cross',
    //   version: 'aavev3',
    //   birthday: 1682294400, // Mon Apr 24 2023 00:00:00 GMT+0000
    //   address: '0x90df02551bB792286e8D4f13E0e357b4Bf1D6a57',
    //   dataProvider: '0x99411FC17Ad1B56f49719E3850B2CDcc0f9bBFd8',
    //   incentiveController: {
    //     address: '0x30C1b8F0490fa0908863d6Cbd2E36400b4310A6B',
    //     rewardTokens: [], // will query reward list from contract
    //   },
    // },
    {
      chain: 'gnosis',
      protocol: 'aavev3',
      type: 'cross',
      version: 'aavev3',
      birthday: 1696464000, // Thu Oct 05 2023 00:00:00 GMT+0000
      address: '0xb50201558B00496A145fE76f7424749556E326D8',
      dataProvider: '0x501B4c19dd9C2e06E94dA7b6D5Ed4ddA013EC741',
      incentiveController: {
        address: '0xaD4F91D26254B6B0C6346b390dDA2991FDE2F20d',
        rewardTokens: [], // will query reward list from contract
      },
    },
  ],
};
