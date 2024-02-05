import { DataTimeframe } from '../collectors/base';
import { Token } from '../configs';
import { DataValueItem } from './common';

export interface AggPerpetualMarketSnapshot extends DataTimeframe {
  address: string; // market contract address

  // every market was identity by a given token
  token: Token;
  tokenPrice: string;

  // total tokens locked, market size too
  totalDeposited: DataValueItem;

  totalOpenInterestShort: DataValueItem;
  totalOpenInterestLong: DataValueItem;

  rateBorrow: number;

  volumeFeesPaid: DataValueItem;
  volumeOpenInterestShort: DataValueItem;
  volumeOpenInterestLong: DataValueItem;
  volumeTradingShort: DataValueItem;
  volumeTradingLong: DataValueItem;
  volumeLiquidatedUsd: DataValueItem;

  numberOfUsers: number;
  numberOfTransactions: number;
}

export interface AggePerpetualDayData {
  timestamp: number;

  totalDeposited: DataValueItem;

  totalOpenInterestShortUsd: DataValueItem;
}
