import { IBlockchainService } from '../services/blockchains/domains';
import { IDatabaseService } from '../services/database/domains';
import { IOracleService } from '../services/oracle/domains';
import { ProtocolConfig } from './configs';
import { LendingActivityEvent, LendingMarketSnapshot } from './domains/lending';
import { MasterchefActivityEvent, MasterchefPoolSnapshot } from './domains/masterchef';
import {
  AdapterAbiConfigs,
  GetChainMetricSnapshotOptions,
  GetLendingMarketSnapshotOptions,
  GetMasterchefSnapshotOptions,
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

  // collect lending market activity logs
  getLendingMarketActivities: (options: GetLendingMarketSnapshotOptions) => Promise<Array<LendingActivityEvent>>;

  // this function get snapshot data of a lending market config
  getLendingMarketSnapshots: (options: GetLendingMarketSnapshotOptions) => Promise<Array<LendingMarketSnapshot> | null>;

  // collect lending market activity logs
  getMasterchefActivities: (options: GetMasterchefSnapshotOptions) => Promise<Array<MasterchefActivityEvent>>;

  // this function get snapshots of a masterchef config
  getMasterchefSnapshots: (options: GetMasterchefSnapshotOptions) => Promise<Array<MasterchefPoolSnapshot> | null>;
}

export interface IProtocolCollector {
  name: string;
  services: ContextServices;
  storages: ContextStorages;

  run: (options: RunCollectorOptions) => Promise<void>;
}
