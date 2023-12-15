import { Token } from '../configs';
import { DayDataSnapshot, TokenRewardEntry } from './base';

export interface MasterchefPoolSnapshot extends DayDataSnapshot {
  // masterchef address
  address: string;

  // pool ID
  poolId: number;

  // deposited token
  token: Token;
  tokenPrice: string;

  // allocation point
  allocationPoint: number;

  totalDeposited: string;

  // estimated reward rate (staking APY)
  rewardRate: string;

  // count number of reward tokens were distributed
  rewardForStakers: Array<TokenRewardEntry>;
  rewardForProtocol: Array<TokenRewardEntry>;
}
