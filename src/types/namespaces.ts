import { IBlockchainService } from '../services/blockchains/domains';
import { IMemcacheService } from '../services/caching/domains';
import { IDatabaseService } from '../services/database/domains';
import { IOracleService } from '../services/oracle/domains';
import { CdpLendingAssetDataState, CdpLendingAssetDataTimeframe } from './collectors/cdpLending';
import { CrossLendingReserveDataState, CrossLendingReserveDataTimeframe } from './collectors/crossLending';
import { DexDataState, DexDataTimeframe } from './collectors/dex';
import {
  AdapterAbiConfigs,
  GetAdapterDataStateOptions,
  GetAdapterDataTimeframeOptions,
  RunAdapterOptions,
} from './collectors/options';
import { TokenBoardDataState, TokenBoardDataTimeframe } from './collectors/tokenBoard';
import { ProtocolConfig } from './configs';

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
  storages: ContextStorages;

  protocolConfig: ProtocolConfig;

  // known contract event log signature
  // and abi for parsing
  abiConfigs: AdapterAbiConfigs;

  run: (options: RunAdapterOptions) => Promise<void>;
}

export interface ICrossLendingProtocolAdapter extends IProtocolAdapter {
  getLendingReservesDataState: (
    options: GetAdapterDataStateOptions,
  ) => Promise<Array<CrossLendingReserveDataState> | null>;
  getLendingReservesDataTimeframe: (
    options: GetAdapterDataTimeframeOptions,
  ) => Promise<Array<CrossLendingReserveDataTimeframe> | null>;
}

export interface ICdpLendingProtocolAdapter extends IProtocolAdapter {
  getLendingAssetDataState: (options: GetAdapterDataStateOptions) => Promise<CdpLendingAssetDataState | null>;
  getLendingAssetDataTimeframe: (
    options: GetAdapterDataTimeframeOptions,
  ) => Promise<CdpLendingAssetDataTimeframe | null>;
}

export interface IDexProtocolAdapter extends IProtocolAdapter {
  getDexDataState: (options: GetAdapterDataStateOptions) => Promise<DexDataState | null>;
  getDexDataTimeframe: (options: GetAdapterDataTimeframeOptions) => Promise<DexDataTimeframe | null>;
}

export interface ITokenBoardAdapter extends IProtocolAdapter {
  getTokenDataState: (options: GetAdapterDataStateOptions) => Promise<TokenBoardDataState | null>;
  getTokenDataTimeframe: (options: GetAdapterDataTimeframeOptions) => Promise<TokenBoardDataTimeframe | null>;
}

export interface IDataAggregator {
  name: string;
  database: IDatabaseService;

  // expect to aggregate data and update to database
  runUpdate: () => Promise<void>;
}
