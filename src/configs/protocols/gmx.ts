import { normalizeAddress } from '../../lib/utils';
import { DataMetrics, PerpetualMarketConfig, ProtocolConfig, Token } from '../../types/configs';

export interface GmxPerpetualMarketConfig extends PerpetualMarketConfig {
  reader: string;
  positionRouter: string;
}

export interface GmxProtocolConfig extends ProtocolConfig {
  configs: Array<GmxPerpetualMarketConfig>;
}

function formatGmxConfigs(configs: Array<GmxPerpetualMarketConfig>): Array<GmxPerpetualMarketConfig> {
  return configs.map((config) => {
    return {
      ...config,
      address: normalizeAddress(config.address),
      reader: normalizeAddress(config.reader),
    };
  });
}

export const GmxConfigs: GmxProtocolConfig = {
  protocol: 'gmx',
  configs: formatGmxConfigs([
    {
      chain: 'arbitrum',
      protocol: 'gmx',
      version: 'gmx',
      metric: DataMetrics.perpetual,
      birthday: 1630454400, // Wed Sep 01 2021 00:00:00 GMT+0000
      address: '0x489ee077994b6658eafa855c308275ead8097c4a',
      reader: '0x22199a49A999c351eF7927602CFB187ec3cae489',
      positionRouter: '0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868',
    },
    {
      chain: 'avalanche',
      protocol: 'gmx',
      version: 'gmx',
      metric: DataMetrics.perpetual,
      birthday: 1639785600, // Sat Dec 18 2021 00:00:00 GMT+0000
      address: '0x9ab2de34a33fb459b538c43f251eb825645e8595',
      reader: '0x67b789D48c926006F5132BFCe4e976F0A7A63d5D',
      positionRouter: '0xffF6D276Bc37c61A23f06410Dce4A400f66420f8',
    },
  ]),
};

export interface Gmxv2PerpetualMarketConfig extends PerpetualMarketConfig {
  reader: string;
  dataStore: string;
  mockTokens: Array<Token>;
}

export interface Gmxv2ProtocolConfig extends ProtocolConfig {
  configs: Array<Gmxv2PerpetualMarketConfig>;
}

function formatGmxv2Configs(configs: Array<Gmxv2PerpetualMarketConfig>): Array<Gmxv2PerpetualMarketConfig> {
  return configs.map((config) => {
    return {
      ...config,
      address: normalizeAddress(config.address),
      reader: normalizeAddress(config.reader),
      dataStore: normalizeAddress(config.dataStore),
      mockTokens: config.mockTokens.map((item) => {
        return {
          ...item,
          address: normalizeAddress(item.address),
        };
      }),
    };
  });
}

export const Gmxv2Configs: Gmxv2ProtocolConfig = {
  protocol: 'gmxv2',
  configs: formatGmxv2Configs([
    {
      chain: 'arbitrum',
      protocol: 'gmxv2',
      version: 'gmxv2',
      metric: DataMetrics.perpetual,
      birthday: 1688515200, // Wed Jul 05 2023 00:00:00 GMT+0000
      address: '0xC8ee91A54287DB53897056e12D9819156D3822Fb', // EventEmitter
      reader: '0x60a0fF4cDaF0f6D496d71e0bC0fFa86FE8E6B23c',
      dataStore: '0xFD70de6b91282D8017aA4E741e9Ae325CAb992d8',
      mockTokens: [
        {
          chain: 'arbitrum',
          symbol: 'BTC',
          decimals: 18,
          address: '0x47904963fc8b2340414262125aF798B9655E58Cd',
        },
        {
          chain: 'arbitrum',
          symbol: 'DOGE',
          decimals: 18,
          address: '0xC4da4c24fd591125c3F47b340b6f4f76111883d8',
        },
        {
          chain: 'arbitrum',
          symbol: 'LTC',
          decimals: 18,
          address: '0xB46A094Bc4B0adBD801E14b9DB95e05E28962764',
        },
        {
          chain: 'arbitrum',
          symbol: 'XRP',
          decimals: 18,
          address: '0xc14e065b0067dE91534e032868f5Ac6ecf2c6868',
        },
      ],
    },
    {
      chain: 'avalanche',
      protocol: 'gmxv2',
      version: 'gmxv2',
      metric: DataMetrics.perpetual,
      birthday: 1688515200, // Wed Jul 05 2023 00:00:00 GMT+0000
      address: '0xDb17B211c34240B014ab6d61d4A31FA0C0e20c26', // EventEmitter
      reader: '0xE27b070A6a5567770360A6781263F09F904da71a',
      dataStore: '0x2F0b22339414ADeD7D5F06f9D604c7fF5b2fe3f6',
      mockTokens: [
        {
          chain: 'avalanche',
          symbol: 'DOGE',
          decimals: 18,
          address: '0xC301E6fe31062C557aEE806cc6A841aE989A3ac6',
        },
        {
          chain: 'avalanche',
          symbol: 'LTC',
          decimals: 18,
          address: '0x8E9C35235C38C44b5a53B56A41eaf6dB9a430cD6',
        },
        {
          chain: 'avalanche',
          symbol: 'XRP',
          decimals: 18,
          address: '0x34B2885D617cE2ddeD4F60cCB49809fc17bb58Af',
        },
      ],
    },
  ]),
};
