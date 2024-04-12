import { DataState, DataTimeframe } from '../base';
import { Token } from '../configs';

export interface IsolatedLendingCollateralDataState extends DataState {
  // token
  token: Token;

  // the token price
  tokenPrice: string;

  // total token were deposited as collateral
  totalDeposited: string;

  // LTV
  rateLoanToValue: string;
}

export interface IsolatedLendingAssetDataState extends DataState {
  // market contract
  address: string;

  // token
  token: Token;

  // the token price
  tokenPrice: string;

  // total debt were borrowed
  totalBorrowed: string;

  // total debt were being deposited
  totalDeposited: string;

  rateSupply: string;
  rateBorrow: string;

  // a list of collaterals
  collaterals: Array<IsolatedLendingCollateralDataState>;
}

export interface IsolatedLendingCollateralDataTimeframe extends IsolatedLendingCollateralDataState, DataTimeframe {
  volumeDeposited: string;
  volumeWithdrawn: string;
  volumeLiquidated: string;
}

export interface IsolatedLendingAssetDataTimeframe extends IsolatedLendingAssetDataState, DataTimeframe {
  volumeDeposited: string;
  volumeWithdrawn: string;
  volumeBorrowed: string;
  volumeRepaid: string;

  addresses: Array<string>;
  transactions: Array<string>;

  collaterals: Array<IsolatedLendingCollateralDataTimeframe>;
}

export interface IsolatedLendingAssetDataStateWithTimeframes extends IsolatedLendingAssetDataTimeframe {
  // previous day data
  last24Hours: IsolatedLendingAssetDataTimeframe | null;
}
