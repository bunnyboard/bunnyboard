import { DexConfig, MetricConfig, Token } from './configs';
import { CrossLendingActivityEvent } from './domains/crossLending';

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
  props?: any;
}

export interface GetDexLiquidityTokenDataOptions {
  token: Token;
  dexConfig: DexConfig;
  fromBlock: number;
  toBlock: number;
}

export interface RunAdapterOptions {
  metricConfig: MetricConfig;

  // give a timestamp where adapter will start to collect snapshots from
  // if fromTime was given, adapter will use this value instead of config birthday
  fromTime?: number;

  // force to sync snapshots from given fromTime or config birthday
  // do not save state
  force?: boolean;
}
