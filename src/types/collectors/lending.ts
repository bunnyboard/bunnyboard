import { Token } from '../configs';
import { BaseActivityEvent, DataState, DataTimeframe, TokenValueItem } from './base';

export interface CrossLendingActivityEvent extends BaseActivityEvent {
  // in case of liquidation, liquidator is considered as the main user of the transaction
  // so, we need to keep track the borrower address that was liquidated in this borrower address
  // also, an address can repay debts for another address, and this borrower address
  // is the address which own debts.
  // for example, Alice liquidate Bob borrowing position, so user = Alice address, borrower = Bob address
  // in case of repay, Alice repay debts for Bob, so user = Alice address, borrower = Bob address
  borrower?: string;

  // on liquidation event, this value track the collateral token and collateral amount which were liquidated by liquidator
  collateralToken?: Token;
  collateralAmount?: string;
}

export interface CdpLendingActivityEvent extends BaseActivityEvent {}

export interface CrossLendingMarketDataState extends DataState {
  // market contract address
  address: string;

  // the token, debts, collateral, or both
  token: Token;

  // the token price (in US Dollar) at the snapshot timestamp
  tokenPrice: string;

  // total tokens were deposited into market
  totalDeposited: string;

  // total tokens were borrowed out of market
  totalBorrowed: string;

  // total borrow stable if any
  totalBorrowedStable?: string;

  // current lending supply rate
  rateSupply: string;

  // current borrowing rate
  rateBorrow: string;

  // the token collateral factor
  rateLoanToValue: string;

  // borrow rate stable if any
  rateBorrowStable?: string;

  // incentive reward rate for suppliers
  rateRewardSupply?: string;

  // incentive reward rate for borrowers
  rateRewardBorrow?: string;
  rateRewardBorrowStable?: string;
}

export interface CrossLendingMarketDataTimeframe extends CrossLendingMarketDataState, DataTimeframe {
  // fees were paid by borrowers theoretically
  // VolumeFeesPaid = TotalBorrow * BorrowRate * TimePeriod / 365 days
  volumeFeesPaid: string;

  // count volumes on every actions
  volumeDeposited: string;
  volumeWithdrawn: string;
  volumeBorrowed: string;
  volumeRepaid: string;

  // a list of collateral assets were liquidated
  // by borrowing this market asset token
  volumeLiquidated: Array<TokenValueItem>;

  // count number of users and transactions
  numberOfUsers: number;
  numberOfTransactions: number;
}

export interface CrossLendingMarketDataTimeframeWithChanges extends CrossLendingMarketDataTimeframe {
  dailyChangesTokenPrice: string;
  dailyChangesTotalDeposited: string;
  dailyChangesTotalBorrowed: string;
  dailyChangesTotalBorrowedStable?: string;

  dailyChangesVolumeDeposited: string;
  dailyChangesVolumeWithdrawn: string;
  dailyChangesVolumeBorrowed: string;
  dailyChangesVolumeRepaid: string;
  dailyChangesVolumeFeesPaid: string;
}

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
  totalDebts: string;

  // current lending supply rate
  rateSupply?: string;

  // incentive reward rate for suppliers
  rateRewardSupply?: string;

  // a list of collaterals were locked in the protocol
  collaterals: Array<CdpCollateralDataState>;
}

export interface CdpLendingMarketDataTimeframe extends CdpLendingMarketDataState, DataTimeframe {
  // fees were paid by borrowers theoretically
  // VolumeFeesPaid = TotalBorrow * BorrowRate * TimePeriod / 365 days
  volumeFeesPaid: string;

  volumeBorrowed: string;
  volumeRepaid: string;

  volumeDeposited?: string;
  volumeWithdrawn?: string;

  numberOfUsers: number;
  numberOfTransactions: number;

  // a list of collaterals were locked in the protocol
  collaterals: Array<CdpCollateralDataTimeframe>;
}

export interface CdpCollateralDataTimeframeWithChanges extends CdpCollateralDataTimeframe {
  dailyChangesTokenPrice: string;

  dailyChangesTotalDeposited: string;
  dailyChangesTotalDebts?: string;

  dailyChangesVolumeDeposited: string;
  dailyChangesVolumeWithdrawn: string;
  dailyChangesVolumeLiquidated: string;
}

export interface CdpLendingMarketDataTimeframeWithChanges extends CdpLendingMarketDataTimeframe {
  dailyChangesTokenPrice: string;

  dailyChangesTotalDebts: string;
  dailyChangesTotalDeposited?: string;

  dailyChangesVolumeFeesPaid: string;
  dailyChangesVolumeBorrowed: string;
  dailyChangesVolumeRepaid: string;

  dailyChangesVolumeDeposited?: string;
  dailyChangesVolumeWithdrawn?: string;

  collaterals: Array<CdpCollateralDataTimeframeWithChanges>;
}
