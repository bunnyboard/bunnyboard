import { DataMetrics, TokenBoardErc20Config } from '../../types/configs';
import { TokensBookBase } from '../data';

export const TokenBoardErc20Configs: Array<TokenBoardErc20Config> = [
  {
    ...TokensBookBase.ethereum.DAI,
    protocol: 'maker',
    metric: DataMetrics.tokenBoardErc20,
    stablecoin: true,
    birthday: 1573689600, // Thu Nov 14 2019 00:00:00 GMT+0000
  },
  {
    ...TokensBookBase.ethereum.USDC,
    protocol: 'circle',
    metric: DataMetrics.tokenBoardErc20,
    stablecoin: true,
    birthday: 1533340800, // Sat Aug 04 2018 00:00:00 GMT+0000
  },
  {
    ...TokensBookBase.ethereum.USDT,
    protocol: 'tether',
    metric: DataMetrics.tokenBoardErc20,
    stablecoin: true,
    birthday: 1511913600, // Wed Nov 29 2017 00:00:00 GMT+0000
  },
  {
    ...TokensBookBase.ethereum.WBTC,
    protocol: 'wbtc',
    metric: DataMetrics.tokenBoardErc20,
    stablecoin: false,
    birthday: 1543104000, // Sun Nov 25 2018 00:00:00 GMT+0000
  },
  {
    ...TokensBookBase.ethereum.SUSHI,
    protocol: 'sushi',
    metric: DataMetrics.tokenBoardErc20,
    stablecoin: false,
    birthday: 1598486400, // Thu Aug 27 2020 00:00:00 GMT+0000
  },
  {
    ...TokensBookBase.ethereum.UNI,
    protocol: 'uniswap',
    metric: DataMetrics.tokenBoardErc20,
    stablecoin: false,
    birthday: 1600128000, // Tue Sep 15 2020 00:00:00 GMT+0000
  },
  {
    ...TokensBookBase.ethereum.MKR,
    protocol: 'maker',
    metric: DataMetrics.tokenBoardErc20,
    stablecoin: false,
    birthday: 1511654400, // Sun Nov 26 2017 00:00:00 GMT+0000
  },
];
