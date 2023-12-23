import { LendingMarketConfig, MasterchefConfig } from './configs';

export interface GetLendingMarketSnapshotOptions {
  config: LendingMarketConfig;
  timestamp: number;
}

export interface GetMasterchefSnapshotOptions {
  config: MasterchefConfig;
  timestamp: number;
}

export interface AdapterAbiConfigs {
  eventSignatures: any;
}

export interface RunCollectorOptions {
  chain?: string;
  protocol?: string;
}
