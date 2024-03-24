import { DexVersion } from '../configs';
import { DataState, DataTimeframe } from './base';

export interface DexDataState extends DataState {
  version: DexVersion;
  totalLiquidity: string;
}

export interface DexDataTimeframe extends DexDataState, DataTimeframe {
  // fees collected from trading
  feesTrading: string;
  volumeTrading: string;
  volumeTradingCumulative: string;
  numberOfTransactions: number;
  numberOfTransactionsCumulative: number;
}

export interface DexDataStateWithTimeframes extends DexDataTimeframe {
  // previous day data
  last24Hours: DexDataTimeframe;
}
