import { OracleConfig, Token } from '../../types/configs';
import ArbitrumTokenList from '../tokenlists/arbitrum.json';
import BaseTokenList from '../tokenlists/base.json';
import EthereumTokenList from '../tokenlists/ethereum.json';
import OptimismTokenList from '../tokenlists/optimism.json';
import { OracleSourceChainlinkList } from './chainlink';

export const OracleCurrencyBaseConfigs: { [key: string]: OracleConfig } = {
  eth: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.ETH_USD],
    coingeckoId: 'ethereum',
  },
  btc: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.BTC_USD],
    coingeckoId: 'bitcoin',
  },
  bnb: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.BNB_USD],
    coingeckoId: 'binancecoin',
  },
  matic: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.MATIC_USD],
  },
  avax: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.AVAX_USD],
  },
  ftm: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.FTM_USD],
  },
};

export const OracleCurrencyBaseLiquidityPoolConfigs: { [key: string]: Array<Token> } = {
  ethereum: [EthereumTokenList.WETH],
  arbitrum: [ArbitrumTokenList.WETH],
  optimism: [OptimismTokenList.WETH],
  base: [BaseTokenList.WETH],
};
