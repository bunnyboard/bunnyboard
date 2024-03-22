import { DataMetrics, TokenBoardErc20Config } from '../../types/configs';

export const TokenBoardErc20Configs: Array<TokenBoardErc20Config> = [
  {
    chain: 'ethereum',
    protocol: 'maker',
    metric: DataMetrics.tokenBoardErc20,
    birthday: 1573689600, // Thu Nov 14 2019 00:00:00 GMT+0000
    symbol: 'DAI',
    decimals: 18,
    stablecoin: true,
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
  },
  {
    chain: 'ethereum',
    protocol: 'maker',
    metric: DataMetrics.tokenBoardErc20,
    birthday: 1511654400, // Sun Nov 26 2017 00:00:00 GMT+0000
    symbol: 'MKR',
    decimals: 18,
    stablecoin: true,
    address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
  },
];
