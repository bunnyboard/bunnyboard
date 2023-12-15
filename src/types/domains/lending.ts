import { LendingMarketType, Token } from '../configs';
import { DayDataSnapshot, TokenRewardEntry } from './base';

export interface LendingMarketRates {
  supply: string;
  borrow: string;

  // some protocol like AAVE offer a stable borrow rate
  borrowStable?: string;
}

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
