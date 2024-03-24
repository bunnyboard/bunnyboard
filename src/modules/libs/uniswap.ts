import { Token as UniswapSdkToken } from '@uniswap/sdk-core';
import { Pool } from '@uniswap/v3-sdk';
import axios from 'axios';
import BigNumber from 'bignumber.js';

import ERC20Abi from '../../configs/abi/ERC20.json';
import UniswapV3PoolAbi from '../../configs/abi/uniswap/UniswapV3Pool.json';
import { tryQueryBlockMeta } from '../../lib/subsgraph';
import { normalizeAddress, sleep } from '../../lib/utils';
import BlockchainService from '../../services/blockchains/blockchain';
import {
  DexLiquidityPoolMetadata,
  DexLiquidityPoolSnapshot,
  DexLiquidityTokenSnapshot,
} from '../../types/collectors/dexscan';
import { GetDexLiquidityTokenDataOptions } from '../../types/collectors/options';
import { DexVersions, LiquidityPoolConfig } from '../../types/configs';
import { OracleSourceUniv2, OracleSourceUniv3 } from '../../types/oracles';

export default class UniswapLibs {
  public static async getPool2Constant(chain: string, address: string): Promise<LiquidityPoolConfig | null> {
    const blockchain = new BlockchainService();
    const symbol = await blockchain.readContract({
      chain: chain,
      abi: ERC20Abi,
      target: address,
      method: 'symbol',
      params: [],
    });
    const decimals = await blockchain.readContract({
      chain: chain,
      abi: ERC20Abi,
      target: address,
      method: 'decimals',
      params: [],
    });

    if (symbol && decimals) {
      const pool: LiquidityPoolConfig = {
        chain: chain,
        address: normalizeAddress(address),
        symbol: symbol,
        decimals: Number(decimals),
        tokens: [],
      };

      const token0Address = await blockchain.readContract({
        chain: chain,
        abi: UniswapV3PoolAbi,
        target: address,
        method: 'token0',
        params: [],
      });
      const token1Address = await blockchain.readContract({
        chain: chain,
        abi: UniswapV3PoolAbi,
        target: address,
        method: 'token1',
        params: [],
      });

      if (token0Address && token1Address) {
        const token0 = await blockchain.getTokenInfo({
          chain: chain,
          address: token0Address,
        });
        const token1 = await blockchain.getTokenInfo({
          chain: chain,
          address: token1Address,
        });
        if (token0 && token1) {
          pool.tokens.push(token0);
          pool.tokens.push(token1);
        }
      }

      return pool;
    }

    return null;
  }

  public static async getPricePool2(
    source: OracleSourceUniv2 | OracleSourceUniv3,
    blockNumber: number,
  ): Promise<string | null> {
    const blockchain = new BlockchainService();

    if (source.type === 'univ2') {
      const baseTokenBalance = await blockchain.readContract({
        chain: source.chain,
        abi: ERC20Abi,
        target: source.baseToken.address,
        method: 'balanceOf',
        params: [source.address],
        blockNumber: blockNumber,
      });

      const quotaTokenBalance = await blockchain.readContract({
        chain: source.chain,
        abi: ERC20Abi,
        target: source.quotaToken.address,
        method: 'balanceOf',
        params: [source.address],
        blockNumber: blockNumber,
      });

      if (baseTokenBalance && quotaTokenBalance && baseTokenBalance !== '0') {
        return new BigNumber(quotaTokenBalance.toString())
          .multipliedBy(new BigNumber(10).pow(source.baseToken.decimals))
          .dividedBy(new BigNumber(baseTokenBalance.toString()))
          .dividedBy(new BigNumber(10).pow(source.quotaToken.decimals))
          .toString(10);
      }
    } else if (source.type === 'univ3') {
      const [fee, state, liquidity] = await Promise.all([
        blockchain.readContract({
          chain: source.chain,
          abi: UniswapV3PoolAbi,
          target: source.address,
          method: 'fee',
          params: [],
          blockNumber: blockNumber,
        }),
        blockchain.readContract({
          chain: source.chain,
          abi: UniswapV3PoolAbi,
          target: source.address,
          method: 'slot0',
          params: [],
          blockNumber: blockNumber,
        }),
        blockchain.readContract({
          chain: source.chain,
          abi: UniswapV3PoolAbi,
          target: source.address,
          method: 'liquidity',
          params: [],
          blockNumber: blockNumber,
        }),
      ]);

      if (fee && state && liquidity) {
        const baseTokenConfig = new UniswapSdkToken(1, source.baseToken.address, source.baseToken.decimals, '', '');
        const quoteTokenConfig = new UniswapSdkToken(1, source.quotaToken.address, source.quotaToken.decimals, '', '');

        const pool = new Pool(
          baseTokenConfig,
          quoteTokenConfig,
          Number(fee.toString()),
          state[0].toString(),
          liquidity.toString(),
          new BigNumber(state[1].toString()).toNumber(),
        );

        if (normalizeAddress(pool.token0.address) === normalizeAddress(source.baseToken.address)) {
          return new BigNumber(pool.token0Price.toFixed(12)).toString(10);
        } else {
          return new BigNumber(pool.token1Price.toFixed(12)).toString(10);
        }
      }
    }

    return null;
  }

