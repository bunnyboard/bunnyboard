import { Token } from './configs';

export type OracleCurrencyBase = 'usd' | 'eth' | 'btc' | 'bnb' | 'avax' | 'matic' | 'ftm';

export const OracleTypes = {
  // ChainLink price feed
  // https://docs.chain.link/data-feeds
  chainlink: 'chainlink',

  // uniswap pool2 version 2
  uniswapv2: 'univ2',

  // uniswap pool2 version 3
  uniswapv3: 'univ3',

  // https://etherscan.io/token/0x83F20F44975D03b1b09e64809B757c47f942BEeA
  savingDai: 'savingDai',

  // https://etherscan.io/address/0x76A9f30B45F4ebFD60Ce8a1c6e963b1605f7cB6d
  // https://docs.makerdao.com/smart-contract-modules/core-module/spot-detailed-documentation
  makerRwaPip: 'makerRwaPip',
};
const AllOracleTypes = Object.values(OracleTypes);
export type OracleType = (typeof AllOracleTypes)[number];

interface OracleSourceBase {
  type: OracleType;
  chain: string;
  address: string;

  // if the currency is not usd
  // we need to get currency base token price too
  currency?: OracleCurrencyBase;
}

export interface OracleSourceChainlink extends OracleSourceBase {
  // aggregator data decimals places
  decimals: number;
}

export interface OracleSourcePool2 extends OracleSourceBase {
  baseToken: Token;
  quotaToken: Token;
}

// this oracle present a bearing staking pool
// the price will be calculated by amount of underlying (staked) token
export interface OracleSourceSavingDai extends OracleSourceBase {
  token: Token;
}

// this oracle using pip contract from Maker Dao
// this support get price of MakerDao RWA
// https://docs.makerdao.com/smart-contract-modules/core-module/spot-detailed-documentation
export interface OracleSourceMakerRwaPip extends OracleSourceBase {
  // get from ilk from collateral join contract
  ilk: string; //
}

export interface OracleOffchainSource {
  source: string; // binance
  ticker: string; // ETHUSDT
}

export interface OracleConfig {
  // if the currency is not usd
  // we need to get currency base token price too
  currency: OracleCurrencyBase;

  // a list of on-chain sources where we can get the token price
  sources: Array<OracleSourceChainlink | OracleSourcePool2 | OracleSourceSavingDai | OracleSourceMakerRwaPip>;

  // if is stablecoin, return 1 when we can not fetch the price from any source
  stablecoin?: boolean;

  // support to get token price when it was not available onchain yet
  offchainSources?: Array<OracleOffchainSource>;
}
