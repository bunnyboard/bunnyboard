import { LiquidityPoolConfig } from '../../types/configs';
import {
  OracleSourceBearingToken,
  OracleSourceChainlink,
  OracleSourceCompoundOracle,
  OracleSourceUniv2,
  OracleSourceUniv3,
} from '../../types/oracles';

export interface GetTokenPriceOptions {
  // chain where token was deployed
  chain: string;

  // the token contract address
  address: string;

  // we always convert timestamp to the timestamp at the beginning of the day
  timestamp: number;
}

export interface GetUniv2TokenPriceOptions {
  pool2: LiquidityPoolConfig;
  timestamp: number;
}

export interface IOracleService {
  name: string;

  // this will get token price vs base token in the oracle config only
  getTokenPriceSource: (
    source:
      | OracleSourceChainlink
      | OracleSourceUniv2
      | OracleSourceUniv3
      | OracleSourceBearingToken
      | OracleSourceCompoundOracle,
    blockNumber: number,
  ) => Promise<string | null>;

  // this function will get the base token price in usd
  // in case the base token is not usd
  getTokenPriceUsd: (options: GetTokenPriceOptions) => Promise<string | null>;

  // get univ2 lp token price
  getUniv2TokenPriceUsd: (options: GetUniv2TokenPriceOptions) => Promise<string | null>;
}
