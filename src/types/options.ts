import { MetricConfig } from './configs';
import { LendingActivityEvent, LendingMarketSnapshot, LendingMarketState } from './domains/lending';

export interface AdapterAbiConfigs {
  eventSignatures: any;
  eventAbis: any;
}

export interface TransformEventLogOptions {
  chain: string;
  logs: Array<any>;
}

export interface TransformEventLogResult {
  activities: Array<LendingActivityEvent>;
}

export interface GetAdapterDataOptions {
  config: MetricConfig;
  timestamp: number;
}

export interface GetStateDataResult {
  data: Array<LendingMarketState>;
}

export interface GetSnapshotDataResult {
  data: Array<LendingMarketSnapshot>;
}

export interface RunCollectorOptions {
  chain?: string;
  protocol?: string;
  fromBlock?: number;

  // force sync from given from block
  force?: boolean;

  // run a single service
  service?: 'state' | 'activity' | 'snapshot';
}
