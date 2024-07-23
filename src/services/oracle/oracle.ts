import BigNumber from 'bignumber.js';

import { OracleConfigs } from '../../configs/oracles/configs';
import { OracleCurrencyBaseConfigs } from '../../configs/oracles/currency';
import logger from '../../lib/logger';
import { formatBigNumberToString, normalizeAddress } from '../../lib/utils';
import ChainlinkLibs from '../../modules/libs/chainlink';
import CurveLibs from '../../modules/libs/curve';
import OracleLibs from '../../modules/libs/custom';
import UniswapLibs from '../../modules/libs/uniswap';
import {
  OracleCurrencyBase,
  OracleSourceChainlink,
  OracleSourceCurvePool,
  OracleSourceMakerRwaPip,
  OracleSourceOffchain,
  OracleSourcePool2,
  OracleSourceSavingDai,
  OracleSourceStakingTokenWrapper,
  OracleTypes,
} from '../../types/oracles';
import BlockchainService from '../blockchains/blockchain';
import { CachingService } from '../caching/caching';
import { getTokenPriceFromBinance } from './binance';
import { GetTokenPriceOptions, IOracleService } from './domains';
import { IBlockchainService } from '../blockchains/domains';
import Erc20Abi from '../../configs/abi/ERC20.json';
import Erc4626Abi from '../../configs/abi/ERC4626.json';
import { OracleTokenBlacklists } from '../../configs/oracles/blacklists';

export default class OracleService extends CachingService implements IOracleService {
  public readonly name: string = 'oracle';
  public readonly blockchain: IBlockchainService | undefined | null;

  constructor(blockchain: IBlockchainService | undefined | null) {
    super();

    this.blockchain = blockchain;
  }

  public getBlockchainService(): IBlockchainService {
    if (this.blockchain) {
      return this.blockchain;
    }

    return new BlockchainService();
  }

  public async getTokenPriceSource(
    source:
      | OracleSourceChainlink
      | OracleSourcePool2
      | OracleSourceSavingDai
      | OracleSourceMakerRwaPip
      | OracleSourceCurvePool
      | OracleSourceStakingTokenWrapper,
    timestamp: number,
  ): Promise<string | null> {
    const sourceCachingKey = `source:${source.type}:${source.chain}:${source.address}:${
      source.type === OracleTypes.makerRwaPip ? (source as OracleSourceMakerRwaPip).ilk : 'any'
    }:${timestamp}`;
    const cachingPrice = await this.getCachingData(sourceCachingKey);
    if (cachingPrice) {
      return cachingPrice;
    }

    const blockchain = this.getBlockchainService();
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
      case 'curveMetaPool':
      case 'curveFactoryPool': {
        const answer = await CurveLibs.getCurvePoolPrice({
          config: source as OracleSourceCurvePool,
          blockNumber: blockNumber,
        });
        if (answer) {
          await this.setCachingData(sourceCachingKey, answer);
          return answer;
        }

        break;
      }
      case 'stakingTokenWrapper': {
        const config = source as OracleSourceStakingTokenWrapper;

        if (config.method === 'balance') {
          const [balance, supply] = await blockchain.multicall({
            chain: source.chain,
            blockNumber: blockNumber,
            calls: [
              {
                abi: Erc20Abi,
                target: config.underlyingToken.address,
                method: 'balanceOf',
                params: [config.address],
              },
              {
                abi: Erc20Abi,
                target: config.address,
                method: 'totalSupply',
                params: [],
              },
            ],
          });
          if (balance && supply !== 0n) {
            return new BigNumber(balance.toString()).dividedBy(new BigNumber(supply.toString())).toString(10);
          }
        } else if (config.method === 'erc4626') {
          const [balance] = await blockchain.multicall({
            chain: source.chain,
            blockNumber: blockNumber,
            calls: [
              {
                abi: Erc4626Abi,
                target: config.address,
                method: 'convertToAssets',
                params: [
                  new BigNumber(1).multipliedBy(new BigNumber(10).pow(config.underlyingToken.decimals)).toString(10),
                ],
              },
            ],
          });
          if (balance) {
            return formatBigNumberToString(balance.toString(10), config.underlyingToken.decimals);
          }
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
    if (OracleTokenBlacklists[options.chain] && OracleTokenBlacklists[options.chain].includes(options.address)) {
      return null;
    }

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
        if (source.type === 'stakingTokenWrapper') {
          const stakingTokenWrapperConfig = source as OracleSourceStakingTokenWrapper;
          const pricePerShare = await this.getTokenPriceSource(source, options.timestamp);
          const underlyingPrice = await this.getTokenPriceUsd({
            chain: stakingTokenWrapperConfig.underlyingToken.chain,
            address: stakingTokenWrapperConfig.underlyingToken.address,
            timestamp: options.timestamp,
          });
          if (pricePerShare && underlyingPrice) {
            returnPrice = new BigNumber(pricePerShare).multipliedBy(new BigNumber(underlyingPrice)).toString(10);
            await this.setCachingData(cachingKey, priceUsd);

            break;
          }
        } else {
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
