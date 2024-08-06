import BigNumber from 'bignumber.js';
import { Address, PublicClient, createPublicClient, http } from 'viem';

import { CustomQueryContractLogsBlockRange, DefaultQueryContractLogsBlockRange, TokenList } from '../../configs';
import ERC20Abi from '../../configs/abi/ERC20.json';
import { AddressE, AddressF, AddressMulticall3, AddressZero } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import envConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { compareAddress, normalizeAddress, sleep } from '../../lib/utils';
import { Token } from '../../types/configs';
import { ContextStorages } from '../../types/namespaces';
import { CachingService } from '../caching/caching';
import {
  GetContractLogsOptions,
  GetTokenOptions,
  IBlockchainService,
  IndexContractLogsOptions,
  MulticallOptions,
  ReadContractOptions,
} from './domains';
import BlockDater from './dater';

export default class BlockchainService extends CachingService implements IBlockchainService {
  public readonly name: string = 'blockchain';

  constructor() {
    super();
  }

  public getPublicClient(chain: string): PublicClient {
    return createPublicClient({
      batch: {
        multicall: true,
      },
      transport: http(EnvConfig.blockchains[chain].nodeRpc, {
        timeout: 10000, // 10 secs
        retryCount: 2,
        retryDelay: 5000, // 5 secs
      }),
    });
  }

  public async getLastestBlockNumber(chain: string): Promise<number> {
    const client = this.getPublicClient(chain);
    return Number(await client.getBlockNumber());
  }

  public async getBlock(chain: string, number: number): Promise<any> {
    const cachingKey = `blockdata-${chain}-${number}`;
    const cachingData = await this.getCachingData(cachingKey);
    if (cachingData) {
      return cachingData;
    }

    const client = this.getPublicClient(chain);
    const block = await client.getBlock({
      blockNumber: BigInt(number),
    });
    await this.setCachingData(cachingKey, block);

    return block;
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
      if (!onchain) {
        logger.warn('token not in the config list', {
          service: this.name,
          chain: chain,
          address: address,
        });
      }
      const [symbol, decimals] = await this.multicall({
        chain: chain,
        calls: [
          {
            target: address,
            abi: ERC20Abi,
            method: 'symbol',
            params: [],
          },
          {
            target: address,
            abi: ERC20Abi,
            method: 'decimals',
            params: [],
          },
        ],
      });

      if (symbol !== null && decimals !== null) {
        const token: Token = {
          chain,
          address: normalizeAddress(address),
          symbol,
          decimals: new BigNumber(decimals.toString()).toNumber(),
        };

        await this.setCachingData(cacheKey, token);

        return token;
      }
    } catch (e: any) {}

