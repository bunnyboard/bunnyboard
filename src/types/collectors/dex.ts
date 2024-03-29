import { DexVersion } from '../configs';
import { DataState, DataTimeframe } from './base';

export interface DexDataState extends DataState {
  version: DexVersion;
  totalLiquidityUsd: string;
}

export interface DexDataTimeframe extends DexDataState, DataTimeframe {
  // fees collected from trading
  feesTradingUsd: string;
  feesTradingCumulativeUsd: string;
  volumeTradingUsd: string;
  volumeTradingCumulativeUsd: string;
  numberOfTransactions: number;
  numberOfTransactionsCumulative: number;
}

export interface DexDataStateWithTimeframes extends DexDataTimeframe {
  // previous day data
  last24Hours: DexDataTimeframe | null;
}
