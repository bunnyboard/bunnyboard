import { ChainMetricConfig, LendingMarketConfig, MasterchefConfig } from './configs';
import { LendingActivityEvent, LendingMarketSnapshot } from './domains/lending';
import { MasterchefActivityEvent, MasterchefPoolSnapshot } from './domains/masterchef';

export interface AdapterAbiConfigs {
  eventSignatures: any;
}

export interface GetSnapshotOptions {
  config: LendingMarketConfig | MasterchefConfig;
  collectActivities: boolean;
  timestamp: number;
}

export interface GetSnapshotResult {
  activities: Array<LendingActivityEvent | MasterchefActivityEvent>;
  snapshots: Array<LendingMarketSnapshot | MasterchefPoolSnapshot>;
}

export interface GetChainMetricSnapshotOptions {
  chainConfig: ChainMetricConfig;
  timestamp: number;
}

export interface RunCollectorOptions {
  chain?: string;
  protocol?: string;
}
