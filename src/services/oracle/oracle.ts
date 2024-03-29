import BigNumber from 'bignumber.js';

import Erc20Abi from '../../configs/abi/ERC20.json';
import { OracleConfigs } from '../../configs/oracles/configs';
import { OracleCurrencyBaseConfigs } from '../../configs/oracles/currency';
import logger from '../../lib/logger';
import { normalizeAddress } from '../../lib/utils';
import ChainlinkLibs from '../../modules/libs/chainlink';
import OracleLibs from '../../modules/libs/custom';
import UniswapLibs from '../../modules/libs/uniswap';
import {
  OracleCurrencyBase,
  OracleSourceBearingToken,
  OracleSourceChainlink,
  OracleSourceCompoundOracle,
  OracleSourceMakerRwaPip,
  OracleSourceUniv2,
  OracleSourceUniv3,
} from '../../types/oracles';
import BlockchainService from '../blockchains/blockchain';
import { CachingService } from '../caching/caching';
import { GetTokenPriceOptions, GetUniv2TokenPriceOptions, IOracleService } from './domains';

export default class OracleService extends CachingService implements IOracleService {
  public readonly name: string = 'oracle';

  constructor() {
    super();
  }

  public async getTokenPriceSource(
    source:
      | OracleSourceChainlink
      | OracleSourceUniv2
      | OracleSourceUniv3
      | OracleSourceBearingToken
      | OracleSourceCompoundOracle
      | OracleSourceMakerRwaPip,
    timestamp: number,
  ): Promise<string | null> {
    const sourceCachingKey = `source:${source.type}:${source.chain}:${source.address}:${timestamp}`;
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
      case 'makerRwaPip': {
        const answer = await OracleLibs.getTokenPrice(source as OracleSourceMakerRwaPip, blockNumber);
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

    if (OracleConfigs[options.chain] && OracleConfigs[options.chain][options.address]) {
      const config = OracleConfigs[options.chain][options.address];

      const cachingKey = `${options.chain}:${options.address}:${options.timestamp}`;
      const cachingPriceUsd = await this.getCachingData(cachingKey);
      if (cachingPriceUsd) {
        return cachingPriceUsd;
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

          if (priceUsd && priceUsd !== '0') {
            await this.setCachingData(cachingKey, priceUsd);

            returnPrice = priceUsd;
          }
        }
      }

      // if (!returnPrice && config.coingeckoId) {
      //   const priceUsd = await CoingeckoLibs.getTokenPriceUsd(config.coingeckoId, options.timestamp);
      //   if (priceUsd) {
      //     await this.setCachingData(cachingKey, priceUsd);
      //
      //     returnPrice = priceUsd;
      //   }
      // }

      if ((returnPrice === null || returnPrice === '0') && OracleConfigs[options.chain][options.address].stablecoin) {
        return '1';
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

    return returnPrice;
  }

  public async getUniv2TokenPriceUsd(options: GetUniv2TokenPriceOptions): Promise<string | null> {
    let returnPrice = null;

    const cachingKey = `${options.pool2.chain}:${options.pool2.address}:${options.timestamp}`;
    const priceFromCaching = await this.getCachingData(cachingKey);
    if (priceFromCaching) {
      return priceFromCaching;
    }

    // not a lp pool
    if (options.pool2.tokens.length !== 2) {
      return null;
    }

    const blockchain = new BlockchainService();

    const blockNumber = await blockchain.tryGetBlockNumberAtTimestamp(options.pool2.chain, options.timestamp);
    const lpSupply = await blockchain.readContract({
      chain: options.pool2.chain,
      abi: Erc20Abi,
      target: options.pool2.address,
      method: 'totalSupply',
      params: [],
      blockNumber: blockNumber,
    });

    if (lpSupply && new BigNumber(lpSupply.toString()).gt(0)) {
      let token0Price = null;
      let token1Price = null;
      if (OracleConfigs[options.pool2.chain] && OracleConfigs[options.pool2.chain][options.pool2.tokens[0].address]) {
        token0Price = await this.getTokenPriceUsd({
          chain: options.pool2.chain,
          address: options.pool2.tokens[0].address,
          timestamp: options.timestamp,
        });
      } else if (
        OracleConfigs[options.pool2.chain] &&
        OracleConfigs[options.pool2.chain][options.pool2.tokens[0].address]
      ) {
        token1Price = await this.getTokenPriceUsd({
          chain: options.pool2.chain,
          address: options.pool2.tokens[1].address,
          timestamp: options.timestamp,
        });
      }

      if (token0Price || token1Price) {
        if (token0Price) {
          const token0Balance = await blockchain.readContract({
            chain: options.pool2.chain,
            abi: Erc20Abi,
            target: options.pool2.tokens[0].address,
            method: 'balanceOf',
            params: [options.pool2.address],
            blockNumber: blockNumber,
          });

          returnPrice = new BigNumber(token0Balance.toString())
            .multipliedBy(2e18)
            .multipliedBy(new BigNumber(token0Price))
            .dividedBy(new BigNumber(lpSupply.toString()))
            .dividedBy(new BigNumber(10).pow(options.pool2.tokens[0].decimals))
            .toString(10);
        } else if (token1Price) {
          const token1Balance = await blockchain.readContract({
            chain: options.pool2.chain,
            abi: Erc20Abi,
            target: options.pool2.tokens[1].address,
            method: 'balanceOf',
            params: [options.pool2.address],
            blockNumber: blockNumber,
          });
          returnPrice = new BigNumber(token1Balance.toString())
            .multipliedBy(2e18)
            .multipliedBy(new BigNumber(token1Price))
            .dividedBy(new BigNumber(lpSupply.toString()))
            .dividedBy(new BigNumber(10).pow(options.pool2.tokens[1].decimals))
            .toString(10);
        }
      }
    }

    return returnPrice;
  }
}
