import { ChainMetricConfig, LendingMarketConfig, MasterchefConfig, PerpetualMarketConfig } from './configs';
import { LendingActivityEvent, LendingMarketSnapshot } from './domains/lending';
import { MasterchefActivityEvent, MasterchefPoolSnapshot } from './domains/masterchef';
import { PerpetualActivityEvent, PerpetualMarketSnapshot } from './domains/perpetual';

export interface AdapterAbiConfigs {
  eventSignatures: any;
}

export interface GetSnapshotOptions {
  config: LendingMarketConfig | MasterchefConfig | PerpetualMarketConfig;
  collectActivities: boolean;
  timestamp: number;
}

export interface GetSnapshotResult {
  activities: Array<LendingActivityEvent | MasterchefActivityEvent | PerpetualActivityEvent>;
  snapshots: Array<LendingMarketSnapshot | MasterchefPoolSnapshot | PerpetualMarketSnapshot>;
}

export interface GetChainMetricSnapshotOptions {
  chainConfig: ChainMetricConfig;
  timestamp: number;
}

export interface RunCollectorOptions {
  chain?: string;
  protocol?: string;
}
