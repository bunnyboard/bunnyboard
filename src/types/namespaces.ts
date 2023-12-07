import { IBlockchainService } from '../services/blockchains/domains';
import { IDatabaseService } from '../services/database/domains';
import { IOracleService } from '../services/oracle/domains';
import { ProtocolConfig } from './configs';
import { LendingCdpSnapshot, LendingMarketSnapshot, MasterchefPoolSnapshot } from './domains';
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

  // this function get snapshot data of a lending market config
  getLendingMarketSnapshots: (
    options: GetLendingMarketSnapshotOptions,
  ) => Promise<Array<LendingMarketSnapshot | LendingCdpSnapshot> | null>;

  // this function get snapshots of a masterchef config
  getMasterchefSnapshots: (options: GetMasterchefSnapshotOptions) => Promise<Array<MasterchefPoolSnapshot> | null>;
}

export interface IProtocolCollector {
  name: string;
  services: ContextServices;

  run: (options: RunCollectorOptions) => Promise<void>;
}
