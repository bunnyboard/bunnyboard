import { ChainBoardConfig, DexConfig, MetricConfig, Token } from './configs';
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

  // if we are going to get latest data state
  // should set latestState to True, it means we query contracts using block number at toTime
  // otherwise, contract calls will use block number at fromTime
  latestState?: boolean;

  props?: any;
}

export interface GetDexLiquidityTokenDataOptions {
  token: Token;
  dexConfig: DexConfig;
  fromBlock: number;
  toBlock: number;
}

export interface RunAdapterBaseOptions {
  // give a timestamp where adapter will start to collect snapshots from
  // if fromTime was given, adapter will use this value instead of config birthday
  fromTime?: number;

  // force to sync snapshots from given fromTime or config birthday
  // do not save state
  force?: boolean;
}

export interface RunAdapterOptions extends RunAdapterBaseOptions {
  metricConfig: MetricConfig;
}

export interface RunChainBoardAdapterOptions extends RunAdapterBaseOptions {
  chainConfig: ChainBoardConfig;
}
