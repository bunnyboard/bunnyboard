import { DataMetric, Token } from '../configs';

export interface TokenAmountEntry {
  token: Token;
  amount: string;
  tokenPrice?: string;
}

export interface DayDataSnapshot {
  // the protocol id
  protocol: string;

  // data metric id
  metric: DataMetric;

  // chain where data was collected
  chain: string;

  // StartDayTimestamp
  // historical data was query at the StartDayTimestamp
  // volumes were count from the StartDayTimestamp to EndDayTimestamp - 1
  timestamp: number;
}

export const ActivityActions = {
  deposit: 'deposit',
  withdraw: 'withdraw',
  borrow: 'borrow',
  repay: 'repay',
  liquidate: 'liquidate',
  collect: 'collect',
};

const Actions = Object.values(ActivityActions);
export type ActivityAction = (typeof Actions)[number];

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

  timestamp: number;

  // activity action
  action: ActivityAction;

  // user address
  user: string;

  // market token
  token: Token;

  tokenAmount: string;

  // in case additional data for some protocols
  additional?: any;
}
