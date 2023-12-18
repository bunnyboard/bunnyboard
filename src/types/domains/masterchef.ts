import { Token } from '../configs';
import { BaseActivityEvent, DayDataSnapshot, MasterchefActivityAction } from './base';

export interface MasterchefPoolSnapshot extends DayDataSnapshot {
  // masterchef address
  address: string;

  // pool ID
  poolId: number;

  // deposited token
  token: Token;
  tokenPrice: string;

  totalDeposited: string;

  // allocation point
  allocationPoint: number;
  allocationPointTotal: number;

  // calculate reward token was emitted per second
  rewardTokenPerSecond: string;

  rewardToken: Token;
  rewardTokenPrice: string;

  // RewardAmount = RewardPerSecond * TimeElapsed * AllocationPoint / AllocationPointTotal
  rewardTokenAmount: string;
}

export interface MasterchefActivityEvent extends BaseActivityEvent {
  action: MasterchefActivityAction;

  // masterchef address
  masterchef: string;

  poolId: number;
}
