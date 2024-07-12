import { OracleSourceChainlink, OracleSourcePool2, OracleSourceSavingDai } from '../../types/oracles';
import { IBlockchainService } from '../blockchains/domains';

export interface GetTokenPriceOptions {
  // chain where token was deployed
  chain: string;

  // the token contract address
  address: string;

  // it will be converted to block number to query on-chain data
  timestamp: number;
}

export interface IOracleService {
  name: string;

  blockchain: IBlockchainService | null | undefined;

  // this will get token price vs base token in the oracle config only
  getTokenPriceSource: (
    source: OracleSourceChainlink | OracleSourcePool2 | OracleSourceSavingDai,
    blockNumber: number,
  ) => Promise<string | null>;

  // this function will get the base token price in usd
  // in case the base token is not usd
  getTokenPriceUsd: (options: GetTokenPriceOptions) => Promise<string | null>;
}
