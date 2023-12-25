import { ChainMetricConfig, LendingMarketConfig, MasterchefConfig } from './configs';

export interface GetChainMetricSnapshotOptions {
  chainConfig: ChainMetricConfig;
  timestamp: number;
}

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
