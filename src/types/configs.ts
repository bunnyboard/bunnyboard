export type ChainFamily = 'evm';

export interface Token {
  chain: string;
  address: string;
  symbol: string;
  decimals: number;
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

      // save token prices
      tokenPrices: string;

      // save metrics related to blockchains
      chainMetricSnapshots: string;

      // save lending market states - latest snapshot
      lendingMarketStates: string;

      // save lending market metrics and snapshots
      lendingMarketSnapshots: string;

      // save lending market activity events
      lendingMarketActivities: string;

      // save masterchef pool states - latest snapshot
      masterchefPoolStates: string;

      // save masterchef pools metric and snapshots
      masterchefPoolSnapshots: string;

      // save masterchef activity events
      masterchefPoolActivities: string;

      // save perpetual market states
      perpetualMarketStates: string;

      // save perpetual market snapshots
      perpetualMarketSnapshots: string;

      // save perpetual market activities
      perpetualMarketActivities: string;
    };
  };

  // we pre-define supported blockchains here
  blockchains: {
    [key: string]: Blockchain;
  };
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

export interface LiquidityPoolConfig extends Token {
  tokens: Array<Token>;
}

export type LendingMarketType = 'cross' | 'cdp';
export type LendingCrossVersion = 'aavev1' | 'aavev2' | 'aavev3' | 'compound' | 'compoundv3' | 'venusIsolated';
export type LendingCdpVersion = 'compoundv3' | 'liquity' | 'maker';
export interface LendingMarketConfig {
  chain: string;
  protocol: string;
  type: LendingMarketType;
  version: LendingCrossVersion | LendingCdpVersion;
  birthday: number;

  // the market address, collateral manager, protocol logic, etc...
  address: string;

  // in CDP market, there is a default debt token and a collateral token
  // ex: DAI in Maker DAO
  debtToken?: Token;
  collateralToken?: Token;
}

export type MasterchefVersion =
  | 'master' // the original sushi masterchef
  | 'masterv2' // sushi masterchef v2
  | 'mini'; // the minichef version of sushi were deployed other chains
export interface MasterchefConfig {
  chain: string;
  protocol: string;
  version: MasterchefVersion;
  birthday: number;
  address: string;
  rewardToken: Token;

  // original sushi masterchef is 10%
  devRewardSharePercentage: number;
}

export interface PerpetualMarketConfig {
  chain: string;
  protocol: string;
  birthday: number;
  address: string;
}

export interface ChainMetricConfig extends Blockchain {
  publicRpc: string;
}

export interface ProtocolConfig {
  protocol: string;

  // a list of lending market configs if any
  lendingMarkets?: Array<LendingMarketConfig>;

  // a list of masterchef if any
  masterchefs?: Array<MasterchefConfig>;

  // a list of config to collect blockchain metrics
  chainMetrics?: Array<ChainMetricConfig>;

  // a list of perpetual market configs
  perpetualMarkets?: Array<PerpetualMarketConfig>;
}
