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
  birthblock?: number;
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

  // explorer api endpoint
  explorerApiEndpoint: string;
}

export interface DatabaseCollectionConfig {
  cachingStates: MongoCollectionConfig;
  cachingData: MongoCollectionConfig;

  // raw contract event logs
  cachingContractLogs: MongoCollectionConfig;

  crossLendingReserveStates: MongoCollectionConfig;
  crossLendingReserveSnapshots: MongoCollectionConfig;

  cdpLendingAssetStates: MongoCollectionConfig;
  cdpLendingAssetSnapshots: MongoCollectionConfig;

  isolatedLendingPoolStates: MongoCollectionConfig;
  isolatedLendingPoolSnapshots: MongoCollectionConfig;

  // token staking
  stakingPoolDataStates: MongoCollectionConfig;
  stakingPoolDataSnapshots: MongoCollectionConfig;

  // for ecosystem
  ecosystemDataStates: MongoCollectionConfig;
  ecosystemDataSnapshots: MongoCollectionConfig;

  // for flashloan
  flashloanDataStates: MongoCollectionConfig;
  flashloanDataSnapshots: MongoCollectionConfig;
}

export interface EnvConfig {
  env: {
    debug: boolean;
  };

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
  isolatedLending: 'isolatedLending',
  staking: 'staking',
  flashloan: 'flashloan',
  perpetual: 'perpetual',

  // ecosystem - special data for every type
  ecosystem: 'ecosystem',
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
    abracadabra: 'abracadabra',
    crvusd: 'crvusd',
  },
  isolated: {
    ajna: 'ajna',
    compoundv3: 'compoundv3',
    morpho: 'morpho',
  },
};

const CrossVersions = Object.values(LendingMarketVersions.cross);
export type LendingCrossVersion = (typeof CrossVersions)[number];

const CdpVersions = Object.values(LendingMarketVersions.cdp);
export type LendingCdpVersion = (typeof CdpVersions)[number];

const IsolatedVersions = Object.values(LendingMarketVersions.isolated);
export type LendingIsolatedVersion = (typeof IsolatedVersions)[number];

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

export interface IsolatedLendingMarketConfig extends MetricConfig {
  version: LendingIsolatedVersion;
  debtToken?: Token;
}

export const StakingVersions = {
  // https://docs.aave.com/developers/v/1.0/developing-on-aave/the-protocol/safety-module-stkaave
  aave: 'aave',

  // https://docs.sushi.com/docs/Products/Tokens/xSushi%20Token/Contracts/xSushi
  xsushi: 'xsushi',

  // https://docs.yearn.fi/getting-started/products/yeth/overview
  yeth: 'yeth',
};
const AllStakingVersions = Object.values(StakingVersions);
export type StakingVersion = (typeof AllStakingVersions)[number];

export interface StakingConfig extends MetricConfig {
  version: StakingVersion;
}

export const FlashloanVersion = {
  aavev2: 'aavev2',
  aavev3: 'aavev3',
  ironbank: 'ironbank',
  balancer: 'balancer',
  maker: 'maker',
};
const AllFlashloanVersions = Object.values(FlashloanVersion);
export type FlashloanVerion = (typeof AllFlashloanVersions)[number];

export interface FlashloanConfig extends MetricConfig {
  version: FlashloanVerion;
}

export interface ProtocolConfig {
  protocol: string;
  configs: Array<MetricConfig>;
}
