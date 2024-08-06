import { DataMetrics, DexConfig, DexVersions, ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions, RunAdapterOptions } from '../../../types/options';
import DexProtocolAdapter from '../dex';
import { DexLiquidityPoolDataTimeframe, DexLiquidityPoolMetadata } from '../../../types/domains/dex';
import UniswapV3FactoryAbi from '../../../configs/abi/uniswap/UniswapV3Factory.json';
import UniswapV3PoolAbi from '../../../configs/abi/uniswap/UniswapV3Pool.json';
import PancakeV3PoolAbi from '../../../configs/abi/pancake/PancakeV3Pool.json';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import envConfig from '../../../configs/envConfig';
import logger from '../../../lib/logger';
import { compareAddress, formatBigNumberToString, getTimestamp, normalizeAddress } from '../../../lib/utils';
import { decodeEventLog } from 'viem';
import { UniswapV3Events } from './abis';
import { TokenDexBase } from '../../../configs';
import UniswapLibs from '../../libs/uniswap';
import { OracleTypes } from '../../../types/oracles';
import BigNumber from 'bignumber.js';
import { DexBaseTokenBalanceUsdMinToTrackVolume, TimeUnits } from '../../../configs/constants';

interface GetPoolMetadataOptions {
  dexConfig: DexConfig;
  poolAddress: string;
  token0: string | null;
  token1: string | null;
  feeRate: string | null;
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

export default class Uniswapv3Adapter extends DexProtocolAdapter {
  public readonly name: string = 'adapter.uniswapv3 🦄';