  public static async getLiquidityTokenSnapshot(
    options: GetDexLiquidityTokenDataOptions,
  ): Promise<DexLiquidityTokenSnapshot | null> {
    if (!options.dexConfig.subgraph) {
      return null;
    }

    if (options.dexConfig.version !== DexVersions.univ2 && options.dexConfig.version !== DexVersions.univ3) {
      return null;
    }

    const metaBlock = await tryQueryBlockMeta(options.dexConfig.subgraph.endpoint);
    const toBlock = options.toBlock > metaBlock ? metaBlock : options.toBlock;

    // retry 3 times
    let retryTime = 0;

    const filters = options.dexConfig.subgraph.filters;
    const tokenDataQuery = `
      {
        dataPriceFrom: bundles(first: 1, block: {number: ${options.fromBlock}}) {
          ${filters.bundles.baseTokenPrice}
        }
        
        dataFrom: tokens(first: 1, where: {id: "${options.token.address}"}, block: {number: ${options.fromBlock}}) {
          ${Object.values(filters.tokens)}
        }
        
        dataTo: tokens(first: 1, where: {id: "${options.token.address}"}, block: {number: ${toBlock}}) {
          ${Object.values(filters.tokens)}
        }
      }
    `;

    while (retryTime < 3) {
      try {
        const response = await axios.post(
          options.dexConfig.subgraph.endpoint,
          {
            query: tokenDataQuery,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.data.data) {
          const ethPriceFrom = new BigNumber(response.data.data.dataPriceFrom[0][filters.bundles.baseTokenPrice]);

          const dataFrom = response.data.data.dataFrom[0];
          const dataTo = response.data.data.dataTo[0];

          const tokenPrice = new BigNumber(dataFrom[filters.tokens.derivedBase].toString())
            .multipliedBy(ethPriceFrom)
            .toString(10);

          const volumeTradingCumulative = dataTo[filters.tokens.volume].toString();
          const volumeTrading = new BigNumber(dataTo[filters.tokens.volume].toString())
            .minus(new BigNumber(dataFrom[filters.tokens.volume].toString()))
            .toString(10);

          const totalLiquidity = dataTo[filters.tokens.liquidity].toString();

          const numberOfTransactions =
            Number(dataTo[filters.tokens.txCount]) - Number(dataFrom[filters.tokens.txCount]);
          const numberOfTransactionsCumulative = Number(dataTo[filters.tokens.txCount]);

          let feesTrading = '0';
          if (options.dexConfig.version === DexVersions.univ2) {
            feesTrading = new BigNumber(volumeTrading)
              .multipliedBy(
                new BigNumber(
                  options.dexConfig.subgraph.fixedFeePercentage ? options.dexConfig.subgraph.fixedFeePercentage : 0.3,
                ),
              )
              .dividedBy(100)
              .toString(10);
          } else if (options.dexConfig.version === DexVersions.univ3) {
            if (filters.tokens.fees) {
              const feesUsdFrom = new BigNumber(dataFrom[filters.tokens.fees.toString()].toString());
              const feesUsdTo = new BigNumber(dataTo[filters.tokens.fees].toString());
              const feesUsd = feesUsdTo.minus(feesUsdFrom);
              feesTrading = tokenPrice === '0' ? '0' : feesUsd.dividedBy(new BigNumber(tokenPrice)).toString(10);
            }
          }

          return {
            ...options.token,
            protocol: options.dexConfig.protocol,
            version: options.dexConfig.version,

            tokenPrice: tokenPrice,
            totalLiquidity: totalLiquidity,
            feesTrading: feesTrading,
            volumeTrading: volumeTrading,
            volumeTradingCumulative: volumeTradingCumulative,
            numberOfTransactions: numberOfTransactions,
            numberOfTransactionsCumulative: numberOfTransactionsCumulative,
          };
        }
        return null;
      } catch (e: any) {
        retryTime += 1;
        await sleep(10);
      }
    }

    return null;
  }

  public static async getTopLiquidityPoolForToken(
    options: GetDexLiquidityTokenDataOptions,
  ): Promise<Array<DexLiquidityPoolMetadata>> {
    const pools: Array<DexLiquidityPoolMetadata> = [];

    if (!options.dexConfig.subgraph) {
      return pools;
    }

    if (options.dexConfig.version !== DexVersions.univ2 && options.dexConfig.version !== DexVersions.univ3) {
      return pools;
    }

    const filters = options.dexConfig.subgraph.filters;

    do {
      const poolMetaQuery = `
        {
          token0Pools: ${filters.pools.pools}(first: 100, where: {token0: "${
            options.token.address
          }"}, block: {number: ${options.fromBlock}}, orderBy: ${filters.pools.reserve0}, orderDirection: desc) {
            id
            token0 {
              id
              symbol
              decimals
            }
            token1 {
              id
              symbol
              decimals
            }
            ${filters.pools.feesTiger ? filters.pools.feesTiger : ''}
          }
          token1Pools: ${filters.pools.pools}(first: 100, where: {token1: "${
            options.token.address
          }"}, block: {number: ${options.fromBlock}}, orderBy: ${filters.pools.reserve1}, orderDirection: desc) {
            id
            token0 {
              id
              symbol
              decimals
            }
            token1 {
              id
              symbol
              decimals
            }
            ${filters.pools.feesTiger ? filters.pools.feesTiger : ''}
          }
        }
      `;

      try {
        const metadataResponse = await axios.post(
          options.dexConfig.subgraph.endpoint,
          {
            query: poolMetaQuery,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        if (metadataResponse.data.data) {
          const poolMetadata: Array<DexLiquidityPoolMetadata> = [];
          const rawPools: Array<any> = metadataResponse.data.data.token0Pools.concat(
            metadataResponse.data.data.token1Pools,
          );
          for (const rawPool of rawPools) {
            let feePercentage = 0.3;
            if (options.dexConfig.version === DexVersions.univ2 && options.dexConfig.subgraph.fixedFeePercentage) {
              feePercentage = options.dexConfig.subgraph.fixedFeePercentage;
            } else if (options.dexConfig.version === DexVersions.univ3) {
              if (filters.pools.feesTiger) {
                feePercentage = (Number(rawPool[filters.pools.feesTiger]) / 1000000) * 100;
              }
            }

            poolMetadata.push({
              protocol: options.dexConfig.protocol,
              version: options.dexConfig.version,
              address: normalizeAddress(rawPool.id),
              tokens: [
                {
                  chain: options.dexConfig.chain,
                  symbol: rawPool.token0.symbol,
                  address: normalizeAddress(rawPool.token0.id),
                  decimals: Number(rawPool.token0.decimals),
                },
                {
                  chain: options.dexConfig.chain,
                  symbol: rawPool.token1.symbol,
                  address: normalizeAddress(rawPool.token1.id),
                  decimals: Number(rawPool.token1.decimals),
                },
              ],
              feesPercentage: feePercentage,
            });
          }

          return poolMetadata;
        }
      } catch (e: any) {}
    } while (pools.length === 0);

    return pools;
  }

  public static async getLiquidityPoolSnapshot(
    poolMetadata: DexLiquidityPoolMetadata,
    options: GetDexLiquidityTokenDataOptions,
  ): Promise<DexLiquidityPoolSnapshot | null> {
    if (!options.dexConfig.subgraph) {
      return null;
    }

    if (options.dexConfig.version !== DexVersions.univ2 && options.dexConfig.version !== DexVersions.univ3) {
      return null;
    }

    const filters = options.dexConfig.subgraph.filters;

    const poolDataQuery = `
        {
          basePrice: bundles(first: 1, block: {number: ${options.toBlock}}) {
            ${filters.bundles.baseTokenPrice}
          }
          
          dataFrom: ${filters.pools.pool}(id: "${poolMetadata.address}", block: {number: ${options.fromBlock}}) {
            token0 {
              ${filters.tokens.derivedBase}
            }
            token1 {
              ${filters.tokens.derivedBase}
            }
            ${filters.pools.volume}
            ${filters.pools.liquidity}
            ${filters.pools.txCount}
            ${filters.pools.reserve0}
            ${filters.pools.reserve1}
            ${filters.pools.fees ? filters.pools.fees : ''}
          }
          
          dataTo: ${filters.pools.pool}(id: "${poolMetadata.address}", block: {number: ${options.toBlock}}) {
            token0 {
              ${filters.tokens.derivedBase}
            }
            token1 {
              ${filters.tokens.derivedBase}
            }
            ${filters.pools.volume}
            ${filters.pools.liquidity}
            ${filters.pools.txCount}
            ${filters.pools.reserve0}
            ${filters.pools.reserve1}
            ${filters.pools.fees ? filters.pools.fees : ''}
          }
          
        }
      `;

    try {
      const response = await axios.post(
        options.dexConfig.subgraph.endpoint,
        {
          query: poolDataQuery,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.data) {
        const basePrice = new BigNumber(response.data.data.basePrice[0][filters.bundles.baseTokenPrice]);

        const dataFrom = response.data.data.dataFrom;
        const dataTo = response.data.data.dataTo;
        if (dataFrom && dataTo) {
          const tokenPrice0 = new BigNumber(dataTo.token0[filters.tokens.derivedBase]).multipliedBy(basePrice);
          const tokenPrice1 = new BigNumber(dataTo.token1[filters.tokens.derivedBase]).multipliedBy(basePrice);

          const volumeFrom = new BigNumber(dataFrom[filters.pools.volume].toString());
          const volumeTo = new BigNumber(dataTo[filters.pools.volume].toString());
          const txCountFrom = Number(dataFrom[filters.pools.txCount]);
          const txCountTo = Number(dataTo[filters.pools.txCount]);

          const liquidity = new BigNumber(dataTo[filters.pools.liquidity].toString());
          const reserve0 = new BigNumber(dataTo[filters.pools.reserve0].toString());
          const reserve1 = new BigNumber(dataTo[filters.pools.reserve1].toString());

          let feesTrading = '0';
          if (options.dexConfig.version === DexVersions.univ2) {
            feesTrading = volumeTo
              .minus(volumeFrom)
              .multipliedBy(
                new BigNumber(
                  options.dexConfig.subgraph.fixedFeePercentage ? options.dexConfig.subgraph.fixedFeePercentage : 0.3,
                ),
              )
              .dividedBy(100)
              .toString(10);
          } else if (options.dexConfig.version === DexVersions.univ3) {
            if (filters.pools.fees) {
              const feesUsdFrom = new BigNumber(dataFrom[filters.pools.fees.toString()].toString());
              const feesUsdTo = new BigNumber(dataTo[filters.pools.fees].toString());
              feesTrading = feesUsdTo.minus(feesUsdFrom).toString(10);
            }
          }

          return {
            ...poolMetadata,

            tokenPrices: [tokenPrice0.toString(10), tokenPrice1.toString(10)],
            tokenBalances: [reserve0.toString(10), reserve1.toString(10)],
            totalLiquidity: liquidity.toString(10),
            feesTrading: feesTrading,
            volumeTrading: volumeTo.minus(volumeFrom).toString(10),
            volumeTradingCumulative: volumeTo.toString(10),
            numberOfTransactions: txCountTo - txCountFrom,
            numberOfTransactionsCumulative: txCountTo,
          };
        }
      }
    } catch (e: any) {
      console.log(e);
    }

    return null;
  }
}
