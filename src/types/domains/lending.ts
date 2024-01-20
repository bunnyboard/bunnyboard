import { Token } from '../configs';
import { BaseActivityEvent, DayDataSnapshot, TokenAmountEntry } from './base';

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

export interface CdpLendingActivityEvent extends BaseActivityEvent {}

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
  numberOfTransactions: number;
}

export interface CdpCollateralState {
  // contract address
  address: string;

  // the collateral token
  token: Token;

  // the token price (in US Dollar) at the snapshot timestamp
  tokenPrice: string;

  // total tokens were deposited into market
  totalDeposited: string;

  // total debts were borrowed by this collateral asset
  totalDebts?: string;

  // current borrowing rate
  borrowRate: string;

  // the token collateral factor
  loanToValueRate: string;
}

export interface CdpLendingMarketState extends DayDataSnapshot {
  // the token, debts, collateral, or both
  token: Token;

  // the token price (in US Dollar) at the snapshot timestamp
  tokenPrice: string;

  // total debts token were borrowed
  totalDebts: string;

  // current lending supply rate
  supplyRate: string;

  // a list of collaterals were locked in the protocol
  collaterals: Array<CdpCollateralState>;
}

export interface CdpCollateralSnapshot extends CdpCollateralState {
  volumeDeposited: string;
  volumeWithdrawn: string;
  volumeLiquidated: string;
}

export interface CdpLendingMarketSnapshot extends CdpLendingMarketState {
  // a list of collaterals were locked in the protocol
  collaterals: Array<CdpCollateralSnapshot>;

  volumeBorrowed: string;
  volumeRepaid: string;

  // TotalFeesPaid = TotalBorrow * BorrowRatePerCollateral * TimePeriod / 365 days
  totalFeesPaid: string;

  numberOfUsers: number;
  numberOfTransactions: number;
}
