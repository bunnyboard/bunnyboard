import { BaseActivityEvent, DataState, DataTimeframe } from '../base';
import { Token } from '../configs';

export interface CdpLendingActivityEvent extends BaseActivityEvent {}

export interface CdpLendingCollateralDataState extends DataState {
  // lending logic contract for this collateral
  address: string;

  // token
  token: Token;

  // the token price
  tokenPrice: string;

  // total token were deposited as collateral
  totalDeposited: string;

  // total debts were issued by this collateral
  totalBorrowed: string;

  // borrow interest
  rateBorrow: string;
  // one-time paid borrow fee
  rateBorrowFee: string;
  // LTV
  rateLoanToValue: string;
}

export interface CdpLendingAssetDataState extends DataState {
  // token
  token: Token;

  // the token price
  tokenPrice: string;

  // total debt were borrowed
  totalBorrowed: string;

  // total debt token supply
  // ERC20 totalSupply call DebtToken contract
  totalSupply: string;

  // a list of collaterals
  collaterals: Array<CdpLendingCollateralDataState>;
}

export interface CdpLendingCollateralDataTimeframe extends CdpLendingCollateralDataState, DataTimeframe {
  volumeDeposited: string;
  volumeWithdrawn: string;
  volumeLiquidated: string;
}

export interface CdpLendingAssetDataTimeframe extends CdpLendingAssetDataState, DataTimeframe {
  volumeBorrowed: string;
  volumeRepaid: string;

  addresses: Array<string>;
  transactions: Array<string>;

  collaterals: Array<CdpLendingCollateralDataTimeframe>;
}

export interface CdpLendingAssetDataStateWithTimeframes extends CdpLendingAssetDataTimeframe {
  // previous day data
  last24Hours: CdpLendingAssetDataTimeframe | null;
}
