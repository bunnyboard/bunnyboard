import { IBlockchainService } from '../services/blockchains/domains';
import { IDatabaseService } from '../services/database/domains';
import { IOracleService } from '../services/oracle/domains';
import {
  AdapterAbiConfigs,
  GetAdapterDataStateOptions,
  GetAdapterDataStateResult,
  GetAdapterDataTimeframeOptions,
  GetAdapterDataTimeframeResult,
  RunCollectorOptions,
} from './collectors/options';
import { ProtocolConfig } from './configs';

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

  // get data state of a metric config
  getDataState: (options: GetAdapterDataStateOptions) => Promise<GetAdapterDataStateResult>;

  // get data in a given timeframe
  getDataTimeframe: (options: GetAdapterDataTimeframeOptions) => Promise<GetAdapterDataTimeframeResult>;
}

export interface ICollector {
  name: string;
  services: ContextServices;
  storages: ContextStorages;

  run: (options: RunCollectorOptions) => Promise<void>;
}

export interface DataAggregator {
  name: string;
  database: IDatabaseService;

  // expect to aggregate data and update to database
  runUpdate: () => Promise<void>;
}
