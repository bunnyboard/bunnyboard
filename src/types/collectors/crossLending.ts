import { Token } from '../configs';
import { BaseActivityEvent, DataState, DataTimeframe, TokenValueItem } from './base';

export interface CrossLendingActivityEvent extends BaseActivityEvent {
  // in case of liquidation, liquidator is considered as the main user of the transaction
  // so, we need to keep track the borrower address that was liquidated in this borrower address
  // also, an address can repay debts for another address, and this borrower address
  // is the address which own debts.
  // for example, Alice liquidate Bob borrowing position, so user = Alice address, borrower = Bob address
  // in case of repay, Alice repay debts for Bob, so user = Alice address, borrower = Bob address
  borrower?: string;

  // on liquidation event, this value track the collateral token and collateral amount which were liquidated by liquidator
  collateralToken?: Token;
  collateralAmount?: string;
}

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

  // incentive reward rate for suppliers
  rateRewardSupply?: string;

  // incentive reward rate for borrowers
  rateRewardBorrow?: string;
  rateRewardBorrowStable?: string;
}

export interface CrossLendingReserveDataTimeframe extends CrossLendingReserveDataState, DataTimeframe {
  volumeDeposited: string;
  volumeWithdrawn: string;
  volumeBorrowed: string;
  volumeRepaid: string;

  // a list of collateral assets were liquidated
  // by borrowing this market asset token
  volumeLiquidated: Array<TokenValueItem>;

  addresses: Array<string>;
  transactions: Array<string>;
}

export interface CrossLendingReserveDataStateWithTimeframes extends CrossLendingReserveDataState {
  timeframe24Hours: CrossLendingReserveDataTimeframe | null;
  timeframe48Hours: CrossLendingReserveDataTimeframe | null;
}
