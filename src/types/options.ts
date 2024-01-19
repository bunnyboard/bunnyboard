import { MetricConfig } from './configs';
import { CrossLendingActivityEvent, CrossLendingMarketSnapshot, CrossLendingMarketState } from './domains/lending';

export interface AdapterAbiConfigs {
  eventSignatures: any;
  eventAbis: any;
}

export interface TransformEventLogOptions {
  chain: string;
  config: MetricConfig;
  logs: Array<any>;
}

export interface TransformEventLogResult {
  activities: Array<CrossLendingActivityEvent>;
}

export interface GetAdapterDataOptions {
  config: MetricConfig;
  timestamp: number;
}

export interface GetAdapterEventLogsOptions {
  config: MetricConfig;
  fromBlock: number;
  toBlock: number;
}

export interface GetStateDataResult {
  data: Array<CrossLendingMarketState>;
}

export interface GetSnapshotDataResult {
  data: Array<CrossLendingMarketSnapshot>;
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
