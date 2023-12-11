import { LendingMarketType, Token } from '../configs';
import {
  AddressBookEntry,
  AddressCountEntry,
  AddressRoleLending,
  BalanceCountEntry,
  DayDataSnapshot,
  RewardCountEntry,
  TokenRewardEntry,
  VolumeCountEntry,
} from './base';

export interface AddressBookEntryLending extends AddressBookEntry {
  role: AddressRoleLending;
  market: string; // lending market address
  token: string; // lending market token
}

export interface AddressCountEntryLending extends AddressCountEntry {
  lenders: number;
  borrowers: number;
  liquidators: number;
}

export interface VolumeCountEntryLending extends VolumeCountEntry {
  deposit: string;
  withdraw: string;
  borrow: string;
  repay: string;
  liquidate: string;
}

export interface BalanceCountEntryLending extends BalanceCountEntry {
  deposit: string;
  borrow: string;
  fees: string;
}

export interface LendingMarketRates {
  supply: string;
  borrow: string;

  // some protocol like AAVE offer a stable borrow rate
  borrowStable?: string;
}

export interface RewardCountEntryLending extends RewardCountEntry {
  forLenders: Array<TokenRewardEntry>;
  forBorrowers: Array<TokenRewardEntry>;
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

  balances: BalanceCountEntryLending;
  volumes: VolumeCountEntryLending;
  addressCount: AddressCountEntryLending;
  rates: LendingMarketRates;
  rewards: RewardCountEntryLending;
}

export interface LendingCdpSnapshot extends LendingMarketSnapshot {
  // a CDP market have a single collateral token
  collateralToken: Token;
  collateralTokenPrice: string;
}
