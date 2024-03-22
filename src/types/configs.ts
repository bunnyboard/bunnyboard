import { MongoCollectionConfig } from '../services/database/domains';

export type ChainFamily = 'evm';

export interface Token {
  chain: string;
  address: string;
  symbol: string;
  decimals: number;
}

export interface Contract {
  chain: string;
  protocol: string;
  address: string;
}

export interface LiquidityPoolConfig extends Token {
  tokens: Array<Token>;
}

export interface Blockchain {
  // ex: ethereum
  name: string;

  chainId: number;

  // default: evm, more coming soon
  family: ChainFamily;

  // default node RPC endpoint
  nodeRpc: string;

  // the native coin
  nativeToken: Token;

  // some time we need to get multiple block timestamp
  // subgraph helps us query them in a single API call
  blockSubgraph: string;
}

export interface DatabaseCollectionConfig {
  cachingStates: MongoCollectionConfig;
  cachingData: MongoCollectionConfig;

  crossLendingReserveStates: MongoCollectionConfig;
  crossLendingReserveSnapshots: MongoCollectionConfig;

  cdpLendingAssetStates: MongoCollectionConfig;
  cdpLendingAssetSnapshots: MongoCollectionConfig;

  tokenBoardErc20States: MongoCollectionConfig;
  tokenBoardErc20Snapshots: MongoCollectionConfig;
  tokenBoardErc20Balances: MongoCollectionConfig;
}

export interface EnvConfig {
  mongodb: {
    databaseName: string;
    connectionUri: string;
    collections: DatabaseCollectionConfig;
  };

  // we pre-define supported blockchains here
  blockchains: {
    [key: string]: Blockchain;
  };
}

export const DataMetrics = {
  dex: 'dex',
  crossLending: 'crossLending',
  cdpLending: 'cdpLending',
  staking: 'staking',
  perpetual: 'perpetual',
  tokenBoardErc20: 'tokenBoardErc20',
};
const Metrics = Object.values(DataMetrics);
export type DataMetric = (typeof Metrics)[number];

export interface MetricConfig extends Contract {
  metric: DataMetric;
  birthday: number;
}

export const LendingMarketVersions = {
  cross: {
    aavev2: 'aavev2',
    aavev3: 'aavev3',
    compound: 'compound',
  },
  cdp: {
    maker: 'maker',
    liquity: 'liquity',
    compoundv3: 'compoundv3',
  },
};

const CrossVersions = Object.values(LendingMarketVersions.cross);
export type LendingCrossVersion = (typeof CrossVersions)[number];

const CdpVersions = Object.values(LendingMarketVersions.cdp);
export type LendingCdpVersion = (typeof CdpVersions)[number];

export interface CrossLendingMarketConfig extends MetricConfig {
  version: LendingCrossVersion;

  // ignore these markets and tokens
  blacklists?: {
    [key: string]: boolean;
  };
}

export interface CdpLendingMarketConfig extends MetricConfig {
  version: LendingCdpVersion;
  debtToken: Token;
}

export const DexVersions = {
  uniswapv2: 'uniswapv2',
  uniswapv3: 'uniswapv3',
};
const AllDexVersions = Object.values(DexVersions);
export type DexVersion = (typeof AllDexVersions)[number];
export interface DexConfig extends MetricConfig {
  version: DexVersion;
}

export interface TokenBoardErc20Config extends MetricConfig, Token {
  stablecoin: boolean;
}

export interface ProtocolConfig {
  protocol: string;
  configs: Array<MetricConfig>;
}
