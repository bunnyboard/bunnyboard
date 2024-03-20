import { IBlockchainService } from '../services/blockchains/domains';
import { IMemcacheService } from '../services/caching/domains';
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
import { TokenBoardErc20DataState, TokenBoardErc20DataTimeframe } from './collectors/tokenboard';
import { MetricConfig, ProtocolConfig } from './configs';

export interface ContextStorages {
  database: IDatabaseService;
  memcache: IMemcacheService;
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

// board adapter get on-chain data for all protocols
// in common metrics
export interface IBoardAdapter {
  name: string;
  services: ContextServices;

  getDataState: (config: MetricConfig, timestamp: number) => Promise<TokenBoardErc20DataState | null>;
  getDataTimeframe: (
    config: MetricConfig,
    fromTime: number,
    toTime: number,
  ) => Promise<TokenBoardErc20DataTimeframe | null>;
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