  protected readonly testPairs: any = {
    ethereum: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
  };

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  private async getPoolMetadata(options: GetPoolMetadataOptions): Promise<DexLiquidityPoolMetadata | null> {
    if (!options.token0 || !options.token1) {
      [options.token0, options.token1, options.feeRate] = await this.services.blockchain.multicall({
        chain: options.dexConfig.chain,
        calls: [
          {
            abi: UniswapV3PoolAbi,
            target: options.poolAddress,
            method: 'token0',
            params: [],
          },
          {
            abi: UniswapV3PoolAbi,
            target: options.poolAddress,
            method: 'token1',
            params: [],
          },
          {
            abi: UniswapV3PoolAbi,
            target: options.poolAddress,
            method: 'fee',
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
        address: normalizeAddress(options.poolAddress),
        poolId: `${normalizeAddress(options.dexConfig.address)}-${normalizeAddress(options.poolAddress)}`,
        tokens: [token0, token1],
        feeRate: formatBigNumberToString(options.feeRate as string, 6),
        birthblock: options.blockNumber,
        birthday: options.blockTime,
      };
    }

    return null;
  }

  private async getPoolDataTimeframe(options: GetPoolDataOptions): Promise<DexLiquidityPoolDataTimeframe | null> {
    const { dexConfig, liquidityPool, beginBlock, endBlock, stateBlock, fromTime, toTime, stateTime } = options;

    const [balance0, balance1] = await this.services.blockchain.multicall({
      chain: dexConfig.chain,
      blockNumber: stateBlock,
      calls: [
        {
          abi: Erc20Abi,
          target: liquidityPool.tokens[0].address,
          method: 'balanceOf',
          params: [liquidityPool.address],
        },
        {
          abi: Erc20Abi,
          target: liquidityPool.tokens[1].address,
          method: 'balanceOf',
          params: [liquidityPool.address],
        },
      ],
    });
    const token0Balance = formatBigNumberToString(balance0.toString(), liquidityPool.tokens[0].decimals);
    const token1Balance = formatBigNumberToString(balance1.toString(), liquidityPool.tokens[1].decimals);

    let token0Price = '0';
    let token1Price = '0';
    if ((TokenDexBase as any)[liquidityPool.chain].includes(liquidityPool.tokens[0].address)) {
      const tokenPrice = await this.services.oracle.getTokenPriceUsd({
        chain: dexConfig.chain,
        address: liquidityPool.tokens[0].address,
        timestamp: stateTime,
      });
      const token1PriceVsToken0 = await UniswapLibs.getPricePool2(
        {
          chain: dexConfig.chain,
          type: OracleTypes.uniswapv3,
          address: liquidityPool.address,
          baseToken: liquidityPool.tokens[1],
          quotaToken: liquidityPool.tokens[0],
        },
        stateBlock,
      );
      token0Price = tokenPrice ? tokenPrice : '0';
      token1Price = token1PriceVsToken0
        ? new BigNumber(token1PriceVsToken0).multipliedBy(token0Price).toString(10)
        : '0';
    } else if ((TokenDexBase as any)[liquidityPool.chain].includes(liquidityPool.tokens[1].address)) {
      const tokenPrice = await this.services.oracle.getTokenPriceUsd({
        chain: dexConfig.chain,
        address: liquidityPool.tokens[1].address,
        timestamp: stateTime,
      });
      const token0PriceVsToken1 = await UniswapLibs.getPricePool2(
        {
          chain: dexConfig.chain,
          type: OracleTypes.uniswapv3,
          address: liquidityPool.address,
          baseToken: liquidityPool.tokens[0],
          quotaToken: liquidityPool.tokens[1],
        },
        stateBlock,
      );
      token1Price = tokenPrice ? tokenPrice : '0';
      token0Price = token0PriceVsToken1
        ? new BigNumber(token0PriceVsToken1).multipliedBy(token1Price).toString(10)
        : '0';
    } else {
      return null;
    }

    const liquidity0Usd = new BigNumber(token0Balance).multipliedBy(token0Price);
    const liquidity1Usd = new BigNumber(token1Balance).multipliedBy(token1Price);

    const liquidityPoolData: DexLiquidityPoolDataTimeframe = {
      ...liquidityPool,
      timestamp: stateTime,
      timefrom: fromTime,
      timeto: toTime,

      tokenPrices: [token0Price, token1Price],
      tokenBalances: [token0Balance, token1Balance],
      totalLiquidityUsd: liquidity0Usd.plus(liquidity1Usd).toString(10),
      volumeSwapUsd: '0',
      volumeAddLiquidityUsd: '0',
      volumeRemoveLiquidityUsd: '0',
      addressRouters: {},
      addressSwappers: {},
      tradeCount: 0,
    };

    // track volume
    if (liquidity0Usd.plus(liquidity1Usd).gte(DexBaseTokenBalanceUsdMinToTrackVolume)) {
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
        if (Object.values(UniswapV3Events).includes(signature)) {
          let event: any = null;
          try {
            // uniswap v3 original abi
            event = decodeEventLog({
              abi: UniswapV3PoolAbi,
              topics: log.topics,
              data: log.data,
            });
          } catch (e: any) {
            // pancake v3 abi
            event = decodeEventLog({
              abi: PancakeV3PoolAbi,
              topics: log.topics,
              data: log.data,
            });
          }

          if (!event) {
            continue;
          }

          switch (signature) {
            case UniswapV3Events.Swap:
            case UniswapV3Events.SwapPancakev3: {
              // count new trade
              liquidityPoolData.tradeCount += 1;

              // cal amount usd
              const amountUsd = new BigNumber(
                formatBigNumberToString(
                  new BigNumber(event.args.amount0.toString()).abs().toString(10),
                  liquidityPoolData.tokens[0].decimals,
                ),
              ).multipliedBy(liquidityPoolData.tokenPrices[0]);

              liquidityPoolData.volumeSwapUsd = new BigNumber(liquidityPoolData.volumeSwapUsd)
                .plus(amountUsd)
                .toString(10);

              const routerAddress = normalizeAddress(event.args.sender);
              const swapperAddress = normalizeAddress(event.args.recipient);

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
            case UniswapV3Events.Mint: {
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
            case UniswapV3Events.Burn: {
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
    const databaseLatestPairIdStateKey = `metadata-uniswapv3-factory-pools-${dexConfig.chain}-${dexConfig.protocol}-${dexConfig.address}`;

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

    logger.debug('start to get all univ3 pools metadata', {
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
        if (log.topics[0] === UniswapV3Events.PoolCreated) {
          const block = await this.services.blockchain.getBlock(dexConfig.chain, log.blockNumber);
          const event: any = decodeEventLog({
            abi: UniswapV3FactoryAbi,
            topics: log.topics,
            data: log.data,
          });
          const poolAddress = normalizeAddress(event.args.pool);
          const token0Address = normalizeAddress(event.args.token0);
          const token1Address = normalizeAddress(event.args.token1);

          const liquidityPool = await this.getPoolMetadata({
            dexConfig: dexConfig,
            poolAddress: poolAddress,
            token0: token0Address,
            token1: token1Address,
            feeRate: event.args.fee.toString(),
            blockNumber: Number(log.blockNumber),
            blockTime: Number(block.timestam),
          });
          if (liquidityPool) {
            liquidityPools.push(liquidityPool);

            if (databaseConnected) {
              await this.storages.database.update({
                collection: envConfig.mongodb.collections.metadataDexLiquidityPools.name,
                keys: {
                  protocol: liquidityPool.protocol,
                  chain: liquidityPool.chain,
                  address: liquidityPool.address,
                  poolId: liquidityPool.poolId,
                },
                updates: {
                  ...liquidityPool,
                },
                upsert: true,
              });
            }

            logger.debug('got univ3 pool metadata', {
              service: this.name,
              protocol: dexConfig.protocol,
              chain: dexConfig.chain,
              poolAddress: liquidityPool.address,
              tokens: `${liquidityPool.tokens[0].symbol}-${liquidityPool.tokens[1].symbol}`,
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

    if (dexConfig.metric !== DataMetrics.dex || dexConfig.version !== DexVersions.univ3) {
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
        liquidityPool,
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
        poolAddress: this.testPairs[dexConfig.chain],
        token0: null,
        token1: null,
        feeRate: '0', // don't care on test
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
