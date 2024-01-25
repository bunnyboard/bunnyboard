import { MetricConfig } from '../configs';
import { CrossLendingActivityEvent } from './lending';
import {
  CdpLendingMarketDataState,
  CdpLendingMarketDataTimeframe,
  CrossLendingMarketDataState,
  CrossLendingMarketDataTimeframe,
} from './lending';

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

export interface GetAdapterDataStateOptions {
  config: MetricConfig;
  timestamp: number;
}

export interface GetAdapterEventLogsOptions {
  config: MetricConfig;
  fromBlock: number;
  toBlock: number;
}

export interface GetAdapterDataTimeframeOptions {
  config: MetricConfig;
  fromTime: number;
  toTime: number;
}

export interface GetAdapterDataStateResult {
  crossLending: Array<CrossLendingMarketDataState> | null;
  cdpLending: Array<CdpLendingMarketDataState> | null;
}

export interface GetAdapterDataTimeframeResult {
  crossLending: Array<CrossLendingMarketDataTimeframe> | null;
  cdpLending: Array<CdpLendingMarketDataTimeframe> | null;
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

  service?: 'state' | 'snapshot';
}
