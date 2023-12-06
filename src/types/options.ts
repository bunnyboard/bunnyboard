import { LendingMarketConfig } from './configs';

export interface RunCollectorOptions {
  protocol?: string;
}

export interface GetLendingMarketSnapshotOptions {
  config: LendingMarketConfig;
  timestamp: number;
}

export interface AdapterAbiConfigs {
  eventSignatures: any;
  eventAbiMappings: { [key: string]: Array<any> };
}

export interface RunAdapterOptions {}

export interface RunCollectorOptions {
  // run collector with config on given chain only
  chain?: string;

  // run collector with given protocol only
  protocol?: string;

  // run with given initial timestamp
  timestamp?: number;
}
