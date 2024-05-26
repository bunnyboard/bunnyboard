import { DataState, DataTimeframe } from '../base';
import { Token } from '../configs';

export interface CdpLendingCollateralData {
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

  volumeDeposited: string;

  volumeWithdrawn: string;

  volumeLiquidated: string;

  // borrow interest
  rateBorrow: string;

  // opening fees if any
  rateBorrowOpeningFee: string;

  // LTV
  rateLoanToValue: string;
}

export interface CdpLendingAssetDataTimeframe extends DataState, DataTimeframe {
  // debt token
  token: Token;

  // the debt token price
  tokenPrice: string;

  // total debt were borrowed
  totalBorrowed: string;

  // total debt token supply
  // ERC20 totalSupply call DebtToken contract
  totalSupply: string;

  volumeBorrowed: string;
  volumeRepaid: string;

  feesPaid: string;

  addresses: Array<string>;
  transactions: Array<string>;

  // a list of collaterals
  collaterals: Array<CdpLendingCollateralData>;
}

export interface CdpLendingAssetDataStateWithTimeframes extends CdpLendingAssetDataTimeframe {
  // previous day data
  last24Hours: CdpLendingAssetDataTimeframe | null;
}
