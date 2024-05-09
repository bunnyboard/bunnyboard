import { DataState, DataTimeframe } from '../base';
import { Token } from '../configs';

export interface StakingPoolDataState extends DataState {
  // staking contract
  address: string;

  // what ever can identity the staking pool
  poolId: string;

  // the staking token
  token: Token;
  tokenPrice: string;

  // the reward token
  rewardToken: Token;
  rewardTokenPrice: string;

  // total supply of staking token
  totalSupply: string;

  // total staking token were being deposited
  totalDeposited: string;

  // current staking APY
  rateReward: string;
}

export interface StakingPoolDataTimeframe extends StakingPoolDataState, DataTimeframe {
  volumeDeposited: string;
  volumeWithdrawn: string;

  // number of reward token were distributed
  volumeRewardDistributed: string;

  // number of reward token were collected
  volumeRewardCollected: string;

  addresses: Array<string>;
  transactions: Array<string>;
}

export interface StakingPoolDataStateWithTimeframes extends StakingPoolDataTimeframe {
  // previous day data
  last24Hours: StakingPoolDataTimeframe | null;
}
