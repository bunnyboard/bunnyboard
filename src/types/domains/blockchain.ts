import { ChainFamily } from '../configs';
import { DayDataSnapshot } from './base';

// present a blockchain day metrics snapshot
export interface ChainMetricSnapshot extends DayDataSnapshot {
  family: ChainFamily;

  // total unique addresses which sent transactions
  activeAddresses: number;
}
