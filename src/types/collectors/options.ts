import { DataMetric, MetricConfig } from '../configs';
import { CrossLendingActivityEvent } from './crossLending';

export interface AdapterAbiConfigs {
  eventAbis: any;
  eventSignatures: any;
}

export interface TransformEventLogOptions {
  chain: string;
  config: MetricConfig;
  logs: Array<any>;
}

export interface TransformEventLogResult {
  activities: Array<CrossLendingActivityEvent>;
}

export interface GetAdapterDataStateOptions {
  config: MetricConfig;
  timestamp: number;
}

export interface GetAdapterDataTimeframeOptions {
  config: MetricConfig;
  fromTime: number;
  toTime: number;
}

export interface RunCollectorOptions {
  metric?: DataMetric;

  // if chain was given, run collector with given chain
  chain?: string;

  // if the protocol was given, run collector with given protocol
  // and the chain option is just use for filter configs
  protocol?: string;

  // force sync from given from timestamp
  fromTime?: number;
  force?: boolean;

  service?: 'state' | 'snapshot';
}
