import { MetricConfig } from './configs';
import { LendingActivityEvent, LendingMarketState } from './domains/lending';

export interface AdapterAbiConfigs {
  eventSignatures: any;
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

export interface RunCollectorOptions {
  chain: string;
  protocol?: string;
  fromBlock?: number;

  // force sync from given from block
  force?: boolean;
}
