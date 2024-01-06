import { Token } from '../configs';
import { BaseActivityEvent, DayDataSnapshot, PerpetualActivityAction } from './base';

export interface PerpetualMarketSnapshot extends DayDataSnapshot {
  // contract address
  address: string;

  // deposited token
  token: Token;
  tokenPrice: string;

  // total token liquidity
  totalLiquidityDeposited: string;

  // total fees were collected in usd
  totalTradeFeesUsd: string;

  // volume of liquidity deposit/withdraw
  volumeLiquidityDeposited: string;
  volumeLiquidityWithdrawn: string;

  // total volumes of long trades
  volumeTradeLongUsd: string;

  // total volumes of short trades
  volumeTradeShortUsd: string;

  // total volume liquidated
  volumeTradeLiquidatedUsd: string;

  // total open interest
  volumeTradeOpenInterestLongUsd: string;
  volumeTradeOpenInterestShortUsd: string;

  // fees & rates
  borrowRate: string;

  // number of addresses as traders or liquidity providers
  countTraders: number;
  countLiquidityProviders: number;
}

export interface PerpetualActivityEvent extends BaseActivityEvent {
  action: PerpetualActivityAction;

  // market contract address
  address: string;

  // long or short trade
  isLong: boolean;

  // its matter for perpetual cares about position size (usd)
  tokenAmountUsd?: string;

  // amount of fee was paid
  feeAmountUsd?: string;

  // collateral info
  collateralToken?: Token;
  collateralAmountUsd?: string;
}
