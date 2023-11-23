import { Token } from './configs';

export interface LendingMarketSnapshot {
  // must be unique id
  // protocol-chain-address-tokenAddress
  marketId: string;

  // the chain where this market is living on
  chain: string;

  // the protocol which owns this market
  protocol: string;

  // the token, debts, collateral, or both
  token: Token;

  // market contract address
  address: string;

  // unix timestamp
  timestamp: number;

  // the token price (in US Dollar) at the snapshot timestamp
  tokenPrice: string;

  // total token deposited in this market
  totalDeposited: string;

  // total token borrowed (debts) in this market
  totalBorrowed: string;

  // rates should be multiplied by 100 on display
  // supply rate aka APY
  supplyRate: string;

  // the borrow rate, aka borrow APY
  borrowRate: string;

  // some protocol like AAVE offer a stable borrow rate
  borrowRateStable?: string;
}
