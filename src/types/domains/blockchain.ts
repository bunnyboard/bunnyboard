import { ChainFamily } from '../configs';
import { DayDataSnapshot } from './base';

// present a blockchain day metrics snapshot
export interface ChainMetricSnapshot extends DayDataSnapshot {
  family: ChainFamily;

  totalBlockGasLimit: string;
  totalBlockGasUsed: string;

  avgBlockGasBasePrice: string;

  // number of base fees collected
  // TotalBaseFees = SUM[0-n](BlockBaseFee * BlockGasUsed)
  // value in native coin
  totalBaseFees: string;

  // native coin price
  nativeCoinPrice: string;

  // block count
  totalBlocks: number;

  // total unique addresses which sent transactions
  totalAddresses: number;

  // transaction count
  totalTransactions: number;
}
