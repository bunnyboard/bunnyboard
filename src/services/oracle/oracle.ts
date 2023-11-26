import BigNumber from 'bignumber.js';

import EnvConfig from '../../configs/envConfig';
import { OracleConfigs } from '../../configs/oracles/configs';
import { OracleCurrencyBaseConfigs } from '../../configs/oracles/currency';
import { queryBlockNumberAtTimestamp } from '../../lib/subsgraph';
import { OracleCurrencyBase, OracleSourceChainlink, OracleSourceUniv2 } from '../../types/configs';
import { CachingService } from '../caching/caching';
import { IDatabaseService } from '../database/domains';
import { GetTokenPriceOptions, IOracleService } from './domains';
import ChainlinkLibs from './libs/chainlink';

export default class OracleService extends CachingService implements IOracleService {
  public readonly name: string = 'oracle';
  public readonly database: IDatabaseService;

  constructor(database: IDatabaseService) {
    super();

    this.database = database;
  }

  public async getTokenPriceSource(
    source: OracleSourceChainlink | OracleSourceUniv2,
    blockNumber: number,
  ): Promise<string | null> {
    switch (source.type) {
      case 'chainlink': {
        const answer = await ChainlinkLibs.getPriceFromAggregator(source as OracleSourceChainlink, blockNumber);
        if (answer) {
          return answer;
        }

        break;
      }
    }

    return '0';
  }

  private async getTokenCurrencyBasePriceUsd(currency: OracleCurrencyBase, timestamp: number): Promise<string | null> {
    if (OracleCurrencyBaseConfigs[currency]) {
      for (const source of OracleCurrencyBaseConfigs[currency].sources) {
        const blockNumber = await queryBlockNumberAtTimestamp(
          EnvConfig.blockchains[source.chain].blockSubgraph,
          timestamp,
        );
        const priceUsd = await this.getTokenPriceSource(source, blockNumber);
        if (priceUsd) {
          return priceUsd;
        }
      }
    }

    return null;
  }

  public async getTokenPriceUsd(options: GetTokenPriceOptions): Promise<string | null> {
    if (OracleConfigs[options.chain] && OracleConfigs[options.chain][options.address]) {
      const config = OracleConfigs[options.chain][options.address];

      const cachingKey = `${options.chain}:${options.address}:${options.timestamp}`;
      const cachingPriceUsd = await this.getCachingData(cachingKey);
      if (cachingPriceUsd) {
        return cachingPriceUsd;
      }

      for (const source of config.sources) {
        const blockNumber = await queryBlockNumberAtTimestamp(
          EnvConfig.blockchains[source.chain].blockSubgraph,
          options.timestamp,
        );

        const priceFirst = await this.getTokenPriceSource(source, blockNumber);
        if (priceFirst) {
          let priceUsd: string | null = null;

          if (config.currency === 'usd') {
            priceUsd = priceFirst;
          } else {
            const currencyBasePriceUsd = await this.getTokenCurrencyBasePriceUsd(config.currency, blockNumber);
            if (currencyBasePriceUsd) {
              priceUsd = new BigNumber(priceFirst).multipliedBy(new BigNumber(currencyBasePriceUsd)).toString(10);
            }
          }

          if (priceUsd) {
            await this.setCachingData(cachingKey, priceUsd);

            return priceUsd;
          }
        }
      }
    }

    return null;
  }
}
