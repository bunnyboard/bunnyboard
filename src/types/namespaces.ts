import { IBlockchainService } from '../services/blockchains/domains';
import { IDatabaseService } from '../services/database/domains';
import { IOracleService } from '../services/oracle/domains';
import { ProtocolConfig } from './configs';
import {
  AdapterAbiConfigs,
  GetChainMetricSnapshotOptions,
  GetSnapshotOptions,
  GetSnapshotResult,
  RunCollectorOptions,
} from './options';

export interface ContextStorages {
  database: IDatabaseService;
}

export interface ContextServices {
  blockchain: IBlockchainService;
  oracle: IOracleService;
}

export interface IProtocolAdapter {
  name: string;
  services: ContextServices;

  // protocol config
  config: ProtocolConfig;

  // known contract event log signature
  // and abi for parsing
  abiConfigs: AdapterAbiConfigs;

  // get chain metrics
  getChainMetricSnapshots: (options: GetChainMetricSnapshotOptions) => Promise<Array<any>>;

  // this function get snapshot data of a lending market config
  getLendingMarketSnapshots: (options: GetSnapshotOptions) => Promise<GetSnapshotResult>;

  // this function get snapshots of a masterchef config
  getMasterchefSnapshots: (options: GetSnapshotOptions) => Promise<GetSnapshotResult>;

  // this function get snapshots of a masterchef config
  getPerpetualSnapshots: (options: GetSnapshotOptions) => Promise<GetSnapshotResult>;
}

export interface IProtocolCollector {
  name: string;
  services: ContextServices;
  storages: ContextStorages;

  run: (options: RunCollectorOptions) => Promise<void>;
}
