import BigNumber from 'bignumber.js';

import { OracleConfigs } from '../../configs/oracles/configs';
import { OracleCurrencyBaseConfigs } from '../../configs/oracles/currency';
import logger from '../../lib/logger';
import { normalizeAddress } from '../../lib/utils';
import ChainlinkLibs from '../../modules/libs/chainlink';
import CurveLibs from '../../modules/libs/curve';
import OracleLibs from '../../modules/libs/custom';
import UniswapLibs from '../../modules/libs/uniswap';
import {
  OracleCurrencyBase,
  OracleSourceChainlink,
  OracleSourceCurveMetaPool,
  OracleSourceMakerRwaPip,
  OracleSourceOffchain,
  OracleSourcePool2,
  OracleSourceSavingDai,
  OracleTypes,
} from '../../types/oracles';
import BlockchainService from '../blockchains/blockchain';
import { CachingService } from '../caching/caching';
import { getTokenPriceFromBinance } from './binance';
import { GetTokenPriceOptions, IOracleService } from './domains';

export default class OracleService extends CachingService implements IOracleService {
  public readonly name: string = 'oracle';

  constructor() {
    super();
  }

  public async getTokenPriceSource(
    source:
      | OracleSourceChainlink
      | OracleSourcePool2
      | OracleSourceSavingDai
      | OracleSourceMakerRwaPip
      | OracleSourceCurveMetaPool,
    timestamp: number,
  ): Promise<string | null> {
    const sourceCachingKey = `source:${source.type}:${source.chain}:${source.address}:${
      source.type === OracleTypes.makerRwaPip ? (source as OracleSourceMakerRwaPip).ilk : 'any'
    }:${timestamp}`;
    const cachingPrice = await this.getCachingData(sourceCachingKey);
    if (cachingPrice) {
      return cachingPrice;
    }

    const blockchain = new BlockchainService();
    const blockNumber = await blockchain.tryGetBlockNumberAtTimestamp(source.chain, timestamp);

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
        const answer = await UniswapLibs.getPricePool2(source as OracleSourcePool2, blockNumber);
        if (answer) {
          await this.setCachingData(sourceCachingKey, answer);
          return answer;
        }

        break;
      }
      case 'univ3': {
        const answer = await UniswapLibs.getPricePool2(source as OracleSourcePool2, blockNumber);
        if (answer) {
          await this.setCachingData(sourceCachingKey, answer);
          return answer;
        }

        break;
      }
      case 'savingDai': {
        const answer = await OracleLibs.getTokenPrice(source as OracleSourceSavingDai, blockNumber);
        if (answer) {
          await this.setCachingData(sourceCachingKey, answer);
          return answer;
        }

        break;
      }
      case 'makerRwaPip': {
        const answer = await OracleLibs.getTokenPrice(source as OracleSourceMakerRwaPip, blockNumber);
        if (answer) {
          await this.setCachingData(sourceCachingKey, answer);
          return answer;
        }

        break;
      }
      case 'curveMetaPool': {
        const answer = await CurveLibs.getMetaPoolPrice({
          config: source as OracleSourceCurveMetaPool,
          blockNumber: blockNumber,
        });
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
    let returnPrice = null;
    options.address = normalizeAddress(options.address);

    const cachingKey = `${options.chain}:${options.address}:${options.timestamp}`;
    const cachingPriceUsd = await this.getCachingData(cachingKey);
    if (cachingPriceUsd) {
      return cachingPriceUsd;
    }

    let priceUsd: string | null = null;

    if (OracleConfigs[options.chain] && OracleConfigs[options.chain][options.address]) {
      for (const source of OracleConfigs[options.chain][options.address].sources) {
        const priceFirst = await this.getTokenPriceSource(source, options.timestamp);
        if (priceFirst) {
          if (source.currency === 'usd' || OracleConfigs[options.chain][options.address].currency === 'usd') {
            priceUsd = priceFirst;
          } else {
            const currencyBasePriceUsd = await this.getTokenCurrencyBasePriceUsd(
              OracleConfigs[options.chain][options.address].currency,
              options.timestamp,
            );
            if (currencyBasePriceUsd) {
              priceUsd = new BigNumber(priceFirst).multipliedBy(new BigNumber(currencyBasePriceUsd)).toString(10);
            }
          }

          if (priceUsd && priceUsd !== '0') {
            await this.setCachingData(cachingKey, priceUsd);

            returnPrice = priceUsd;

            break;
          }
        }
      }

      if ((returnPrice === null || returnPrice === '0') && OracleConfigs[options.chain][options.address].stablecoin) {
        return '1';
      }

      if (
        (returnPrice === null || returnPrice === '0') &&
        OracleConfigs[options.chain][options.address].offchainSources
      ) {
        const sources = OracleConfigs[options.chain][options.address].offchainSources as Array<OracleSourceOffchain>;
        for (const offchainSource of sources) {
          if (offchainSource.source === 'binance') {
            returnPrice = await getTokenPriceFromBinance(offchainSource, options.timestamp);
          }
        }
      }
    }

    if (returnPrice === null) {
      logger.warn('failed to get token price', {
        service: this.name,
        chain: options.chain,
        token: options.address,
        time: options.timestamp,
      });
    }

    await this.setCachingData(cachingKey, priceUsd);

    return returnPrice;
  }
}
