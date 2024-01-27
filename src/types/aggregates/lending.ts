import { Token } from '../configs';
import { DataValueItem } from './common';

export interface AggCrossLendingMarketState {
  chain: string;
  protocol: string;
  address: string;
  token: Token;

  tokenPrice: DataValueItem;
  totalDeposited: DataValueItem;
  totalBorrowed: DataValueItem;

  rateSupply: number;
  rateBorrow: number;
  rateBorrowStable?: number;

  rateRewardSupply: number;
  rateRewardBorrow: number;
  rateRewardBorrowStable?: number;

  rateLoanToValue: number;

  // the last time data were updated
  // or 00:00 UTC per day
  timestamp: number;
}

export interface AggCrossLendingMarketSnapshot extends AggCrossLendingMarketState {
  volumeDeposited: DataValueItem;
  volumeWithdrawn: DataValueItem;
  volumeBorrowed: DataValueItem;
  volumeRepaid: DataValueItem;
  volumeFeesPaid: DataValueItem;

  numberOfUsers: number;
  numberOfTransactions: number;
}

export interface AggCrossLendingDayData {
  timestamp: number;
  totalDeposited: DataValueItem;
  totalBorrowed: DataValueItem;
  volumeDeposited: DataValueItem;
  volumeWithdrawn: DataValueItem;
  volumeBorrowed: DataValueItem;
  volumeRepaid: DataValueItem;
  volumeFeesPaid: DataValueItem;
}

export interface AggCrossLendingOverallState {
  totalDeposited: DataValueItem;
  totalBorrowed: DataValueItem;
  volumeDeposited: DataValueItem;
  volumeWithdrawn: DataValueItem;
  volumeBorrowed: DataValueItem;
  volumeRepaid: DataValueItem;
  volumeFeesPaid: DataValueItem;
  numberOfChains: number;
  numberOfProtocols: number;
  markets: Array<AggCrossLendingMarketSnapshot>;
  dayData: Array<AggCrossLendingDayData>;
}

export interface AggCdpLendingCollateralSnapshot {
  address: string;
  token: Token; // collateral token
  tokenPrice: DataValueItem;
  totalDeposited: DataValueItem;
  totalDebts?: DataValueItem;

  // current borrowing rate
  rateBorrow: number;
  rateRewardBorrow?: number;

  rateLoanToValue?: number;

  volumeDeposited: DataValueItem;
  volumeWithdrawn: DataValueItem;
  volumeLiquidated: DataValueItem;
}

export interface AggCdpLendingMarketSnapshot {
  timestamp: number;

  chain: string;
  protocol: string;
  token: Token; // debt token
  tokenPrice: DataValueItem;

  totalDeposited?: DataValueItem;
  totalDebts: DataValueItem;
  totalCollateralDeposited: DataValueItem;

  rateSupply?: number;
  rateRewardSupply?: number;

  volumeFeesPaid: DataValueItem;
  volumeBorrowed: DataValueItem;
  volumeRepaid: DataValueItem;

  volumeDeposited?: DataValueItem;
  volumeWithdrawn?: DataValueItem;

  numberOfUsers: number;
  numberOfTransactions: number;

  collaterals: Array<AggCdpLendingCollateralSnapshot>;
}

export interface AggCdpLendingDayData {
  timestamp: number;

  // total value in USD of debts across all markets
  totalDebts: DataValueItem;

  // total debt tokens were being deposited
  // some protocols like compound v3 use deposited USDC as debt token
  totalDeposited?: DataValueItem;

  // total value of all backing collaterals in USD
  totalCollateralDeposited: DataValueItem;

  // volume of debts token were borrowed and repaid in USD
  volumeBorrowed: DataValueItem;
  volumeRepaid: DataValueItem;

  // deposit/withdraw volume of debt tokens and collateral tokens in USD
  volumeDeposited: DataValueItem;
  volumeWithdrawn: DataValueItem;

  // volume of fees were paid by borrowers in USD
  volumeFeesPaid: DataValueItem;
}

export interface AggCdpLendingOverallState {
  totalDebts: DataValueItem;
  totalCollateralDeposited: DataValueItem;
  volumeBorrowed: DataValueItem;
  volumeRepaid: DataValueItem;

  totalDeposited?: DataValueItem;
  volumeDeposited?: DataValueItem;
  volumeWithdrawn?: DataValueItem;

  volumeFeesPaid: DataValueItem;
  markets: Array<AggCdpLendingMarketSnapshot>;
  dayData: Array<AggCdpLendingDayData>;
}
