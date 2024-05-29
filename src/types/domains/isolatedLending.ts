import { DataTimeframe } from '../base';
import { Token } from '../configs';

export interface IsolatedLendingCollateralData {
  // token
  token: Token;

  // the token price
  tokenPrice: string;

  // total token were deposited as collateral
  totalDeposited: string;

  // LTV
  rateLoanToValue: string;

  volumeDeposited: string;
  volumeWithdrawn: string;
  volumeLiquidated: string;
}

export interface IsolatedLendingPoolDataTimeframe extends DataTimeframe {
  // market contract
  address: string;

  // debt token
  token: Token;

  // the token price
  tokenPrice: string;

  // total debt were borrowed
  totalBorrowed: string;

  // total debt were being deposited
  totalDeposited: string;

  rateSupply: string;
  rateBorrow: string;

  volumeDeposited: string;
  volumeWithdrawn: string;
  volumeBorrowed: string;
  volumeRepaid: string;

  addresses: Array<string>;
  transactions: Array<string>;

  // a list of collaterals
  collaterals: Array<IsolatedLendingCollateralData>;
}

export interface IsolatedLendingPoolDataStateWithTimeframes extends IsolatedLendingPoolDataTimeframe {
  // previous day data
  last24Hours: IsolatedLendingPoolDataTimeframe | null;
}
