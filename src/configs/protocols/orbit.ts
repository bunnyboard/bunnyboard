import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import cTokenMappings from '../data/statics/cTokenMappings.json';
import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig, formatCompoundLendingMarketConfig } from './compound';

export const OrbitConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.orbit,
  configs: formatCompoundLendingMarketConfig([
    {
      chain: ChainNames.blast,
      protocol: ProtocolNames.orbit,
      version: LendingMarketVersions.cross.compound,
      birthday: 1709251200, // Fri Mar 01 2024 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: '0x1E18C3cb491D908241D0db14b081B51be7B6e652',
      governanceToken: null,
      underlying: cTokenMappings,
      blacklists: {
        '0xf92996ddc677a8dcb032ac5fe62bbf00f92ae2ec': true,
        '0xd847b486fe612c51900f1da1a045741820dd5fa0': true,
      },
    },
    {
      chain: ChainNames.blast,
      protocol: ProtocolNames.orbit,
      version: LendingMarketVersions.cross.compound,
      birthday: 1712275200, // Fri Apr 05 2024 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: '0x273683CA19D9CF827628EE216E4a9604EfB077A3',
      governanceToken: null,
      underlying: cTokenMappings,
      blacklists: {
        '0xf92996ddc677a8dcb032ac5fe62bbf00f92ae2ec': true,
        '0xd847b486fe612c51900f1da1a045741820dd5fa0': true,
      },
    },
  ]),
};
