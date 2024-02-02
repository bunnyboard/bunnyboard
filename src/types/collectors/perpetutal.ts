import { Token } from '../configs';
import { DataState, DataTimeframe } from './base';

export interface PerpetualMarketDataState extends DataState {
  address: string; // market contract address

  // every market was identity by a given token
  token: Token;
  tokenPrice: string;

  // total token were deposited into protocol as liquidity
  totalDeposited: string;

  // total size of all positions
  totalOpenInterestShortUsd: string;
  totalOpenInterestLongUsd: string;

  // borrow rate
  rateBorrow: string;
}

export interface PerpetualMarketDataTimeframe extends PerpetualMarketDataState, DataTimeframe {
  volumeFeesPaidUsd: string;
  volumeOpenInterestShortUsd: string;
  volumeOpenInterestLongUsd: string;
  volumeTradingShort: string;
  volumeTradingLong: string;
  volumeLiquidatedUsd: string;

  numberOfUsers: number;
  numberOfTransactions: number;
}

export interface PerpetualMarketDataStateWithTimeframes extends PerpetualMarketDataState {
  timeframe24Hours: PerpetualMarketDataTimeframe | null;
  timeframe48Hours: PerpetualMarketDataTimeframe | null;
}
