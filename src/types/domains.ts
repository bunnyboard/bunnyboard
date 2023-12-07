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
  totalDeposited: string;

  // total token borrowed (debts) in this market
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
  tokenRewards: Array<TokenRewardEntry>;

  // some protocol like AAVE offer a stable borrow rate
  borrowRateStable?: string;
}

// Collateralized Debt Position is a system created by MakerDAO
// which locks up collateral in a smart contract in exchange for stablecoins,
// a decentralized stablecoin known as DAI.
// CDP, as it is often called, is a position characterized by a smart contract,
// a collateral and an issued collateral-backed stablecoin.
export interface LendingCdpCollateralSnapshot {
  token: Token;
  tokenPrice: string;
  totalDeposited: string;
  volumeDeposited: string;
  volumeWithdrawn: string;
  volumeLiquidated: string;
}

export interface LendingCdpSnapshot extends DayDataSnapshot {
  // must be unique id
  // protocol-chain-marketAddress/borrowOperation/collateralManager-debtTokenAddress
  marketId: string;

  // CDP lending market
  type: LendingMarketType;

  debtToken: Token;
  debtTokenPrice: string;

  totalBorrowed: string;
  volumeBorrowed: string;
  volumeRepaid: string;

  // rates should be multiplied by 100 on display
  // supply rate aka APY
  supplyRate: string;

  // the borrow rate, aka borrow APY
  borrowRate: string;

  // a list of collaterals
  collaterals: Array<LendingCdpCollateralSnapshot>;

  // a list of incentive tokens rewards
  tokenRewards: Array<TokenRewardEntry>;
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
