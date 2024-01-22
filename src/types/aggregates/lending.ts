import { Token } from '../configs';
import { DataValueItem } from './common';

export interface AggCrossLendingMarketState {
  chain: string;
  protocol: string;
  address: string;
  token: Token;
  tokenPrice: number;

  totalDeposited: DataValueItem;
  totalBorrowed: DataValueItem;

  rateSupply: number;
  rateBorrow: number;
  rateBorrowStable?: number;

  rateRewardSupply: number;
  rateRewardBorrow: number;
  rateRewardBorrowStable?: number;

  rateLoanToValue: number;

  // the last time data were updated
  // or 00:00 UTC per day
  timestamp: number;
}

export interface AggCrossLendingMarketSnapshot extends AggCrossLendingMarketState {
  volumeDeposited: DataValueItem;
  volumeWithdrawn: DataValueItem;
  volumeBorrowed: DataValueItem;
  volumeRepaid: DataValueItem;
  totalFeesPaid: DataValueItem;

  numberOfUsers: number;
  numberOfTransactions: number;
}

export interface AggCrossLendingDayData {
  timestamp: number;
  totalDeposited: DataValueItem;
  totalBorrowed: DataValueItem;
  volumeDeposited: DataValueItem;
  volumeWithdrawn: DataValueItem;
  volumeBorrowed: DataValueItem;
  volumeRepaid: DataValueItem;
}

export interface AggCrossLendingOverallState {
  totalDeposited: DataValueItem;
  totalBorrowed: DataValueItem;
  numberOfChains: number;
  numberOfProtocols: number;
  markets: Array<AggCrossLendingMarketState>;
  dayData: Array<AggCrossLendingDayData>;
}
