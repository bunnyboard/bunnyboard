import Web3 from 'web3';

import { Token } from '../../types/configs';

export interface ContractCall {
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

export interface GetContractLogOptions {
  chain: string;
  address: string;
  fromBlock: number;
  toBlock: number;
  topics: Array<string>;
}

export interface IBlockchainService {
  // should be labeled as blockchain
  name: string;

  providers: { [key: string]: Web3 };

  // get provider sdk
  getProvider: (chain: string) => Web3;

  // get token info
  getTokenInfo: (options: GetTokenOptions) => Promise<Token | null>;

  getContractLogs: (options: GetContractLogOptions) => Promise<Array<any>>;

  // query single
  singlecall: (call: ContractCall) => Promise<any>;
}
