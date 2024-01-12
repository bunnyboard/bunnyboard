import { IBlockchainService } from '../services/blockchains/domains';
import { IDatabaseService } from '../services/database/domains';
import { IOracleService } from '../services/oracle/domains';
import { ProtocolConfig } from './configs';
import {
  AdapterAbiConfigs,
  GetAdapterDataOptions,
  GetSnapshotDataResult,
  GetStateDataResult,
  RunCollectorOptions,
  TransformEventLogOptions,
  TransformEventLogResult,
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

  // transform raw event log into activities
  transformEventLogs: (options: TransformEventLogOptions) => Promise<TransformEventLogResult>;

  // get state data
  getStateData: (options: GetAdapterDataOptions) => Promise<GetStateDataResult>;

  // gte snapshot data
  getSnapshotData: (options: GetAdapterDataOptions, storages: ContextStorages) => Promise<GetSnapshotDataResult>;
}

export interface IProtocolCollector {
  name: string;
  services: ContextServices;
  storages: ContextStorages;

  run: (options: RunCollectorOptions) => Promise<void>;
}
