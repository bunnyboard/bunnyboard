import { LendingMarketConfig, ProtocolConfig, Token } from '../../types/configs';

export interface CompoundLendingMarketConfig extends LendingMarketConfig {
  underlying: Token;
}

export interface CompoundProtocolConfig extends ProtocolConfig {
  lendingMarkets: Array<CompoundLendingMarketConfig>;
}

export const CompoundConfigs: CompoundProtocolConfig = {
  protocol: 'compound',
  chains: ['ethereum'],
  lendingMarkets: [
    {
      chain: 'ethereum',
      protocol: 'compound',
      version: 'compound',
      birthday: 1557273600, // Wed May 08 2019 00:00:00 GMT+0000
      address: '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5',
      underlying: {
        chain: 'ethereum',
        symbol: 'ETH',
        decimals: 18,
        address: '0x0000000000000000000000000000000000000000',
      },
    },
  ],
};

export const Compoundv3Configs: ProtocolConfig = {
  protocol: 'compoundv3',
  chains: ['ethereum', 'arbitrum', 'polygon'],
  lendingMarkets: [
    {
      chain: 'ethereum',
      protocol: 'compoundv3',
      version: 'compoundv3',
      birthday: 1660521600, // Mon Aug 15 2022 00:00:00 GMT+0000
      address: '0xc3d688b66703497daa19211eedff47f25384cdc3', // USDC market
    },
    {
      chain: 'ethereum',
      protocol: 'compoundv3',
      version: 'compoundv3',
      birthday: 1673654400, // Sat Jan 14 2023 00:00:00 GMT+0000
      address: '0xa17581a9e3356d9a858b789d68b4d866e593ae94', // WETH market
    },
    {
      chain: 'arbitrum',
      protocol: 'compoundv3',
      version: 'compoundv3',
      birthday: 1683244800, // Fri May 05 2023 00:00:00 GMT+0000
      address: '0xa5edbdd9646f8dff606d7448e414884c7d905dca', // USDC
    },
    {
      chain: 'arbitrum',
      protocol: 'compoundv3',
      version: 'compoundv3',
      birthday: 1692230400, // Thu Aug 17 2023 00:00:00 GMT+0000
      address: '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf', // USDC
    },
    {
      chain: 'base',
      protocol: 'compoundv3',
      version: 'compoundv3',
      birthday: 1691193600, // Sat Aug 05 2023 00:00:00 GMT+0000
      address: '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf', // USDC
    },
    {
      chain: 'base',
      protocol: 'compoundv3',
      version: 'compoundv3',
      birthday: 1691798400, // Sat Aug 12 2023 00:00:00 GMT+0000
      address: '0x46e6b214b524310239732d51387075e0e70970bf', // USDC
    },
    {
      chain: 'polygon',
      protocol: 'compoundv3',
      version: 'compoundv3',
      birthday: 1676678400, // Sat Feb 18 2023 00:00:00 GMT+0000
      address: '0xf25212e676d1f7f89cd72ffee66158f541246445', // USDC
    },
  ],
};
