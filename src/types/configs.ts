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

export interface EnvConfig {
  mongodb: {
    databaseName: string;
    connectionUri: string;
    collections: {
      // states collection is used to save any states of any services
      // for example, when we sync logs from a contract,
      // we need to save the latest block where logs were sync
      states: string;

      // save any kind of cache
      caching: string;

      // save all activity events;
      activities: string;

      // this collection will be used to faster serve overview and chart data for frontends
      // there is a worker job run to aggregate data and save to this collection
      aggregates: string;

      // save all data states of lending market
      lendingMarketStates: string;

      // save all data snapshots of lending market
      lendingMarketSnapshots: string;
    };
  };

  // we pre-define supported blockchains here
  blockchains: {
    [key: string]: Blockchain;
  };
}

export const DataMetrics = {
  crossLending: 'crossLending',
  cdpLending: 'cdpLending',
  staking: 'staking',
  perpetual: 'perpetual',
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
export interface CrossLendingMarketConfig extends MetricConfig {
  version: LendingCrossVersion;

  // ignore these markets and tokens
  blacklists?: {
    [key: string]: boolean;
  };
}

const CdpVersions = Object.values(LendingMarketVersions.cdp);
export type LendingCdpVersion = (typeof CdpVersions)[number];
export interface CdpLendingMarketConfig extends MetricConfig {
  version: LendingCdpVersion;
  debtToken: Token;
}

export const MasterchefVersions = {
  origin: 'origin', // the original sushi masterchef
  masterv2: 'masterv2', // sushi masterchef v2
  mini: 'mini', // the minichef version of sushi were deployed other chains
};

const ChefVersions = Object.values(MasterchefVersions);
export type MasterchefVersion = (typeof ChefVersions)[number];

export interface MasterchefConfig extends MetricConfig {
  version: MasterchefVersion;

  // the reward token - ex: SUSHI
  rewardToken: Token;

  // original sushi masterchef is 10%
  devRewardSharePercentage: number;
}

export interface PerpetualMarketConfig extends MetricConfig {}

export interface ProtocolConfig {
  protocol: string;

  configs: Array<MetricConfig>;
}
