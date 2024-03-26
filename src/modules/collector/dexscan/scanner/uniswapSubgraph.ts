import BigNumber from 'bignumber.js';

import { TokenList } from '../../../../configs';
import { DexscanMinimumLiquidityUsdToConsider } from '../../../../configs/boards/dexscan';
import { TimeUnits } from '../../../../configs/constants';
import EnvConfig from '../../../../configs/envConfig';
import logger from '../../../../lib/logger';
import { tryQueryBlockMeta, tryQueryBlockNumberAtTimestamp } from '../../../../lib/subsgraph';
import { getTimestamp } from '../../../../lib/utils';
import { DexConfig, Token } from '../../../../types/configs';
import { ContextServices, ContextStorages } from '../../../../types/namespaces';
import UniswapLibs from '../../../libs/uniswap';

export interface UniswapSubgraphOptions {
  storages: ContextStorages;
  services: ContextServices;
  dexConfig: DexConfig;
}

// given an univ2 - univ3 subgraph
// scan tokens and pools and save them into database
export default class UniswapSubgraphScanner {
  public static async scanLiquidityTokens(options: UniswapSubgraphOptions): Promise<void> {
    if (options.dexConfig.subgraph) {
      if (options.dexConfig.version === 'univ2' || options.dexConfig.version === 'univ3') {
        const timestamp = getTimestamp();

        const fromBlock = await tryQueryBlockNumberAtTimestamp(
          EnvConfig.blockchains[options.dexConfig.chain].blockSubgraph,
          timestamp - TimeUnits.SecondsPerDay,
        );
        const toBlock = await tryQueryBlockMeta(options.dexConfig.subgraph.endpoint);

        const tokens: Array<Token> = Object.values(TokenList[options.dexConfig.chain]);

        logger.info('start to update dex liquidity token data', {
          service: 'UniswapSubgraphScanner',
          chain: options.dexConfig.chain,
          protocol: options.dexConfig.protocol,
          tokens: tokens.length,
        });

        for (const token of tokens) {
          const tokenData = await UniswapLibs.getLiquidityTokenSnapshot({
            dexConfig: options.dexConfig,
            token: token,
            fromBlock: fromBlock,
            toBlock: toBlock,
          });
          if (tokenData) {
            await options.storages.database.update({
              collection: EnvConfig.mongodb.collections.dexLiquidityTokenSnapshots.name,
              keys: {
                chain: tokenData.chain,
                protocol: tokenData.protocol,
                address: tokenData.address,
              },
              updates: {
                ...tokenData,
              },
              upsert: true,
            });

            const pools = await UniswapLibs.getTopLiquidityPoolForToken({
              dexConfig: options.dexConfig,
              token: token,
              fromBlock: fromBlock,
              toBlock: toBlock,
            });
            for (const pool of pools) {
              // update only if all tokens in pools are whitelisted
              let shouldGetPoolData = true;
              for (const poolToken of pool.tokens) {
                if (!TokenList[poolToken.chain][poolToken.address]) {
                  shouldGetPoolData = false;
                }
              }

              if (!shouldGetPoolData) {
                continue;
              }

              const poolData = await UniswapLibs.getLiquidityPoolSnapshot(pool, {
                dexConfig: options.dexConfig,
                token: token,
                fromBlock: fromBlock,
                toBlock: toBlock,
              });
              if (poolData && new BigNumber(poolData.totalLiquidityUsd).gt(DexscanMinimumLiquidityUsdToConsider)) {
                await options.storages.database.update({
                  collection: EnvConfig.mongodb.collections.dexLiquidityPoolSnapshots.name,
                  keys: {
                    chain: poolData.chain,
                    protocol: poolData.protocol,
                    address: poolData.address,
                  },
                  updates: {
                    ...poolData,
                  },
                  upsert: true,
                });
                logger.debug('update dex liquidity pool data', {
                  service: 'UniswapSubgraphScanner',
                  chain: options.dexConfig.chain,
                  protocol: options.dexConfig.protocol,
                  pool: `${poolData.tokens[0].symbol}:${poolData.tokens[1].symbol}`,
                });
              }
            }

            logger.info('update dex liquidity token data', {
              service: 'UniswapSubgraphScanner',
              chain: options.dexConfig.chain,
              protocol: options.dexConfig.protocol,
              token: `${token.symbol}:${token.address}`,
            });
          } else {
            logger.warn('ignored to update dex liquidity token data', {
              service: 'UniswapSubgraphScanner',
              chain: options.dexConfig.chain,
              protocol: options.dexConfig.protocol,
              token: `${token.symbol}:${token.address}`,
            });
          }
        }
      }
    }
  }
}
