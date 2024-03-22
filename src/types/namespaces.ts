import { IBlockchainService } from '../services/blockchains/domains';
import { IMemcacheService } from '../services/caching/domains';
import { IDatabaseService } from '../services/database/domains';
import { IOracleService } from '../services/oracle/domains';
import {
  AdapterAbiConfigs,
  GetAdapterDataStateOptions,
  GetAdapterDataTimeframeOptions,
  RunCollectorOptions,
} from './collectors/options';

export interface ContextStorages {
  database: IDatabaseService;
  memcache: IMemcacheService;
}

export interface ContextServices {
  blockchain: IBlockchainService;
  oracle: IOracleService;
}

// protocol adapter get on-chain data for
export interface IProtocolAdapter {
  name: string;
  services: ContextServices;

  // known contract event log signature
  // and abi for parsing
  abiConfigs: AdapterAbiConfigs;

  getDataState: (options: GetAdapterDataStateOptions) => Promise<any>;
  getDataTimeframe: (options: GetAdapterDataTimeframeOptions) => Promise<any>;
}

export interface IDataCollector {
  name: string;
  services: ContextServices;
  storages: ContextStorages;

  run: (options: RunCollectorOptions) => Promise<void>;
}

export interface IDataAggregator {
  name: string;
  database: IDatabaseService;

  // expect to aggregate data and update to database
  runUpdate: () => Promise<void>;
}
