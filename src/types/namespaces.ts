import { IBlockchainService } from '../services/blockchains/domains';
import { IMemcacheService } from '../services/caching/domains';
import { IDatabaseService } from '../services/database/domains';
import { IOracleService } from '../services/oracle/domains';
import { ProtocolConfig } from './configs';
import { CdpLendingAssetDataTimeframe } from './domains/cdpLending';
import { CrossLendingReserveDataState, CrossLendingReserveDataTimeframe } from './domains/crossLending';
import { DexDataState, DexDataTimeframe } from './domains/dex';
import { IsolatedLendingAssetDataState, IsolatedLendingAssetDataTimeframe } from './domains/isolatedLending';
import { StakingPoolDataTimeframe } from './domains/staking';
import { TokenBoardDataState, TokenBoardDataTimeframe } from './domains/tokenBoard';
import {
  AdapterAbiConfigs,
  GetAdapterDataStateOptions,
  GetAdapterDataTimeframeOptions,
  RunAdapterOptions,
  RunChainBoardAdapterOptions,
} from './options';

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
  getLendingAssetData: (options: GetAdapterDataTimeframeOptions) => Promise<CdpLendingAssetDataTimeframe | null>;
}

export interface IIsolatedLendingProtocolAdapter extends IProtocolAdapter {
  getLendingAssetDataState: (options: GetAdapterDataStateOptions) => Promise<IsolatedLendingAssetDataState | null>;
  getLendingAssetDataTimeframe: (
    options: GetAdapterDataTimeframeOptions,
  ) => Promise<IsolatedLendingAssetDataTimeframe | null>;
}

export interface IDexProtocolAdapter extends IProtocolAdapter {
  getDexDataState: (options: GetAdapterDataStateOptions) => Promise<DexDataState | null>;
  getDexDataTimeframe: (options: GetAdapterDataTimeframeOptions) => Promise<DexDataTimeframe | null>;
}

export interface IStakingProtocolAdapter extends IProtocolAdapter {
  getStakingDataTimeframe: (options: GetAdapterDataTimeframeOptions) => Promise<Array<StakingPoolDataTimeframe> | null>;
}

export interface ITokenBoardAdapter extends IProtocolAdapter {
  getTokenDataState: (options: GetAdapterDataStateOptions) => Promise<TokenBoardDataState | null>;
  getTokenDataTimeframe: (options: GetAdapterDataTimeframeOptions) => Promise<TokenBoardDataTimeframe | null>;
}

export interface IChainBoardAdapter {
  name: string;

  services: ContextServices;
  storages: ContextStorages;

  run: (options: RunChainBoardAdapterOptions) => Promise<void>;
}
