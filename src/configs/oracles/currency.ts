import { OracleConfig } from '../../types/configs';
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
