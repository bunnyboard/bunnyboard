import BigNumber from 'bignumber.js';
import Web3 from 'web3';

import { DefaultQueryLogsBlockRange, TokenList } from '../../configs';
import ERC20Abi from '../../configs/abi/ERC20.json';
import { AddressE, AddressF, AddressZero } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { compareAddress, normalizeAddress } from '../../lib/utils';
import { Token } from '../../types/configs';
import { CachingService } from '../caching/caching';
import { ContractCall, GetContractLogOptions, GetTokenOptions, IBlockchainService } from './domains';

export default class BlockchainService extends CachingService implements IBlockchainService {
  public readonly name: string = 'blockchain';
  public readonly providers: { [key: string]: Web3 } = {};

  constructor() {
    super();

    for (const [chain, config] of Object.entries(EnvConfig.blockchains)) {
      this.providers[chain] = new Web3(config.nodeRpc);
    }
  }

  public getProvider(chain: string): Web3 {
    if (!this.providers[chain]) {
      // get config and initialize a new provider
      this.providers[chain] = new Web3(EnvConfig.blockchains[chain].nodeRpc);
    }

    return this.providers[chain];
  }

  public async getTokenInfo(options: GetTokenOptions): Promise<Token | null> {
    const { chain, onchain } = options;
    const address = normalizeAddress(options.address);

    const cacheKey = `erc20-${chain}-${address}`;
    if (!onchain) {
      const cacheToken = await this.getCachingData(cacheKey);
      if (cacheToken) {
        return cacheToken as Token;
      }

      // get from hard codes
      if (
        compareAddress(address, AddressZero) ||
        compareAddress(address, AddressE) ||
        compareAddress(address, AddressF)
      ) {
        return {
          ...EnvConfig.blockchains[chain].nativeToken,
        };
      }

      // get from static config
      if (TokenList[chain]) {
        for (const [, token] of Object.entries(TokenList[chain])) {
          if (compareAddress(address, token.address)) {
            return token;
          }
        }
      }
    }

    // query on-chain data
    try {
      const symbol = await this.singlecall({
        chain: chain,
        target: address,
        abi: ERC20Abi,
        method: 'symbol',
        params: [],
      });
      const decimals = await this.singlecall({
        chain: chain,
        target: address,
        abi: ERC20Abi,
        method: 'decimals',
        params: [],
      });

      const token: Token = {
        chain,
        address: normalizeAddress(address),
        symbol,
        decimals: new BigNumber(decimals.toString()).toNumber(),
      };

      await this.setCachingData(cacheKey, token);

      return token;
    } catch (e: any) {
      logger.warn('failed to get token info', {
        service: this.name,
        chain: chain,
        token: address,
        error: e.message,
      });
    }

    return null;
  }

  public async getContractLogs(options: GetContractLogOptions): Promise<Array<any>> {
    let logs: Array<any> = [];

    const web3 = this.getProvider(options.chain);
    let startBlock = options.fromBlock;
    while (startBlock <= options.toBlock) {
      const toBlock =
        startBlock + DefaultQueryLogsBlockRange > options.toBlock
          ? options.toBlock
          : startBlock + DefaultQueryLogsBlockRange;
      logs = logs.concat(
        await web3.eth.getPastLogs({
          address: options.address,
          fromBlock: startBlock,
          toBlock: toBlock,
          topics: options.topics,
        }),
      );

      startBlock += DefaultQueryLogsBlockRange;
    }

    return logs;
  }

  public async singlecall(call: ContractCall): Promise<any> {
    const contract = new this.providers[call.chain].eth.Contract(call.abi, call.target);

    let result;
    try {
      const startExeTime = Math.floor(new Date().getTime() / 1000);

      if (call.blockNumber) {
        result = await contract.methods[call.method](...(call.params as [])).call({}, call.blockNumber);
      } else {
        result = await contract.methods[call.method](...(call.params as [])).call();
      }

      const endExeTime = Math.floor(new Date().getTime() / 1000);
      const elapsed = endExeTime - startExeTime;

      if (elapsed > 5) {
        logger.debug('took too long for onchain single call', {
          service: this.name,
          chain: call.chain,
          target: call.target,
          method: call.method,
          params: call.params.length > 0 ? call.params.toString() : '[]',
        });
      }
    } catch (e: any) {
      // logger.debug('failed to query contract', {
      //   service: this.name,
      //   chain: call.chain,
      //   target: call.target,
      //   method: call.method,
      //   params: call.params.length > 0 ? call.params.toString() : '[]',
      // });
    }

    return result;
  }
}
