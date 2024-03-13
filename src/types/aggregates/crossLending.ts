import { DataState, DataTimeframe } from '../collectors/base';
import { Token } from '../configs';
import { DataValue } from './common';

export interface AggCrossLendingReserveSnapshot extends DataTimeframe {
  address: string;
  token: Token;
  tokenPrice: number;

  // actually total value locked of all tokens in contracts
  // TotalValueLocked = TotalDeposited - TotalBorrowed
  totalValueLocked: DataValue;

  // the market size, total value is being controlled
  totalDeposited: DataValue;
  totalBorrowed: DataValue;

  rateSupply: DataValue;
  rateBorrow: DataValue;
  rateBorrowStable?: DataValue;

  rateLoanToValue: number;
  rateUtilization: number;

  // last 24h volumes
  volumeDeposited: DataValue;
  volumeWithdrawn: DataValue;
  volumeBorrowed: DataValue;
  volumeRepaid: DataValue;
  volumeLiquidated: DataValue;
  volumeTotal: DataValue;

  // theoretically borrow fees will be paid
  // FeesPaidTheoretically = TotalBorrow * BorrowRate
  feesPaidTheoretically: DataValue;

  numberOfUsers: DataValue;
  numberOfTransactions: DataValue;
}

export interface AggCrossLendingMarketSnapshot extends DataState {
  totalValueLocked: DataValue;
  totalDeposited: DataValue;
  totalBorrowed: DataValue;

  volumeDeposited: DataValue;
  volumeWithdrawn: DataValue;
  volumeBorrowed: DataValue;
  volumeRepaid: DataValue;
  volumeLiquidated: DataValue;
  volumeTotal: DataValue;

  feesPaidTheoretically: DataValue;

  reserves: Array<AggCrossLendingReserveSnapshot>;
}

// day data is total value across all markets
// serve for chart building purpose
export interface AggCrossLendingDayData {
  timestamp: number;

  totalValueLocked: number;
  totalDeposited: number;
  totalBorrowed: number;

  volumeDeposited: number;
  volumeWithdrawn: number;
  volumeBorrowed: number;
  volumeRepaid: number;
  volumeLiquidated: number;
  volumeTotal: number;

  feesPaidTheoretically: number;
}

// overall state and data across all cross lending markets
export interface AggCrossLendingDataOverall {
  totalValueLocked: DataValue;
  totalDeposited: DataValue;
  totalBorrowed: DataValue;

  volumeDeposited: DataValue;
  volumeWithdrawn: DataValue;
  volumeBorrowed: DataValue;
  volumeRepaid: DataValue;
  volumeLiquidated: DataValue;
  volumeTotal: DataValue;

  feesPaidTheoretically: DataValue;

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
  rateUtilization: number;
}

// overall data of a cross lending reserve
export interface AggCrossLendingReserveDataOverall extends AggCrossLendingReserveSnapshot {
  dayData: Array<AggCrossLendingReserveDayData>;
}
