import { ChainBoardConfig, DataMetrics } from '../../types/configs';
import { ChainNames } from '../names';

const CommonBirthday = 1704067200; // Mon Jan 01 2024 00:00:00 GMT+0000

export const ChainBoardConfigs: Array<ChainBoardConfig> = [
  {
    chain: ChainNames.ethereum,
    metric: DataMetrics.chainBoard,
    birthday: CommonBirthday,
  },
  {
    chain: ChainNames.arbitrum,
    metric: DataMetrics.chainBoard,
    birthday: CommonBirthday,
  },
  {
    chain: ChainNames.optimism,
    metric: DataMetrics.chainBoard,
    birthday: CommonBirthday,
  },
  {
    chain: ChainNames.base,
    metric: DataMetrics.chainBoard,
    birthday: CommonBirthday,
  },
  {
    chain: ChainNames.polygon,
    metric: DataMetrics.chainBoard,
    birthday: CommonBirthday,
  },
  {
    chain: ChainNames.bnbchain,
    metric: DataMetrics.chainBoard,
    birthday: CommonBirthday,
  },
];
