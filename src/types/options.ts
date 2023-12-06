import { LendingMarketConfig } from './configs';

export interface GetLendingMarketSnapshotOptions {
  config: LendingMarketConfig;
  timestamp: number;
}

export interface AdapterAbiConfigs {
  eventSignatures: any;
  eventAbiMappings: { [key: string]: Array<any> };
}

export interface RunContractLogCollectorOptions {
  chain: string;
}

export interface RunLendingMarketCollectorOptions {
  chain?: string;
}

export interface RunAdapterOptions {
  contractLogCollector?: RunContractLogCollectorOptions;

  lendingMarketCollector?: RunLendingMarketCollectorOptions;
}
