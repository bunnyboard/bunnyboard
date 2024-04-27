import { DataMetrics } from '../../types/configs';
import cTokenMappings from '../data/statics/cTokenMappings.json';
import { CompoundProtocolConfig, formatCompoundLendingMarketConfig } from './compound';

export const VenusConfigs: CompoundProtocolConfig = {
  protocol: 'venus',
  configs: formatCompoundLendingMarketConfig([
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      metric: DataMetrics.crossLending,
      birthday: 1614211200, // Fri Jan 01 2021 00:00:00 GMT+0000
      address: '0xfD36E2c2a6789Db23113685031d7F16329158384',
      governanceToken: {
        chain: 'bnbchain',
        symbol: 'XVS',
        decimals: 18,
        address: '0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63',
      },
      underlying: cTokenMappings,
      blacklists: {
        '0xebd0070237a0713e8d94fef1b728d3d993d290ef': true, // vCAN
        '0x20bff4bbeda07536ff00e073bd8359e5d80d733d': true, // CAN
      },
    },
  ]),
};
