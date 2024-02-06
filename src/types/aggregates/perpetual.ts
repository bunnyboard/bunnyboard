import { DataTimeframe } from '../collectors/base';
import { Token } from '../configs';
import { DataValueItem } from './common';

export interface AggPerpetualMarketSnapshot extends DataTimeframe {
  address: string; // market contract address

  // every market was identity by a given token
  token: Token;
  tokenPrice: number;

  // total tokens locked, market size too
  totalDeposited: DataValueItem;

  totalOpenInterestShort: DataValueItem;
  totalOpenInterestLong: DataValueItem;

  rateBorrow: number;

  volumeFeesPaid: DataValueItem;
  volumeOpenInterestShort: DataValueItem;
  volumeOpenInterestLong: DataValueItem;
  volumeShort: DataValueItem;
  volumeLong: DataValueItem;
  volumeLiquidated: DataValueItem;

  numberOfUsers: number;
  numberOfTransactions: number;
}

export interface AggePerpetualDayData {
  timestamp: number;

  totalDeposited: DataValueItem;

  totalOpenInterestShort: DataValueItem;
  totalOpenInterestLong: DataValueItem;

  volumeFeesPaid: DataValueItem;

  volumeShort: DataValueItem;
  volumeLong: DataValueItem;
  volumeLiquidated: DataValueItem;
}

export interface AggPerpetualOverallState {
  totalDeposited: DataValueItem;

  totalOpenInterestShort: DataValueItem;
  totalOpenInterestLong: DataValueItem;

  volumeFeesPaid: DataValueItem;

  volumeShort: DataValueItem;
  volumeLong: DataValueItem;
  volumeLiquidated: DataValueItem;

  // a list of 24h market snapshots
  markets: Array<AggPerpetualMarketSnapshot>;

  // all-time day data
  dayData: Array<AggePerpetualDayData>;
}
