import { DataMetrics, MetricConfig, ProtocolConfig, Token } from '../../types/configs';

export interface Erc20Config extends MetricConfig, Token {
  stablecoin: boolean;
}

export interface Erc20ProtocolConfig extends ProtocolConfig {
  configs: Array<Erc20Config>;
}

export const TokenBoardConfigs: Erc20ProtocolConfig = {
  protocol: 'tokenboard',
  configs: [
    {
      chain: 'ethereum',
      protocol: 'maker',
      metric: DataMetrics.erc20,
      birthday: 1573689600, // Thu Nov 14 2019 00:00:00 GMT+0000
      symbol: 'DAI',
      decimals: 18,
      stablecoin: true,
      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    },
  ],
};
