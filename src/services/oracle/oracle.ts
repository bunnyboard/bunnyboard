import BigNumber from 'bignumber.js';

import EnvConfig from '../../configs/envConfig';
import { OracleConfigs } from '../../configs/oracles/configs';
import { OracleCurrencyBaseConfigs } from '../../configs/oracles/currency';
import logger from '../../lib/logger';
import { queryBlockNumberAtTimestamp } from '../../lib/subsgraph';
import { normalizeAddress, sleep } from '../../lib/utils';
import {
  OracleCurrencyBase,
  OracleSourceBearingToken,
  OracleSourceChainlink,
  OracleSourceUniv2,
  OracleSourceUniv3,
} from '../../types/configs';
import { CachingService } from '../caching/caching';
import { IDatabaseService } from '../database/domains';
import { GetTokenPriceOptions, IOracleService } from './domains';
import ChainlinkLibs from './libs/chainlink';
import CoingeckoLibs from './libs/coingecko';
import OracleLibs from './libs/custom';
import UniswapLibs from './libs/uniswap';

export default class OracleService extends CachingService implements IOracleService {
  public readonly name: string = 'oracle';
  public readonly database: IDatabaseService | null;

  constructor(database: IDatabaseService | null) {
    super();

    this.database = database;
  }

  // get price from database if any
  private async getPriceFromDatabase(options: GetTokenPriceOptions): Promise<string | null> {
    if (this.database) {
      const document = await this.database.find({
        collection: EnvConfig.mongodb.collections.tokenPrices,
        query: {
          chain: options.chain,
          address: normalizeAddress(options.address),
          timestamp: options.timestamp,
        },
      });
      if (document) {
        return document.priceUsd.toString();
      }
    }

    return null;
  }

  // get price from database if any
  private async savePriceToDatabase(options: GetTokenPriceOptions, priceUsd: string): Promise<void> {
    if (this.database) {
      await this.database.update({
        collection: EnvConfig.mongodb.collections.tokenPrices,
        keys: {
          chain: options.chain,
          address: normalizeAddress(options.address),
          timestamp: options.timestamp,
        },
        updates: {
          chain: options.chain,
          address: normalizeAddress(options.address),
          timestamp: options.timestamp,
          priceUsd: priceUsd,
        },
        upsert: true,
      });
    }
  }

  public async getTokenPriceSource(
    source: OracleSourceChainlink | OracleSourceUniv2 | OracleSourceUniv3 | OracleSourceBearingToken,
    timestamp: number,
  ): Promise<string | null> {
    const sourceCachingKey = `source:${source.type}:${source.chain}:${source.address}:${timestamp}`;
    const cachingPrice = await this.getCachingData(sourceCachingKey);
    if (cachingPrice) {
      return cachingPrice;
    }

    let blockNumber = 0;
    do {
      blockNumber = await queryBlockNumberAtTimestamp(EnvConfig.blockchains[source.chain].blockSubgraph, timestamp);
      if (blockNumber === 0) {
        await sleep(5);
      }
    } while (blockNumber === 0);

    switch (source.type) {
      case 'chainlink': {
        const answer = await ChainlinkLibs.getPriceFromAggregator(source as OracleSourceChainlink, blockNumber);
        if (answer) {
          await this.setCachingData(sourceCachingKey, answer);
          return answer;
        }

        break;
      }
      case 'univ2': {
        const answer = await UniswapLibs.getPricePool2(source as OracleSourceUniv2, blockNumber);
        if (answer) {
          await this.setCachingData(sourceCachingKey, answer);
          return answer;
        }

        break;
      }
      case 'univ3': {
        const answer = await UniswapLibs.getPricePool2(source as OracleSourceUniv3, blockNumber);
        if (answer) {
          await this.setCachingData(sourceCachingKey, answer);
          return answer;
        }

        break;
      }
      case 'savingDai': {
        const answer = await OracleLibs.getTokenPrice(source as OracleSourceBearingToken, blockNumber);
        if (answer) {
          await this.setCachingData(sourceCachingKey, answer);
          return answer;
        }

        break;
      }
    }

    return null;
  }

  private async getTokenCurrencyBasePriceUsd(currency: OracleCurrencyBase, timestamp: number): Promise<string | null> {
    if (OracleCurrencyBaseConfigs[currency]) {
      for (const source of OracleCurrencyBaseConfigs[currency].sources) {
        const priceUsd = await this.getTokenPriceSource(source, timestamp);
        if (priceUsd) {
          return priceUsd;
        }
      }
    }

    return null;
  }

  public async getTokenPriceUsd(options: GetTokenPriceOptions): Promise<string | null> {
    const priceFromDatabase = await this.getPriceFromDatabase(options);
    if (priceFromDatabase) {
      return priceFromDatabase;
    }

    let returnPrice = null;

    if (OracleConfigs[options.chain] && OracleConfigs[options.chain][options.address]) {
      const config = OracleConfigs[options.chain][options.address];

      const cachingKey = `${options.chain}:${options.address}:${options.timestamp}`;
      const cachingPriceUsd = await this.getCachingData(cachingKey);
      if (cachingPriceUsd) {
        returnPrice = cachingPriceUsd;
      }

      for (const source of config.sources) {
        const priceFirst = await this.getTokenPriceSource(source, options.timestamp);
        if (priceFirst) {
          let priceUsd: string | null = null;

          if (config.currency === 'usd') {
            priceUsd = priceFirst;
          } else {
            const currencyBasePriceUsd = await this.getTokenCurrencyBasePriceUsd(config.currency, options.timestamp);
            if (currencyBasePriceUsd) {
              priceUsd = new BigNumber(priceFirst).multipliedBy(new BigNumber(currencyBasePriceUsd)).toString(10);
            }
          }

          if (priceUsd) {
            await this.setCachingData(cachingKey, priceUsd);

            returnPrice = priceUsd;
          }
        }
      }

      if (config.coingeckoId) {
        const priceUsd = await CoingeckoLibs.getTokenPriceUsd(config.coingeckoId, options.timestamp);
        if (priceUsd) {
          await this.setCachingData(cachingKey, priceUsd);

          returnPrice = priceUsd;
        }
      }
    }

    if (returnPrice !== null) {
      await this.savePriceToDatabase(options, returnPrice);
    } else {
      logger.warn('failed to get token price', {
        service: this.name,
        chain: options.chain,
        token: options.address,
        timestamp: options.timestamp,
      });
    }

    return returnPrice;
  }
}
