import { DataState, DataTimeframe } from '../collectors/base';
import { Token } from '../configs';
import { DataValueItem } from './common';

export interface AggCrossLendingReserveSnapshot extends DataTimeframe {
  address: string;
  token: Token;
  tokenPrice: number;

  // actually total value locked of all tokens in contracts
  // TotalValueLocked = TotalDeposited - TotalBorrowed
  totalValueLocked: DataValueItem;

  // the market size, total value is being controlled
  totalDeposited: DataValueItem;
  totalBorrowed: DataValueItem;

  rateSupply: number;
  rateBorrow: number;
  rateBorrowStable?: number;

  rateRewardSupply: number;
  rateRewardBorrow: number;
  rateRewardBorrowStable?: number;

  rateLoanToValue: number;

  // last 24h volumes
  volumeDeposited: DataValueItem;
  volumeWithdrawn: DataValueItem;
  volumeBorrowed: DataValueItem;
  volumeRepaid: DataValueItem;
  volumeLiquidated: DataValueItem;

  // theoretically borrow fees will be paid
  // FeesPaidTheoretically = TotalBorrow * BorrowRate
  feesPaidTheoretically: DataValueItem;
}

export interface AggCrossLendingMarketSnapshot extends DataState {
  totalValueLocked: DataValueItem;
  totalDeposited: DataValueItem;
  totalBorrowed: DataValueItem;

  volumeDeposited: DataValueItem;
  volumeWithdrawn: DataValueItem;
  volumeBorrowed: DataValueItem;
  volumeRepaid: DataValueItem;
  volumeLiquidated: DataValueItem;

  feesPaidTheoretically: DataValueItem;

  reserves: Array<AggCrossLendingReserveSnapshot>;
}

// day data is total value across all markets
// serve for chart building purpose
export interface AggCrossLendingDayData {
  timestamp: number;

  totalValueLocked: DataValueItem;
  totalDeposited: DataValueItem;
  totalBorrowed: DataValueItem;

  volumeDeposited: DataValueItem;
  volumeWithdrawn: DataValueItem;
  volumeBorrowed: DataValueItem;
  volumeRepaid: DataValueItem;
  volumeLiquidated: DataValueItem;

  feesPaidTheoretically: DataValueItem;
}

// overall state and data across all cross lending markets
export interface AggCrossLendingDataOverall {
  totalValueLocked: DataValueItem;
  totalDeposited: DataValueItem;
  totalBorrowed: DataValueItem;

  volumeDeposited: DataValueItem;
  volumeWithdrawn: DataValueItem;
  volumeBorrowed: DataValueItem;
  volumeRepaid: DataValueItem;
  volumeLiquidated: DataValueItem;

  feesPaidTheoretically: DataValueItem;

  // last 24h snapshots
  markets: Array<AggCrossLendingMarketSnapshot>;

  // all-time day data
  // use for frontend charts
  dayData: Array<AggCrossLendingDayData>;
}

// overall data of a cross lending market
export interface AggCrossLendingMarketDataOverall extends AggCrossLendingMarketSnapshot {
  dayData: Array<AggCrossLendingDayData>;
}

export interface AggCrossLendingReserveDayData extends AggCrossLendingDayData {
  rateSupply: number;
  rateBorrow: number;
  rateBorrowStable?: number;
}

// overall data of a cross lending reserve
export interface AggCrossLendingReserveDataOverall extends AggCrossLendingReserveSnapshot {
  dayData: Array<AggCrossLendingReserveDayData>;
}
