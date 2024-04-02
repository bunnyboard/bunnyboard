import { DexVersion } from '../configs';
import { DataState, DataTimeframe } from './base';

export interface DexDataTrader {
  address: string;
  volumeUsd: string;
}

export interface DexDataState extends DataState {
  version: DexVersion;
  totalLiquidityUsd: string;
}

export interface DexDataTimeframe extends DexDataState, DataTimeframe {
  // fees collected from trading
  feesTradingUsd: string;
  volumeTradingUsd: string;
  numberOfTransactions: number;
  traders: Array<DexDataTrader>;
}

export interface DexDataStateWithTimeframes extends DexDataTimeframe {
  // previous day data
  last24Hours: DexDataTimeframe | null;
}
