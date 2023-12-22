import { LendingMarketType, Token } from '../configs';
import { BaseActivityEvent, DayDataSnapshot, LendingActivityAction, TokenRewardEntry } from './base';

// a lending market present a reserve in the cross-pool lending
// like compound or aave
export interface LendingMarketSnapshot extends DayDataSnapshot {
  // cross-pool lending markets
  type: LendingMarketType;

  // market contract address
  address: string;

  // the token, debts, collateral, or both
  token: Token;

  // the token price (in US Dollar) at the snapshot timestamp
  tokenPrice: string;

  // balances
  totalDeposited: string;
  totalBorrowed: string;
  totalFeesCollected: string;

  // rates
  supplyRate: string;
  borrowRate: string;
  // some protocol like AAVE offer a stable borrow rate
  borrowRateStable?: string;

  rewardForLenders: Array<TokenRewardEntry>;
  rewardForBorrowers: Array<TokenRewardEntry>;
}

export interface LendingCdpSnapshot extends LendingMarketSnapshot {
  // a CDP market have a single collateral token
  collateralToken: Token;
  collateralTokenPrice: string;
}

export interface LendingActivityEvent extends BaseActivityEvent {
  action: LendingActivityAction;

  // market contract address
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
