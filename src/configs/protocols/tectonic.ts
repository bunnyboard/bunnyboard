import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import cTokenMappings from '../data/statics/cTokenMappings.json';
import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig, formatCompoundLendingMarketConfig } from './compound';

export const TectonicConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.tectonic,
  configs: formatCompoundLendingMarketConfig([
    {
      chain: ChainNames.cronos,
      protocol: ProtocolNames.tectonic,
      version: LendingMarketVersions.cross.compound,
      birthday: 1639612800, // Thu Dec 16 2021 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: '0xb3831584acb95ed9ccb0c11f677b5ad01deaeec0',
      governanceToken: null,
      underlying: cTokenMappings,
    },
  ]),
};
