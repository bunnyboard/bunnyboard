import { DataMetrics } from '../../types/configs';
import cTokenMappings from '../data/statics/cTokenMappings.json';
import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig, formatCompoundLendingMarketConfig } from './compound';

export const IonicConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.ionic,
  configs: formatCompoundLendingMarketConfig([
    {
      chain: ChainNames.mode,
      protocol: ProtocolNames.ionic,
      version: 'compound',
      metric: DataMetrics.crossLending,
      birthday: 1704844800, // Wed Jan 10 2024 00:00:00 GMT+0000
      address: '0xfb3323e24743caf4add0fdccfb268565c0685556',
      governanceToken: null,
      underlying: cTokenMappings,
    },
  ]),
};
