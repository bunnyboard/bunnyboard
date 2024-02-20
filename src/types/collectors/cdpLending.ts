import { Token } from '../configs';
import { BaseActivityEvent, DataState, DataTimeframe } from './base';

export interface CdpLendingActivityEvent extends BaseActivityEvent {}

export interface CdpCollateralDataState {
  // contract address
  address: string;

  // the collateral token
  token: Token;

  // the token price (in US Dollar) at the snapshot timestamp
  tokenPrice: string;

  // total tokens were deposited into market
  totalDeposited: string;

  // total debts were borrowed by this collateral asset
  totalDebts?: string;

  // current borrowing rate
  rateBorrow: string;

  // incentive reward rate for borrowers
  rateRewardBorrow?: string;

  // the token collateral factor
  rateLoanToValue: string;
}

export interface CdpCollateralDataTimeframe extends CdpCollateralDataState {
  volumeDeposited: string;
  volumeWithdrawn: string;
  volumeLiquidated: string;
}

export interface CdpLendingMarketDataState extends DataState {
  // the token, debts, collateral, or both
  token: Token;

  // the token price (in US Dollar) at the snapshot timestamp
  tokenPrice: string;

  // total debt token are being supplied by lenders
  // some protocols like compound III allow lenders to lend debt token (USDC)
  totalDeposited?: string;

  // total debts token were borrowed
  totalBorrowed: string;

  // current lending supply rate
  rateSupply?: string;

  // incentive reward rate for suppliers
  rateRewardSupply?: string;

  // a list of collaterals were locked in the protocol
  collaterals: Array<CdpCollateralDataState>;
}

export interface CdpLendingMarketDataTimeframe extends CdpLendingMarketDataState, DataTimeframe {
  volumeBorrowed: string;
  volumeRepaid: string;

  volumeDeposited?: string;
  volumeWithdrawn?: string;

  addresses: Array<string>;
  transactions: Array<string>;

  // a list of collaterals were locked in the protocol
  collaterals: Array<CdpCollateralDataTimeframe>;
}

export interface CdpLendingMarketDataStateWithTimeframes extends CdpLendingMarketDataState {
  timeframe24Hours: CdpLendingMarketDataTimeframe | null;
  timeframe48Hours: CdpLendingMarketDataTimeframe | null;
}
