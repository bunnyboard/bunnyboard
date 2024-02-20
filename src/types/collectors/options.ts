import { MetricConfig } from '../configs';
import { ContextStorages } from '../namespaces';
import { CdpLendingMarketDataState, CdpLendingMarketDataTimeframe } from './cdpLending';
import {
  CrossLendingActivityEvent,
  CrossLendingReserveDataState,
  CrossLendingReserveDataTimeframe,
} from './crossLending';
import { PerpetualMarketDataState, PerpetualMarketDataTimeframe } from './perpetutal';

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
  storages?: ContextStorages;
  fromTime: number;
  toTime: number;
}

export interface GetAdapterDataStateResult {
  crossLending?: Array<CrossLendingReserveDataState> | null;
  cdpLending?: Array<CdpLendingMarketDataState> | null;
  perpetual?: Array<PerpetualMarketDataState> | null;
}

export interface GetAdapterDataTimeframeResult {
  crossLending?: Array<CrossLendingReserveDataTimeframe> | null;
  cdpLending?: Array<CdpLendingMarketDataTimeframe> | null;
  perpetual?: Array<PerpetualMarketDataTimeframe> | null;
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
