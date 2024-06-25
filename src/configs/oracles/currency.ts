import { OracleConfig } from '../../types/oracles';
import { OffchainOracleSourcesFromBinance } from './binance';
import { OracleSourceChainlinkList } from './chainlink';

export const OracleCurrencyBaseConfigs: { [key: string]: OracleConfig } = {
  eth: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.ETH_USD],
    offchainSources: [OffchainOracleSourcesFromBinance.ETH],
  },
  btc: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.BTC_USD],
  },
  bnb: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.BNB_USD],
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
    currency: 'eth',
    sources: [OracleSourceChainlinkList.FTM_ETH],
  },
  eur: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.EUR_USD],
  },
};
