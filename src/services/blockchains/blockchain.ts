import BigNumber from 'bignumber.js';
import { Address, PublicClient, createPublicClient, http } from 'viem';

import { DefaultQueryContractLogsBlockRange, TokenList } from '../../configs';
import ERC20Abi from '../../configs/abi/ERC20.json';
import { AddressE, AddressF, AddressMulticall3, AddressZero } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import { tryQueryBlockTimestamps } from '../../lib/subsgraph';
import { compareAddress, normalizeAddress } from '../../lib/utils';
import { Token } from '../../types/configs';
import { CachingService } from '../caching/caching';
import {
  GetContractLogsOptions,
  GetTokenOptions,
  IBlockchainService,
  Multicall3Call,
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
      const symbol = await this.readContract({
        chain: chain,
        target: address,
        abi: ERC20Abi,
        method: 'symbol',
        params: [],
      });
      const decimals = await this.readContract({
        chain: chain,
        target: address,
        abi: ERC20Abi,
        method: 'decimals',
        params: [],
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

    let startBlock = options.fromBlock;
    while (startBlock <= options.toBlock) {
      const toBlock =
        startBlock + DefaultQueryContractLogsBlockRange > options.toBlock
          ? options.toBlock
          : startBlock + DefaultQueryContractLogsBlockRange;
      logs = logs.concat(
        await client.getLogs({
          address: options.address as Address,
          fromBlock: BigInt(Number(startBlock)),
          toBlock: BigInt(Number(toBlock)),
        }),
      );

      startBlock += DefaultQueryContractLogsBlockRange;
    }

    const blocktimes = await tryQueryBlockTimestamps(
      EnvConfig.blockchains[options.chain].blockSubgraph,
      options.fromBlock,
      options.toBlock,
    );

    return logs.map((log) => {
      return {
        ...log,
        timestamp: blocktimes[Number(log.blockNumber)],
      };
    });
  }

  public async readContract(options: ReadContractOptions): Promise<any> {
    const client = this.getPublicClient(options.chain);

    try {
      if (options.blockNumber) {
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

  public async multicall3(chain: string, calls: Array<Multicall3Call>): Promise<any> {
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
      allowFailure: false,
    });
  }
}
