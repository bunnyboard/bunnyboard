import { OracleConfig } from '../../types/configs';
import { OracleSourceChainlinkList } from './chainlink';

export const OracleCurrencyBaseConfigs: { [key: string]: OracleConfig } = {
  eth: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.ethereum.ETH_USD],
    coingeckoId: 'ethereum',
  },
};
