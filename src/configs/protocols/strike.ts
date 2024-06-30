import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import cTokenMappings from '../data/statics/cTokenMappings.json';
import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig, formatCompoundLendingMarketConfig } from './compound';

export const StrikeConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.strike,
  configs: formatCompoundLendingMarketConfig([
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.strike,
      version: LendingMarketVersions.cross.compound,
      birthday: 1617062400, // Tue Mar 30 2021 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: '0xe2e17b2cbbf48211fa7eb8a875360e5e39ba2602',
      governanceToken: null,
      underlying: cTokenMappings,
    },
  ]),
};
