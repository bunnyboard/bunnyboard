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
      states: string;

      // this collection will be used to faster serve overview and chart data for frontends
      // there is a worker job run to aggregate data and save to this collection
      aggregates: string;

      // address save protocol users addresses
      addresses: string;

      // save all data states of lending market
      lendingMarketStates: string;

      // save all data snapshots of lending market
      lendingMarketSnapshots: string;

      // save all data states of perpetual market
      perpetualMarketStates: string;

      // save all snapshots of perpetual market
      perpetualMarketSnapshots: string;
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
  erc20: 'erc20',
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

export const PerpetualMarketVersions = {
  gmx: 'gmx',
  gmxv2: 'gmxv2',
};
const AllPerpetualMarketVersions = Object.values(PerpetualMarketVersions);
export type PerpetualVersion = (typeof AllPerpetualMarketVersions)[number];

export interface PerpetualMarketConfig extends MetricConfig {
  version: PerpetualVersion;
}

export interface ProtocolConfig {
  protocol: string;

  configs: Array<MetricConfig>;
}
