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
  // if chain was given, run collector with given chain
  chain?: string;

  // if the protocol was given, run collector with given protocol
  // and the chain option is just use for filter configs
  protocol?: string;

  // force sync from given from timestamp
  fromTime?: number;
  force?: boolean;
}
