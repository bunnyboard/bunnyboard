import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import cTokenMappings from '../data/statics/cTokenMappings.json';
import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig, formatCompoundLendingMarketConfig } from './compound';

export const BenqiConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.benqi,
  configs: formatCompoundLendingMarketConfig([
    {
      chain: ChainNames.avalanche,
      protocol: ProtocolNames.benqi,
      version: LendingMarketVersions.cross.compound,
      metric: DataMetrics.crossLending,
      birthday: 1629331200, // Thu Aug 19 2021 00:00:00 GMT+0000
      address: '0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4',
      governanceToken: null,
      underlying: cTokenMappings,
    },
  ]),
};
