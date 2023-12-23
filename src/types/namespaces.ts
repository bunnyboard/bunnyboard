import { IBlockchainService } from '../services/blockchains/domains';
import { IDatabaseService } from '../services/database/domains';
import { IOracleService } from '../services/oracle/domains';
import { ProtocolConfig } from './configs';
import { LendingActivityEvent, LendingCdpSnapshot, LendingMarketSnapshot } from './domains/lending';
import { MasterchefActivityEvent, MasterchefPoolSnapshot } from './domains/masterchef';
import {
  AdapterAbiConfigs,
  GetLendingMarketSnapshotOptions,
  GetMasterchefSnapshotOptions,
  RunCollectorOptions,
} from './options';

export interface ContextServices {
  database: IDatabaseService;
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

  // collect lending market activity logs
  getLendingMarketActivities: (options: GetLendingMarketSnapshotOptions) => Promise<Array<LendingActivityEvent>>;

  // this function get snapshot data of a lending market config
  getLendingMarketSnapshots: (
    options: GetLendingMarketSnapshotOptions,
  ) => Promise<Array<LendingMarketSnapshot | LendingCdpSnapshot> | null>;

  // collect lending market activity logs
  getMasterchefActivities: (options: GetMasterchefSnapshotOptions) => Promise<Array<MasterchefActivityEvent>>;

  // this function get snapshots of a masterchef config
  getMasterchefSnapshots: (options: GetMasterchefSnapshotOptions) => Promise<Array<MasterchefPoolSnapshot> | null>;
}

export interface IProtocolCollector {
  name: string;
  services: ContextServices;

  run: (options: RunCollectorOptions) => Promise<void>;
}
