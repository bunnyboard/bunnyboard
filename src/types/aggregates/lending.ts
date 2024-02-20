import { DataTimeframe } from '../collectors/base';
import { Token } from '../configs';
import { DataValueItem } from './common';

//
///// CDP Lending /////
//

export interface AggCdpLendingCollateralSnapshot {
  address: string;

  token: Token; // collateral token
  tokenPrice: number;

  totalDeposited: DataValueItem;

  // on some protocols, we can calculate how many debts were issued by this collateral asset
  totalDebts?: DataValueItem;

  // current borrowing rate
  rateBorrow: number;
  rateRewardBorrow?: number;

  rateLoanToValue?: number;

  volumeDeposited: DataValueItem;
  volumeWithdrawn: DataValueItem;
  volumeLiquidated: DataValueItem;

  // on some protocols, we can calculate how many fees will be collected daily by this collateral asset
  volumeFeesPaid?: DataValueItem;
}

export interface AggCdpLendingMarketSnapshot extends DataTimeframe {
  token: Token; // debt token

  tokenPrice: number;

  totalDebts: DataValueItem;
  totalDeposited?: DataValueItem;

  volumeFeesPaid: DataValueItem;
  volumeBorrowed: DataValueItem;
  volumeRepaid: DataValueItem;
  volumeDeposited?: DataValueItem;
  volumeWithdrawn?: DataValueItem;

  totalCollateralDeposited: DataValueItem;
  volumeCollateralDeposited: DataValueItem;
  volumeCollateralWithdrawn: DataValueItem;
  volumeCollateralLiquidated: DataValueItem;

  rateSupply?: number;
  rateRewardSupply?: number;

  numberOfUsers: number;
  numberOfTransactions: number;

  collaterals: Array<AggCdpLendingCollateralSnapshot>;
}

export interface AggCdpLendingDayData {
  timestamp: number;

  // total value in USD of debts across all markets
  totalDebts: DataValueItem;
  // volume of debts token were borrowed and repaid in USD
  volumeBorrowed: DataValueItem;
  volumeRepaid: DataValueItem;
  volumeFeesPaid: DataValueItem;

  // total value of all backing collaterals in USD
  totalCollateralDeposited: DataValueItem;
  // deposit/withdraw/liquidate volume collateral tokens in USD
  volumeCollateralDeposited: DataValueItem;
  volumeCollateralWithdrawn: DataValueItem;
  volumeCollateralLiquidated: DataValueItem;
}

export interface AggCdpLendingOverallState {
  // total debts were issued
  totalDebts: DataValueItem;

  // total debt tokens were being deposited if any
  totalDeposited?: DataValueItem;

  // volume borrow and repay debts
  volumeBorrowed: DataValueItem;
  volumeRepaid: DataValueItem;
  volumeFeesPaid: DataValueItem;

  volumeDeposited?: DataValueItem;
  volumeWithdrawn?: DataValueItem;

  // total collateral were being locked
  totalCollateralDeposited: DataValueItem;

  // volume of deposit and withdraw collaterals
  volumeCollateralDeposited: DataValueItem;
  volumeCollateralWithdrawn: DataValueItem;
  volumeCollateralLiquidated: DataValueItem;

  // last 24h market snapshots
  markets: Array<AggCdpLendingMarketSnapshot>;

  // all-time day data
  dayData: Array<AggCdpLendingDayData>;
}
