import { DataMetrics } from '../../types/configs';
import { CompoundProtocolConfig, formatCompoundLendingMarketConfig } from './compound';

export const SonneConfigs: CompoundProtocolConfig = {
  protocol: 'sonne',
  configs: formatCompoundLendingMarketConfig([
    {
      chain: 'optimism',
      protocol: 'sonne',
      version: 'compound',
      birthday: 1664409600, // Thu Sep 29 2022 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: '0x60CF091cD3f50420d50fD7f707414d0DF4751C58',
      governanceToken: {
        chain: 'optimism',
        symbol: 'SONNE',
        decimals: 18,
        address: '0x1db2466d9f5e10d7090e7152b68d62703a2245f0',
      },
      underlying: {},
    },
    {
      chain: 'base',
      protocol: 'sonne',
      version: 'compound',
      birthday: 1691798400, // Sat Aug 12 2023 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: '0x1DB2466d9F5e10D7090E7152B68d62703a2245F0',
      governanceToken: null,
      underlying: {},
    },
  ]),
};
