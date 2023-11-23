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
