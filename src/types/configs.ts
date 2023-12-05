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

      // save contract configs
      contracts: string;

      // save contract raw logs
      rawlogs: string;

      // save token prices
      tokenPrices: string;

      // save lending market metrics and snapshots
      lendingMarketSnapshots: string;
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
}

export interface ContractFilterLogTopics {
  // required, event signature
  topic0: string;

  // match with topics list item index
  topic1?: string;
  topic2?: string;
  topic3?: string;
}

export interface ContractConfig {
  chain: string;

  // given name tag
  tag: string;

  // the factory contract address
  address: string;

  // the timestamp when contract was deployed
  birthday: number;

  // for logs indexing
  logFilters: Array<ContractFilterLogTopics>;
}

export type LendingMarketVersion = 'aavev1' | 'aavev2' | 'aavev3' | 'compound' | 'compoundv3' | 'venusIsolated';
export interface LendingMarketConfig {
  chain: string;
  protocol: string;
  version: LendingMarketVersion;
  birthday: number;
  address: string;
}

export type LendingCdpVersion = 'compoundv3' | 'liquity' | 'maker';
export interface LendingCdpConfig {
  chain: string;
  protocol: string;
  version: LendingCdpVersion;
  birthday: number;
  debtToken: Token;
}

export interface ProtocolConfig {
  protocol: string;

  // a list of contract which need to indexed logs
  contracts?: Array<ContractConfig>;

  // a list of lending market configs if any
  lendingMarkets?: Array<LendingMarketConfig>;

  // a list of lending CDP configs if any
  lendingCdps?: Array<LendingCdpConfig>;
}
