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

  // explorer api endpoint
  explorerApiEndpoint?: string;
}

export interface DatabaseCollectionConfig {
  cachingStates: MongoCollectionConfig;
  cachingData: MongoCollectionConfig;

  crossLendingReserveStates: MongoCollectionConfig;
  crossLendingReserveSnapshots: MongoCollectionConfig;

  cdpLendingAssetStates: MongoCollectionConfig;
  cdpLendingAssetSnapshots: MongoCollectionConfig;

  // used to save dex liquidity data
  // check dexscan adapter for more details
  dexLiquidityTokenSnapshots: MongoCollectionConfig;
  dexLiquidityPoolSnapshots: MongoCollectionConfig;

  tokenBoardStates: MongoCollectionConfig;
  tokenBoardSnapshots: MongoCollectionConfig;

  dexDataStates: MongoCollectionConfig;
  dexDataSnapshots: MongoCollectionConfig;
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
  tokenBoard: 'tokenBoard',
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
  univ2: 'univ2',
  univ3: 'univ3',
};
const AllDexVersions = Object.values(DexVersions);
export type DexVersion = (typeof AllDexVersions)[number];

export interface DexSubgraph {
  endpoint: string;
  filters: {
    bundles: {
      baseTokenPrice: string;
    };
    tokens: {
      volume: string;
      liquidity: string;
      txCount: string;
      derivedBase: string;
      fees?: string;
    };
    pools: {
      pool: string;
      pools: string;
      volume: string;
      liquidity: string;
      txCount: string;
      derivedBase: string;
      reserve0: string;
      reserve1: string;
      fees?: string;
      feesTiger?: string;
    };
    factory: {
      factories: string;
      volume: string;
      liquidity: string;
      txCount: string;
      fees?: string;
    };
    eventSwaps?: {
      event: string;
      volumeUsd: string;
      trader: string;
      timestamp: string;
    };
  };
  fixedFeePercentage?: number;
  httpRequestOptions?: any;
}

export interface DexConfig extends MetricConfig {
  version: DexVersion;
  subgraph?: DexSubgraph;
}

export interface TokenBoardConfig extends MetricConfig, Token {
  stablecoin: boolean;
}

export interface ProtocolConfig {
  protocol: string;
  configs: Array<MetricConfig>;
}
