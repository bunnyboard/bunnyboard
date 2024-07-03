import { DataMetrics } from '../../types/configs';
import cTokenMappings from '../data/statics/cTokenMappings.json';
import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig, formatCompoundLendingMarketConfig } from './compound';

export const RhoConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.rho,
  configs: formatCompoundLendingMarketConfig([
    {
      chain: ChainNames.scroll,
      protocol: ProtocolNames.rho,
      version: 'compound',
      metric: DataMetrics.crossLending,
      birthday: 1704844800, // Wed Jan 10 2024 00:00:00 GMT+0000
      address: '0x8a67ab98a291d1aea2e1eb0a79ae4ab7f2d76041',
      governanceToken: null,
      underlying: cTokenMappings,
    },
  ]),
};
