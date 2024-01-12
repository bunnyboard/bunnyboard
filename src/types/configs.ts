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

export type OracleType =
  | 'chainlink'
  | 'univ2'
  | 'univ3'

  // https://etherscan.io/token/0x83F20F44975D03b1b09e64809B757c47f942BEeA
  | 'savingDai';
export type OracleCurrencyBase = 'usd' | 'eth' | 'btc' | 'bnb' | 'avax' | 'matic' | 'ftm';

interface OracleSourceBase {
  type: OracleType;
  chain: string;
  address: string;
}

export interface OracleSourceChainlink extends OracleSourceBase {
  // aggregator data decimals places
  decimals: number;
}

export interface OracleSourceUniv2 extends OracleSourceBase {
  baseToken: Token;
  quotaToken: Token;
}

export interface OracleSourceUniv3 extends OracleSourceUniv2 {}

// this oracle present a bearing staking pool
// the price will be calculated by amount of underlying (staked) token
export interface OracleSourceBearingToken extends OracleSourceBase {
  token: Token;
}

export interface OracleConfig {
  // if the currency is not usd
  // we need to get currency base token price too
  currency: OracleCurrencyBase;

  // a list of on-chain sources where we can get the token price
  sources: Array<OracleSourceChainlink | OracleSourceUniv2 | OracleSourceUniv3 | OracleSourceBearingToken>;

  // if the coingecko id was given
  // we will get price from coingecko API
  // in case we failed to get price from on-chain source
  coingeckoId?: string;

  // if is stablecoin, return 1 when we can not fetch the price from any source
  stablecoin?: boolean;
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
