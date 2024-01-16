import { Token } from './configs';

export type OracleCurrencyBase = 'usd' | 'eth' | 'btc' | 'bnb' | 'avax' | 'matic' | 'ftm';

export const OracleTypes = {
  chainlink: 'chainlink',
  uniswapv2: 'univ2',
  uniswapv3: 'univ3',

  // https://etherscan.io/token/0x83F20F44975D03b1b09e64809B757c47f942BEeA
  savingDai: 'savingDai',

  // https://etherscan.io/address/0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b
  // get oracle address from comptroller
  compoundOracle: 'compoundOracle',
};
const AllOracleTypes = Object.values(OracleTypes);
export type OracleType = (typeof AllOracleTypes)[number];

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

// this oracle present a compound.finance oracle source
export interface OracleSourceCompoundOracle extends OracleSourceBase {
  cTokenAddress: string;
}

export interface OracleConfig {
  // if the currency is not usd
  // we need to get currency base token price too
  currency: OracleCurrencyBase;

  // a list of on-chain sources where we can get the token price
  sources: Array<
    | OracleSourceChainlink
    | OracleSourceUniv2
    | OracleSourceUniv3
    | OracleSourceBearingToken
    | OracleSourceCompoundOracle
  >;

  // if the coingecko id was given
  // we will get price from coingecko API
  // in case we failed to get price from on-chain source
  coingeckoId?: string;

  // if is stablecoin, return 1 when we can not fetch the price from any source
  stablecoin?: boolean;
}
