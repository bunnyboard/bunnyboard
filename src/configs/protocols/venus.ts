import { DataMetrics } from '../../types/configs';
import { AddressZero } from '../constants';
import { CompoundProtocolConfig, formatCompoundLendingMarketConfig } from './compound';

export const VenusConfigs: CompoundProtocolConfig = {
  protocol: 'venus',
  configs: formatCompoundLendingMarketConfig([
    {
      chain: 'bnbchain',
      protocol: 'venus',
      type: 'cross',
      version: 'compound',
      metric: DataMetrics.lending,
      birthday: 1606089600, // Mon Nov 23 2020 00:00:00 GMT+0000
      address: '0xfD36E2c2a6789Db23113685031d7F16329158384',
      governanceToken: {
        chain: 'bnbchain',
        symbol: 'XVS',
        decimals: 18,
        address: '0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63',
      },
      underlying: {
        '0xa07c5b74c9b40447a954e1466938b865b6bbea36': {
          chain: 'bnbchain',
          symbol: 'BNB',
          decimals: 18,
          address: AddressZero,
        },
      },
      blacklists: {
        '0xebd0070237a0713e8d94fef1b728d3d993d290ef': true, // CAN
      },
    },
  ]),
};
