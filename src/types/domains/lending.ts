import { Token } from '../configs';
import { ActivityAction, BaseActivityEvent, DayDataSnapshot, TokenAmountEntry } from './base';

export interface CrossLendingActivityEvent extends BaseActivityEvent {
  action: ActivityAction;

  // this is the contract that emitted the event log
  address: string;

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

export interface CrossLendingMarketState extends DayDataSnapshot {
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
  supplyRate: string;

  // current borrowing rate
  borrowRate: string;

  // the token collateral factor
  loanToValueRate: string;

  // borrow rate stable if any
  borrowRateStable?: string;

  // incentive reward rate for suppliers
  rewardSupplyRate?: string;

  // incentive reward rate for borrowers
  rewardBorrowRate?: string;
  rewardBorrowRateStable?: string;
}

export interface CrossLendingMarketSnapshot extends CrossLendingMarketState {
  volumeDeposited: string;
  volumeWithdrawn: string;
  volumeBorrowed: string;
  volumeRepaid: string;

  // a list of collateral assets were liquidated
  // by borrowing this market asset token
  volumeLiquidated: Array<TokenAmountEntry>;

  // TotalFeesPaid = TotalBorrow * BorrowRate * TimePeriod / 365 days
  totalFeesPaid: string;

  numberOfUsers: number;
  numberOfLenders: number;
  numberOfBorrowers: number;
  numberOfLiquidators: number;

  numberOfTransactions: number;
}
