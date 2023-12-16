import { PublicClient } from 'viem';

import { Token } from '../../types/configs';

export interface ReadContractOptions {
  chain: string;
  target: string;
  abi: Array<any>;
  method: string;
  params: Array<any>;

  // sometime, we need query data at a given block
  // this call requires RPC is an archived node
  blockNumber?: number;
}

export interface GetTokenOptions {
  chain: string;
  address: string;

  // force to query data onchain
  onchain?: boolean;
}

export interface GetContractLogsOptions {
  chain: string;
  address: string;
  fromBlock: number;
  toBlock: number;
}

export interface IBlockchainService {
  // should be labeled as blockchain
  name: string;

  getPublicClient: (chain: string) => PublicClient;

  // get token info
  getTokenInfo: (options: GetTokenOptions) => Promise<Token | null>;

  // get contract raw logs
  getContractLogs: (options: GetContractLogsOptions) => Promise<Array<any>>;

  // read contract public method
  readContract: (call: ReadContractOptions) => Promise<any>;
}
