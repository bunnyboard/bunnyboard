import { Token } from '../configs';
import { BaseActivityEvent, DataState, DataTimeframe } from './base';

export interface CrossLendingActivityEvent extends BaseActivityEvent {}

export interface CrossLendingReserveDataState extends DataState {
  // market contract address
  address: string;

  // the token, debts, collateral, or both
  token: Token;

  // the token price (in US Dollar) at the snapshot timestamp
  tokenPrice: string;

  // total tokens were deposited into market
  totalDeposited: string;

  // total tokens were borrowed out of market
  totalBorrowed: string;

  // total borrow stable if any
  totalBorrowedStable?: string;

  // current lending supply rate
  rateSupply: string;

  // current borrowing rate
  rateBorrow: string;

  // the token collateral factor
  rateLoanToValue: string;

  // borrow rate stable if any
  rateBorrowStable?: string;
}

export interface CrossLendingReserveDataTimeframe extends CrossLendingReserveDataState, DataTimeframe {
  volumeDeposited: string;
  volumeWithdrawn: string;
  volumeBorrowed: string;
  volumeRepaid: string;
  volumeLiquidated: string;

  addresses: Array<string>;
  transactions: Array<string>;
}

export interface CrossLendingReserveDataStateWithTimeframes extends CrossLendingReserveDataTimeframe {
  // previous day data
  last24Hours: CrossLendingReserveDataTimeframe | null;
}
