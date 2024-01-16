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
  lending: 'lending',
  masterchef: 'masterchef',
  perpetual: 'perpetual',
};
const Metrics = Object.values(DataMetrics);
export type DataMetric = (typeof Metrics)[number];

export interface MetricConfig extends Contract {
  metric: DataMetric;
  birthday: number;
}

export const LendingMarketTypes = {
  cross: 'cross',
  cdp: 'cdp',
};
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

const MarketTypes = Object.values(LendingMarketTypes);
const CrossVersions = Object.values(LendingMarketVersions.cross);
const CdpVersions = Object.values(LendingMarketVersions.cdp);

export type LendingMarketType = (typeof MarketTypes)[number];
export type LendingCrossVersion = (typeof CrossVersions)[number];
export type LendingCdpVersion = (typeof CdpVersions)[number];

export interface LendingMarketConfig extends MetricConfig {
  type: LendingMarketType;
  version: LendingCrossVersion | LendingCdpVersion;

  // in CDP market, there is a default debt token and a collateral token
  // ex: DAI in Maker DAO
  debtToken?: Token;
  collateralToken?: Token;

  // ignore these markets and tokens
  blacklists?: {
    [key: string]: boolean;
  };
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
