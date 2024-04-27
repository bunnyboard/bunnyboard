import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import cTokenMappings from '../data/statics/cTokenMappings.json';
import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig, formatCompoundLendingMarketConfig } from './compound';

export const MendiConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.mendi,
  configs: formatCompoundLendingMarketConfig([
    {
      chain: ChainNames.linea,
      protocol: ProtocolNames.mendi,
      version: LendingMarketVersions.cross.compound,
      birthday: 1692316800, // Fri Aug 18 2023 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: '0x1b4d3b0421dDc1eB216D230Bc01527422Fb93103',
      governanceToken: null,
      underlying: cTokenMappings,
    },
  ]),
};
