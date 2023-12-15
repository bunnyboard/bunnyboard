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
