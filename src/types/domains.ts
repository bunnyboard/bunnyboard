import { LendingMarketType, Token } from './configs';

export type AddressRoleLending = 'lender' | 'borrower' | 'liquidator';
export type AddressRoleStaking = 'staker';
export interface AddressBookEntry {
  addressId: string;

  chain: string;
  protocol: string;
  address: string;
  role: AddressRoleLending | AddressRoleStaking;

  // timestamp where the first transaction
  // was made by this address to using this protocol
  firstTime: number;
}

export interface TokenRewardEntry {
  token: Token;
  tokenPrice: string;
  tokenAmount: string;
}

export interface AddressCountEntry {
  [key: string]: number;
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

  addressCount: AddressCountEntry;
  transactionCount: number;
}

// a lending market present a reserve in the cross-pool lending
// like compound or aave
export interface LendingMarketSnapshot extends DayDataSnapshot {
  // must be unique id
  // protocol-chain-address-tokenAddress
  marketId: string;

  // cross-pool lending markets
  type: LendingMarketType;

  // the token, debts, collateral, or both
  token: Token;

  // market contract address
  address: string;

  // the token price (in US Dollar) at the snapshot timestamp
  tokenPrice: string;

  // total token deposited in this market
  // in CDP market, this is total collateral token deposited
  totalDeposited: string;

  // total token borrowed (debts) in this market
  // in CDP market, this is equal to the total debts
  totalBorrowed: string;

  // total borrow fees were collected
  totalFeesCollected: string;

  volumeDeposited: string;
  volumeWithdrawn: string;
  volumeBorrowed: string;
  volumeRepaid: string;
  volumeLiquidated: string;

  // rates should be multiplied by 100 on display
  // supply rate aka APY
  supplyRate: string;

  // the borrow rate, aka borrow APY
  borrowRate: string;

  // a list of incentive tokens rewards
  tokenRewardsForLenders: Array<TokenRewardEntry>;
  tokenRewardsForBorrowers: Array<TokenRewardEntry>;

  // some protocol like AAVE offer a stable borrow rate
  borrowRateStable?: string;
}

export interface LendingCdpSnapshot extends LendingMarketSnapshot {
  // a CDP market have a single collateral token
  collateralToken: Token;
  collateralTokenPrice: string;
}

export interface MasterchefPoolSnapshot extends DayDataSnapshot {
  // masterchef address
  address: string;

  // pool ID
  poolId: number;

  // deposited token
  token: Token;
  tokenPrice: string;

  // allocation point
  allocationPoint: number;

  // total lp token were deposited in the period of snapshot
  totalDeposited: string;

  // total rewards were earned in the snapshot period
  totalRewardEarned: string;

  volumeDeposited: string;
  volumeWithdrawn: string;
}
