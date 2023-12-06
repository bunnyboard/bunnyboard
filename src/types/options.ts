import { LendingMarketConfig } from './configs';

export interface GetLendingMarketSnapshotOptions {
  config: LendingMarketConfig;
  timestamp: number;
}

export interface AdapterAbiConfigs {
  eventSignatures: any;
  eventAbiMappings: { [key: string]: Array<any> };
}

export interface RunAdapterOptions {
  contractLogCollector?: boolean;
  lendingMarketCollector?: boolean;
}
