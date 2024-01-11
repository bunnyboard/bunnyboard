import { IBlockchainService } from '../services/blockchains/domains';
import { IDatabaseService } from '../services/database/domains';
import { IOracleService } from '../services/oracle/domains';
import { ProtocolConfig } from './configs';
import { AdapterAbiConfigs, RunCollectorOptions, TransformEventLogOptions, TransformEventLogResult } from './options';

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
}

export interface IProtocolCollector {
  name: string;
  services: ContextServices;
  storages: ContextStorages;

  run: (options: RunCollectorOptions) => Promise<void>;
}
