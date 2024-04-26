import retry from 'async-retry';
import axios, { RawAxiosRequestHeaders } from 'axios';
import BigNumber from 'bignumber.js';
import { Address, PublicClient, createPublicClient, http } from 'viem';

import { CustomQueryContractLogsBlockRange, DefaultQueryContractLogsBlockRange, TokenList } from '../../configs';
import ERC20Abi from '../../configs/abi/ERC20.json';
import { AddressE, AddressF, AddressMulticall3, AddressZero } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { compareAddress, normalizeAddress, sleep } from '../../lib/utils';
import { Token } from '../../types/configs';
import { CachingService } from '../caching/caching';
import {
  GetContractLogsOptions,
  GetTokenOptions,
  IBlockchainService,
  MulticallOptions,
  ReadContractOptions,
} from './domains';

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
      transport: http(EnvConfig.blockchains[chain].nodeRpc),
    });
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

      if (symbol && decimals) {
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

    const blockRange = CustomQueryContractLogsBlockRange[options.chain]
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

      startBlock += DefaultQueryContractLogsBlockRange;
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

  public async getBlockNumberAtTimestamp(chain: string, timestamp: number): Promise<number | null> {
    const chainConfig = EnvConfig.blockchains[chain];

    let blockNumber = null;

    // get from subgraph
    if (chainConfig && chainConfig.blockSubgraph !== '') {
      const query = `
        {
          blocks(first: 1, where: {timestamp_lte: ${timestamp}}, orderBy: timestamp, orderDirection: desc) {
            number
          }
        }
      `;

      const response = await retry(
        async function () {
          const response = await axios.post(
            chainConfig.blockSubgraph,
            {
              query: query,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              } as RawAxiosRequestHeaders,
            },
          );

          return response.data.data;
        },
        {
          retries: 5,
        },
      );

      if (response && response.blocks && response.blocks[0] && response.blocks[0].number) {
        blockNumber = Number(response.blocks[0].number);
      }
    }

    // get from explorer api
    if (chainConfig && chainConfig.explorerApiEndpoint) {
      const url = `${chainConfig.explorerApiEndpoint}?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before`;
      const response = await retry(
        async function () {
          try {
            const response = await axios.get(url, {
              headers: {
                'Content-Type': 'application/json',
              } as RawAxiosRequestHeaders,
            });

            return response.data;
          } catch (e: any) {
            console.log(e.message);
          }
        },
        {
          retries: 5,
        },
      );

      if (response && response.status === '1' && response.result) {
        if (response.result.blockNumber) {
          blockNumber = Number(response.result.blockNumber);
        } else {
          blockNumber = Number(response.result);
        }
      }
    }

    return blockNumber;
  }

  public async tryGetBlockNumberAtTimestamp(chain: string, timestamp: number): Promise<number> {
    const cachingKey = `getBlockAtTimestamp-${chain}-${timestamp}`;
    const cache = await this.getCachingData(cachingKey);
    if (cache) {
      return Number(cache);
    }

    let blockNumber = null;

    do {
      blockNumber = await this.getBlockNumberAtTimestamp(chain, timestamp);

      if (!blockNumber) {
        await sleep(5);
      }
    } while (blockNumber === null);

    await this.setCachingData(cachingKey, blockNumber);

    return blockNumber;
  }
}
