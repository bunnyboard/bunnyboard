import { DataState, DataTimeframe } from '../collectors/base';
import { DexVersion } from '../configs';
import { DataValue } from './common';

export interface AggDexDataTrader {
  address: string;
  volumeUsd: number;
}

export interface AggDexDataState extends DataState {
  version: DexVersion;
  totalLiquidityUsd: DataValue;
}

export interface AggDexDataSnapshot extends AggDexDataState, DataTimeframe {
  // fees collected from trading
  feesTradingUsd: DataValue;
  feesTradingCumulativeUsd: DataValue;
  volumeTradingUsd: DataValue;
  volumeTradingCumulativeUsd: DataValue;
  numberOfTransactions: DataValue;
  numberOfTransactionsCumulative: DataValue;
  traders: Array<AggDexDataTrader>;
}

export interface AggDexDayData {
  timestamp: number;

  totalLiquidityUsd: number;
  feesTradingUsd: number;
  volumeTradingUsd: number;
  numberOfTraders: number; // unique trader addresses
  numberOfTransactions: number;
}

export interface AggDexDataOverall {
  totalLiquidityUsd: DataValue;
  feesTradingUsd: DataValue;
  feesTradingCumulativeUsd: DataValue;
  volumeTradingUsd: DataValue;
  volumeTradingCumulativeUsd: DataValue;
  numberOfTraders: DataValue;
  numberOfTransactions: DataValue;

  exchanges: Array<AggDexDataSnapshot>;
  dayData: Array<AggDexDayData>;
}
