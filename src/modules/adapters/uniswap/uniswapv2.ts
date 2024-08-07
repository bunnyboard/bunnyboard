import { DataMetrics, DexConfig, DexVersions, ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions, RunAdapterOptions } from '../../../types/options';
import DexProtocolAdapter from '../dex';
import { DexLiquidityPoolDataTimeframe, DexLiquidityPoolMetadata } from '../../../types/domains/dex';
import UniswapV2FactoryAbi from '../../../configs/abi/uniswap/UniswapV2Factory.json';
import UniswapV2PairAbi from '../../../configs/abi/uniswap/UniswapV2Pair.json';
import envConfig from '../../../configs/envConfig';
import logger from '../../../lib/logger';
import { compareAddress, formatBigNumberToString, getTimestamp, normalizeAddress } from '../../../lib/utils';
import { TokenDexBase } from '../../../configs';
import BigNumber from 'bignumber.js';
import { DexBaseTokenBalanceUsdMinToTrackVolume, TimeUnits } from '../../../configs/constants';
import { UniswapV2Events } from './abis';
import { decodeEventLog } from 'viem';

interface GetPoolMetadataOptions {
  dexConfig: DexConfig;
  pairAddress: string;
  token0: string | null;
  token1: string | null;
  blockNumber: number;
  blockTime: number;
}

interface GetPoolDataOptions {
  dexConfig: DexConfig;
  liquidityPool: DexLiquidityPoolMetadata;

  beginBlock: number;
  endBlock: number;
  stateBlock: number;

  fromTime: number;
  toTime: number;
  stateTime: number;
}

export default class Uniswapv2Adapter extends DexProtocolAdapter {
  public readonly name: string = 'adapter.uniswapv2 🦄';

  protected readonly testPairs: any = {
    ethereum: '0x21b8065d10f73EE2e260e5B47D3344d3Ced7596E',
  };

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  private async getPoolMetadata(options: GetPoolMetadataOptions): Promise<DexLiquidityPoolMetadata | null> {
    if (!options.token0 || !options.token1) {
      [options.token0, options.token1] = await this.services.blockchain.multicall({
        chain: options.dexConfig.chain,
        calls: [
          {
            abi: UniswapV2PairAbi,
            target: options.pairAddress,
            method: 'token0',
            params: [],
          },
          {
            abi: UniswapV2PairAbi,
            target: options.pairAddress,
            method: 'token1',
            params: [],
          },
        ],
      });
    }

    const token0 = await this.services.blockchain.getTokenInfo({
      chain: options.dexConfig.chain,
      address: options.token0 as string,
    });
    const token1 = await this.services.blockchain.getTokenInfo({
      chain: options.dexConfig.chain,
      address: options.token1 as string,
    });

    if (token0 && token1) {
      return {
        protocol: options.dexConfig.protocol,
        chain: options.dexConfig.chain,
        version: options.dexConfig.version,
        address: normalizeAddress(options.pairAddress),
        poolId: `${normalizeAddress(options.dexConfig.address)}-${normalizeAddress(options.pairAddress)}`,
        tokens: [token0, token1],
        feeRate: options.dexConfig.feeRate ? options.dexConfig.feeRate : '0.003',
        birthblock: options.blockNumber,
        birthday: options.blockTime,
      };
    }

    return null;
  }

