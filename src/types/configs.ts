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

export interface ContractConfig {
  chain: string;

  // given name tag
  tag: string;

  // the factory contract address
  address: string;

  // the block number when contract was deployed
  birthblock: number;

  // used to filter logs
  topics: Array<Array<string>>;
}

export type LendingMarketVersion = 'aavev1' | 'aavev2' | 'aavev3' | 'compound' | 'compoundv3';
export interface LendingMarketConfig {
  chain: string;
  protocol: string;
  version: LendingMarketVersion;
  birthday: number;
  address: string;
}

export interface ProtocolConfig {
  protocol: string;

  // a list of contract which need to indexed logs
  contracts?: Array<ContractConfig>;

  // a list of lending market configs if any
  lendingMarkets?: Array<LendingMarketConfig>;
}
