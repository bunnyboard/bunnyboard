import { Token } from '../configs';

export interface TokenRewardEntry {
  token: Token;
  tokenPrice: string;
  tokenAmount: string;
}

export interface DayDataSnapshot {
  // the protocol id
  protocol: string;

  // chain where data was collected
  chain: string;

  // StartDayTimestamp
  // historical data was query at the StartDayTimestamp
  // volumes were count from the StartDayTimestamp to EndDayTimestamp - 1
  timestamp: number;
}

export type LendingActivityAction = 'deposit' | 'withdraw' | 'borrow' | 'repay' | 'liquidate';
export type MasterchefActivityAction = 'deposit' | 'withdraw' | 'emergencyWithdraw' | 'harvest';

export interface BaseActivityEvent {
  chain: string;

  protocol: string;

  transactionHash: string;

  // log index should form in the format: logIndex:actionIndex
  // some protocol have multiple actions in a single log entry
  // we need to identify them by given them an additional unique index
  // if we got only an activity in single log entry
  // so the logIndex should be logIndex:0
  // we just increase actionIndex for other activities: logIndex:1, logIndex:2, ..., logIndex:n
  logIndex: string;

  blockNumber: number;

  // activity action
  action: LendingActivityAction | MasterchefActivityAction;

  // user address
  user: string;

  // market token
  token: Token;

  tokenAmount: string;
}