  private async getPoolDataTimeframe(options: GetPoolDataOptions): Promise<DexLiquidityPoolDataTimeframe | null> {
    const { dexConfig, liquidityPool, beginBlock, endBlock, stateBlock, fromTime, toTime, stateTime } = options;

    const [reserve0, reserve1] = await this.services.blockchain.readContract({
      chain: dexConfig.chain,
      abi: UniswapV2PairAbi,
      target: liquidityPool.address,
      method: 'getReserves',
      params: [],
      blockNumber: stateBlock,
    });
    const token0Reserve = formatBigNumberToString(reserve0.toString(), liquidityPool.tokens[0].decimals);
    const token1Reserve = formatBigNumberToString(reserve1.toString(), liquidityPool.tokens[1].decimals);

    let token0Price = '0';
    let token1Price = '0';
    let liquidityUsd = new BigNumber(0);
    if ((TokenDexBase as any)[liquidityPool.chain].includes(liquidityPool.tokens[0].address)) {
      const tokenPrice = await this.services.oracle.getTokenPriceUsd({
        chain: dexConfig.chain,
        address: liquidityPool.tokens[0].address,
        timestamp: stateTime,
      });
      token0Price = tokenPrice ? tokenPrice : '0';
      token1Price = new BigNumber(token0Price)
        .multipliedBy(new BigNumber(token0Reserve))
        .dividedBy(new BigNumber(token1Reserve))
        .toString(10);

      liquidityUsd = new BigNumber(token0Price).multipliedBy(new BigNumber(token0Reserve)).multipliedBy(2);
    } else if ((TokenDexBase as any)[liquidityPool.chain].includes(liquidityPool.tokens[1].address)) {
      const tokenPrice = await this.services.oracle.getTokenPriceUsd({
        chain: dexConfig.chain,
        address: liquidityPool.tokens[1].address,
        timestamp: stateTime,
      });
      token1Price = tokenPrice ? tokenPrice : '0';
      token0Price = new BigNumber(token1Price)
        .multipliedBy(new BigNumber(token1Reserve))
        .dividedBy(new BigNumber(token0Reserve))
        .toString(10);
      liquidityUsd = new BigNumber(token1Price).multipliedBy(new BigNumber(token1Reserve)).multipliedBy(2);
    } else {
      return null;
    }

    const liquidityPoolData: DexLiquidityPoolDataTimeframe = {
      ...liquidityPool,
      timestamp: stateTime,
      timefrom: fromTime,
      timeto: toTime,

      tokenPrices: [token0Price, token1Price],
      tokenBalances: [token0Reserve, token1Reserve],
      totalLiquidityUsd: liquidityUsd.toString(10),
      volumeSwapUsd: '0',
      volumeAddLiquidityUsd: '0',
      volumeRemoveLiquidityUsd: '0',
      addressRouters: {},
      addressSwappers: {},
      tradeCount: 0,
    };

    if (liquidityUsd.gte(DexBaseTokenBalanceUsdMinToTrackVolume)) {
      // we track volumes only on pools have more than DexBaseTokenBalanceUsdMinToTrackVolume liquidity
      const logs = await this.services.blockchain.getContractLogs({
        chain: dexConfig.chain,
        address: liquidityPool.address,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      const addressRouters: { [key: string]: string } = {};
      const addressSwappers: { [key: string]: string } = {};
      for (const log of logs) {
        const signature = log.topics[0];
        if (Object.values(UniswapV2Events).includes(signature)) {
          const event: any = decodeEventLog({
            abi: UniswapV2PairAbi,
            topics: log.topics,
            data: log.data,
          });
          switch (signature) {
            case UniswapV2Events.Swap: {
              // count new trade
              liquidityPoolData.tradeCount += 1;

              // cal amount usd
              let amountUsd = new BigNumber(0);
              if (event.args.amount0In.toString() !== '0') {
                amountUsd = new BigNumber(
                  formatBigNumberToString(event.args.amount0In.toString(), liquidityPoolData.tokens[0].decimals),
                ).multipliedBy(liquidityPoolData.tokenPrices[0]);
              } else {
                amountUsd = new BigNumber(
                  formatBigNumberToString(event.args.amount1In.toString(), liquidityPoolData.tokens[1].decimals),
                ).multipliedBy(liquidityPoolData.tokenPrices[1]);
              }

              liquidityPoolData.volumeSwapUsd = new BigNumber(liquidityPoolData.volumeSwapUsd)
                .plus(amountUsd)
                .toString(10);

              const routerAddress = normalizeAddress(event.args.sender);
              const swapperAddress = normalizeAddress(event.args.to);

              if (!compareAddress(routerAddress, swapperAddress)) {
                // count router address volume
                if (!addressRouters[routerAddress]) {
                  addressRouters[routerAddress] = '0';
                }
                addressRouters[routerAddress] = new BigNumber(addressRouters[routerAddress])
                  .plus(amountUsd)
                  .toString(10);
              }

              // count swapper address volume
              if (!addressSwappers[swapperAddress]) {
                addressSwappers[swapperAddress] = '0';
              }
              addressSwappers[swapperAddress] = new BigNumber(addressSwappers[swapperAddress])
                .plus(amountUsd)
                .toString(10);

              break;
            }
            case UniswapV2Events.Mint: {
              // cal amount usd
              const amount0Usd = new BigNumber(
                formatBigNumberToString(event.args.amount0.toString(), liquidityPoolData.tokens[0].decimals),
              ).multipliedBy(liquidityPoolData.tokenPrices[0]);
              const amount1Usd = new BigNumber(
                formatBigNumberToString(event.args.amount1.toString(), liquidityPoolData.tokens[1].decimals),
              ).multipliedBy(liquidityPoolData.tokenPrices[1]);
              liquidityPoolData.volumeAddLiquidityUsd = new BigNumber(liquidityPoolData.volumeAddLiquidityUsd)
                .plus(amount0Usd)
                .plus(amount1Usd)
                .toString(10);

              break;
            }
            case UniswapV2Events.Burn: {
              // cal amount usd
              const amount0Usd = new BigNumber(
                formatBigNumberToString(event.args.amount0.toString(), liquidityPoolData.tokens[0].decimals),
              ).multipliedBy(liquidityPoolData.tokenPrices[0]);
              const amount1Usd = new BigNumber(
                formatBigNumberToString(event.args.amount1.toString(), liquidityPoolData.tokens[1].decimals),
              ).multipliedBy(liquidityPoolData.tokenPrices[1]);
              liquidityPoolData.volumeRemoveLiquidityUsd = new BigNumber(liquidityPoolData.volumeRemoveLiquidityUsd)
                .plus(amount0Usd)
                .plus(amount1Usd)
                .toString(10);

              break;
            }
          }
        }
      }
      liquidityPoolData.addressRouters = addressRouters;
      liquidityPoolData.addressSwappers = addressSwappers;
    }

    return liquidityPoolData;
  }

  public async getDexLiquidityPoolMetadata(dexConfig: DexConfig): Promise<Array<DexLiquidityPoolMetadata>> {
    const liquidityPools: Array<DexLiquidityPoolMetadata> = [];

    // find the latest block number when events was synced from database
    let startFromBlock = dexConfig.birthblock ? dexConfig.birthblock : 0;
    const latestBlock = await this.services.blockchain.getLastestBlockNumber(dexConfig.chain);

    const databaseConnected = await this.storages.database.isConnected();
    const databaseLatestPairIdStateKey = `metadata-uniswapv2-factory-pools-${dexConfig.chain}-${dexConfig.protocol}-${dexConfig.address}`;

    if (databaseConnected) {
      // get existed pool from database
      const pools: Array<any> = await this.storages.database.query({
        collection: envConfig.mongodb.collections.metadataDexLiquidityPools.name,
        query: {
          chain: dexConfig.chain,
          protocol: dexConfig.protocol,
        },
      });
      for (const existedPool of pools) {
        liquidityPools.push({
          protocol: existedPool.protocol,
          chain: existedPool.chain,
          version: existedPool.version,
          address: existedPool.address,
          poolId: existedPool.poolId,
          tokens: existedPool.tokens,
          feeRate: existedPool.feeRate,
          birthblock: existedPool.birthblock,
          birthday: existedPool.birthday,
        });
      }

      const latestSyncState = await this.storages.database.find({
        collection: envConfig.mongodb.collections.cachingStates.name,
        query: {
          name: databaseLatestPairIdStateKey,
        },
      });
      if (latestSyncState) {
        startFromBlock = Number(latestSyncState.blockNumber) + 1;
      }
    }

    logger.debug('start to get all univ2 pair metadata', {
      service: this.name,
      protocol: dexConfig.protocol,
      chain: dexConfig.chain,
      factory: dexConfig.chain,
      fromBlock: startFromBlock,
      toBlock: latestBlock,
    });

    const chunkSize = 5000;
    while (startFromBlock < latestBlock) {
      const toBlock = startFromBlock + chunkSize > latestBlock ? latestBlock : startFromBlock + chunkSize;
      const logs = await this.services.blockchain.getContractLogs({
        chain: dexConfig.chain,
        address: dexConfig.address,
        fromBlock: startFromBlock,
        toBlock: toBlock,
      });
      for (const log of logs) {
        if (log.topics[0] === UniswapV2Events.PairCreated) {
          const block = await this.services.blockchain.getBlock(dexConfig.chain, log.blockNumber);
          const event: any = decodeEventLog({
            abi: UniswapV2FactoryAbi,
            topics: log.topics,
            data: log.data,
          });
          const pairAddress = normalizeAddress(event.args.pair);
          const token0Address = normalizeAddress(event.args.token0);
          const token1Address = normalizeAddress(event.args.token1);

          const poolMetadata = await this.getPoolMetadata({
            dexConfig: dexConfig,
            pairAddress: pairAddress,
            token0: token0Address,
            token1: token1Address,
            blockNumber: Number(log.blockNumber),
            blockTime: Number(block.timestamp),
          });

          if (poolMetadata) {
            liquidityPools.push(poolMetadata);

            if (databaseConnected) {
              await this.storages.database.update({
                collection: envConfig.mongodb.collections.metadataDexLiquidityPools.name,
                keys: {
                  protocol: poolMetadata.protocol,
                  chain: poolMetadata.chain,
                  address: poolMetadata.address,
                  poolId: poolMetadata.poolId,
                },
                updates: {
                  ...poolMetadata,
                },
                upsert: true,
              });
            }

            logger.debug('got univ2 pair metadata', {
              service: this.name,
              protocol: dexConfig.protocol,
              chain: dexConfig.chain,
              pairAddress: poolMetadata.address,
              tokens: `${poolMetadata.tokens[0].symbol}-${poolMetadata.tokens[1].symbol}`,
            });
          }
        }
      }

      // update latest block number which indexed logs
      if (databaseConnected) {
        await this.storages.database.update({
          collection: envConfig.mongodb.collections.cachingStates.name,
          keys: {
            name: databaseLatestPairIdStateKey,
          },
          updates: {
            name: databaseLatestPairIdStateKey,
            blockNumber: toBlock + 1,
          },
          upsert: true,
        });
      }

      startFromBlock = toBlock + 1;
    }

    return liquidityPools;
  }

  public async getDexDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<Array<DexLiquidityPoolDataTimeframe> | null> {
    const dexConfig = options.config as DexConfig;

    if (dexConfig.metric !== DataMetrics.dex || dexConfig.version !== DexVersions.univ2) {
      return null;
    }

    const liquidityPoolMetadata: Array<DexLiquidityPoolMetadata> = await this.getDexLiquidityPoolMetadata(dexConfig);

    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(dexConfig.chain, options.fromTime);
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(dexConfig.chain, options.toTime);
    const stateBlock = options.latestState ? endBlock : beginBlock;
    const stateTime = options.latestState ? options.toTime : options.fromTime;

    const liquidityPools: Array<DexLiquidityPoolDataTimeframe> = [];
    for (const liquidityPool of liquidityPoolMetadata) {
      if (liquidityPool.birthblock > stateBlock) {
        // pool has not existed yet
        continue;
      }

      const poolData = await this.getPoolDataTimeframe({
        dexConfig: dexConfig,
        liquidityPool: liquidityPool,
        beginBlock,
        endBlock,
        stateBlock,
        fromTime: options.fromTime,
        toTime: options.toTime,
        stateTime,
      });

      if (poolData) {
        liquidityPools.push(poolData);
      }
    }

    return liquidityPools;
  }

  public async runTest(options: RunAdapterOptions): Promise<void> {
    const dexConfig = options.metricConfig as DexConfig;

    const currentTime = getTimestamp();
    const last24HoursTime = currentTime - TimeUnits.SecondsPerDay;

    if (this.testPairs[dexConfig.chain]) {
      const poolMetadata = await this.getPoolMetadata({
        dexConfig: dexConfig,
        pairAddress: this.testPairs[dexConfig.chain],
        token0: null,
        token1: null,
        blockNumber: 0, // don't care on test
        blockTime: 0, // don't care on test
      });

      if (poolMetadata) {
        const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
          dexConfig.chain,
          last24HoursTime,
        );
        const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(dexConfig.chain, currentTime);
        const poolData = await this.getPoolDataTimeframe({
          dexConfig: dexConfig,
          liquidityPool: poolMetadata,
          beginBlock,
          endBlock,
          stateBlock: endBlock,
          fromTime: last24HoursTime,
          toTime: currentTime,
          stateTime: currentTime,
        });

        console.log(poolData);
      }
    }
  }
}
