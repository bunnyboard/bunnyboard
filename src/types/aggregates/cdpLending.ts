import { DataTimeframe } from '../collectors/base';
import { Token } from '../configs';
import { DataValue } from './common';

//
///// CDP Lending /////
//

export interface AggCdpLendingCollateralSnapshot extends DataTimeframe {
  address: string;

  token: Token; // collateral token
  tokenPrice: number;

  totalDeposited: DataValue;

  // on some protocols, we can calculate how many debts were issued by this collateral asset
  totalBorrowed?: DataValue;

  // current borrowing rate
  rateBorrow: DataValue;
  feeBorrow: DataValue;

  rateLoanToValue: number;

  volumeDeposited: DataValue;
  volumeWithdrawn: DataValue;
  volumeLiquidated: DataValue;
}

export interface AggCdpLendingMarketSnapshot extends DataTimeframe {
  // stablecoin/debt token
  token: Token;
  tokenPrice: number;

  totalValueLocked: DataValue;
  totalBorrowed: DataValue;

  totalDeposited?: DataValue;
  rateSupply?: DataValue;

  // if borrow rate, interestDaily = totalBorrowed * rateBorrow
  // if borrow fee, interestDaily = volumeBorrowed * feeBorrow
  feesPaidTheoretically: DataValue;

  volumeBorrowed: DataValue;
  volumeRepaid: DataValue;

  volumeDeposited?: DataValue;
  volumeWithdrawn?: DataValue;

  // summarize collateral values
  totalCollateralDeposited: DataValue;
  volumeCollateralDeposited: DataValue;
  volumeCollateralWithdrawn: DataValue;
  volumeCollateralLiquidated: DataValue;

  numberOfUsers: DataValue;
  numberOfTransactions: DataValue;
}

export interface AggCdpLendingDayData {
  timestamp: number;

  totalValueLocked: number;

  // total value in USD of debts across all markets
  totalBorrowed: number;

  feesPaidTheoretically: number;

  // volume of debts token were borrowed and repaid in USD
  volumeBorrowed: number;
  volumeRepaid: number;

  // total value of all backing collaterals in USD
  totalCollateralDeposited: number;

  // deposit/withdraw/liquidate volume collateral tokens in USD
  volumeCollateralDeposited: number;
  volumeCollateralWithdrawn: number;
  volumeCollateralLiquidated: number;

  // can be undefined
  totalDeposited?: number;
  volumeDeposited?: number;
  volumeWithdrawn?: number;
}

export interface AggCdpLendingDataOverall {
  // total actually token values locked within protocol
  totalValueLocked: DataValue;

  feesPaidTheoretically: DataValue;

  // total debts were issued
  totalBorrowed: DataValue;
  volumeBorrowed: DataValue;
  volumeRepaid: DataValue;

  // total debt tokens were being deposited if any
  totalDeposited?: DataValue;
  volumeDeposited?: DataValue;
  volumeWithdrawn?: DataValue;

  // total collateral were being locked
  totalCollateralDeposited: DataValue;

  // volume of deposit and withdraw collaterals
  volumeCollateralDeposited: DataValue;
  volumeCollateralWithdrawn: DataValue;
  volumeCollateralLiquidated: DataValue;

  // last 24h market snapshots
  markets: Array<AggCdpLendingMarketSnapshot>;

  // all-time day data
  dayData: Array<AggCdpLendingDayData>;
}

export interface AggCdpLendingMarketDataOverall extends AggCdpLendingMarketSnapshot {
  dayData: Array<AggCdpLendingDayData>;
}