    return null;
  }

  public async getContractLogs(options: GetContractLogsOptions): Promise<Array<any>> {
    let logs: Array<any> = [];

    const client = this.getPublicClient(options.chain);

    const blockRange = options.blockRange
      ? options.blockRange
      : CustomQueryContractLogsBlockRange[options.chain]
        ? CustomQueryContractLogsBlockRange[options.chain]
        : DefaultQueryContractLogsBlockRange;

    let startBlock = options.fromBlock;
    while (startBlock <= options.toBlock) {
      const toBlock = startBlock + blockRange > options.toBlock ? options.toBlock : startBlock + blockRange;
      logs = logs.concat(
        await client.getLogs({
          address: options.address as Address,
          fromBlock: BigInt(Number(startBlock)),
          toBlock: BigInt(Number(toBlock)),
        }),
      );

      logger.debug('got contract event logs', {
        service: this.name,
        chain: options.chain,
        address: options.address,
        processed: `${toBlock - options.fromBlock}/${options.toBlock - options.fromBlock}`,
        events: logs.length,
      });

      startBlock += blockRange;
    }

    return logs;
  }

  public async readContract(options: ReadContractOptions): Promise<any> {
    const client = this.getPublicClient(options.chain);

    try {
      if (options.blockNumber && options.blockNumber > 0) {
        return await client.readContract({
          address: options.target as Address,
          abi: options.abi,
          functionName: options.method,
          args: options.params,
          blockNumber: BigInt(Number(options.blockNumber)),
        });
      } else {
        return await client.readContract({
          address: options.target as Address,
          abi: options.abi,
          functionName: options.method,
          args: options.params,
          blockTag: 'latest',
        });
      }
    } catch (e: any) {
      if (options.blockNumber) {
        try {
          return await client.readContract({
            address: options.target as Address,
            abi: options.abi,
            functionName: options.method,
            args: options.params,
            blockNumber: BigInt(Number(options.blockNumber) + 1),
          });
        } catch (e: any) {}
      }
    }

    return null;
  }

  public async multicall(options: MulticallOptions): Promise<any> {
    // first try with multicall3
    try {
      const multicall3Response: any = await this.multicall3(options);
      if (multicall3Response) {
        return multicall3Response;
      }
    } catch (e: any) {}

    try {
      const responses: Array<any> = [];
      for (const call of options.calls) {
        const response = await this.readContract({
          chain: options.chain,
          blockNumber: options.blockNumber,

          ...call,
        });
        responses.push(response);
      }
      return responses;
    } catch (e: any) {}

    return null;
  }

  public async multicall3(options: MulticallOptions): Promise<any> {
    const { chain, blockNumber, calls } = options;

    const client = this.getPublicClient(chain);

    const contracts = calls.map((call) => {
      return {
        address: call.target as Address,
        abi: call.abi,
        functionName: call.method,
        args: call.params,
      } as const;
    });

    return await client.multicall({
      multicallAddress: AddressMulticall3,
      contracts: contracts,
      blockNumber: blockNumber ? BigInt(blockNumber) : undefined,
      allowFailure: false,
    });
  }

  public async tryGetBlockNumberAtTimestamp(chain: string, timestamp: number): Promise<number> {
    const cachingKey = `getBlockAtTimestamp-${chain}-${timestamp}`;
    const cache = await this.getCachingData(cachingKey);
    if (cache) {
      return Number(cache);
    }

    const blockDater = new BlockDater(chain);

    let blockNumber = null;
    do {
      blockNumber = await blockDater.getBlockNumberByTimestamp(
        timestamp,
        true, // block after, optional. Search for the nearest block before or after the given date. By default true.
        true, // refresh boundaries, optional. Recheck the latest block before request. By default false.
      );

      if (!blockNumber) {
        logger.warn('retrying to query block number at timestamp', {
          service: this.name,
          chain,
          time: timestamp,
        });
        await sleep(5);
      }
    } while (blockNumber === null || blockNumber === 0);

    await this.setCachingData(cachingKey, blockNumber);

    return blockNumber;
  }

  // some adapters need contract logs history in a timeframe
  // get these logs every time need is very cost
  // this function aims to index logs of given contract
  public async indexContractLogs(storages: ContextStorages, options: IndexContractLogsOptions): Promise<void> {
    let startBlock = options.fromBlock;

    // query index state
    const cachingKey = `index-contract-logs-${options.chain}-${options.address}`;
    const cachingState = await storages.database.find({
      collection: envConfig.mongodb.collections.cachingStates.name,
      query: {
        name: cachingKey,
      },
    });
    if (cachingState) {
      startBlock = Number(cachingState.blockNumber);
    }

    const client = this.getPublicClient(options.chain);
    const blockRange = options.blockRange
      ? options.blockRange
      : CustomQueryContractLogsBlockRange[options.chain]
        ? CustomQueryContractLogsBlockRange[options.chain]
        : DefaultQueryContractLogsBlockRange;

    while (startBlock < options.toBlock) {
      const toBlock = startBlock + blockRange > options.toBlock ? options.toBlock : startBlock + blockRange;

      const logs = await client.getLogs({
        address: options.address as Address,
        fromBlock: BigInt(Number(startBlock)),
        toBlock: BigInt(Number(toBlock)),
      });

      const operations: Array<any> = [];
      for (const log of logs) {
        if (options.signatures.indexOf(log.topics[0] as string) !== -1) {
          operations.push({
            updateOne: {
              filter: {
                chain: options.chain,
                address: options.address,
                transactionHash: log.transactionHash,
                logIndex: log.logIndex,
              },
              update: {
                $set: {
                  chain: options.chain,
                  address: options.address,
                  transactionHash: log.transactionHash,
                  logIndex: log.logIndex,
                  blockNumber: Number(log.blockNumber),
                  topics: log.topics,
                  data: log.data,
                },
              },
              upsert: true,
            },
          });
        }
      }

      await storages.database.bulkWrite({
        collection: envConfig.mongodb.collections.cachingContractLogs.name,
        operations: operations,
      });

      await storages.database.update({
        collection: envConfig.mongodb.collections.cachingStates.name,
        keys: {
          name: cachingKey,
        },
        updates: {
          name: cachingKey,
          blockNumber: toBlock,
        },
        upsert: true,
      });

      logger.debug('indexed contract event logs', {
        service: this.name,
        chain: options.chain,
        address: options.address,
        fromBlock: startBlock,
        toBlock: toBlock,
        events: operations.length,
      });

      startBlock += blockRange;
    }
  }
}
