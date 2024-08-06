import { IBlockchainService } from '../services/blockchains/domains';
import { IMemcacheService } from '../services/caching/domains';
import { IDatabaseService } from '../services/database/domains';
import { IOracleService } from '../services/oracle/domains';
import { DexConfig, ProtocolConfig } from './configs';
import { CdpLendingAssetDataTimeframe } from './domains/cdpLending';
import { CrossLendingReserveDataTimeframe } from './domains/crossLending';
import { DexLiquidityPoolDataTimeframe, DexLiquidityPoolMetadata } from './domains/dex';
import { FlashloanDataTimeframe } from './domains/flashloan';
import { IsolatedLendingPoolDataTimeframe } from './domains/isolatedLending';
import { StakingPoolDataTimeframe } from './domains/staking';
import { AdapterAbiConfigs, GetAdapterDataTimeframeOptions, RunAdapterOptions } from './options';

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

  // run test
  runTest: (options: RunAdapterOptions) => Promise<void>;
}

export interface ICrossLendingProtocolAdapter extends IProtocolAdapter {
  getLendingReservesDataTimeframe: (
    options: GetAdapterDataTimeframeOptions,
  ) => Promise<Array<CrossLendingReserveDataTimeframe> | null>;
}

export interface ICdpLendingProtocolAdapter extends IProtocolAdapter {
  getLendingAssetData: (options: GetAdapterDataTimeframeOptions) => Promise<CdpLendingAssetDataTimeframe | null>;
}

export interface IIsolatedLendingProtocolAdapter extends IProtocolAdapter {
  getLendingPoolData: (
    options: GetAdapterDataTimeframeOptions,
  ) => Promise<Array<IsolatedLendingPoolDataTimeframe> | null>;
}

export interface IStakingProtocolAdapter extends IProtocolAdapter {
  getStakingDataTimeframe: (options: GetAdapterDataTimeframeOptions) => Promise<Array<StakingPoolDataTimeframe> | null>;
}

export interface IFlashloanProtocolAdapter extends IProtocolAdapter {
  getFlashloanDataTimeframe: (options: GetAdapterDataTimeframeOptions) => Promise<FlashloanDataTimeframe | null>;
}

export interface IDexProtocolAdapter extends IProtocolAdapter {
  getDexLiquidityPoolMetadata: (dexConfig: DexConfig) => Promise<Array<DexLiquidityPoolMetadata>>;

  getDexDataTimeframe: (
    options: GetAdapterDataTimeframeOptions,
  ) => Promise<Array<DexLiquidityPoolDataTimeframe> | null>;
}
