import { DataMetrics, IsolatedLendingMarketConfig, LendingMarketVersions, ProtocolConfig } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';

export interface MorphoProtocolConfig extends ProtocolConfig {
  configs: Array<IsolatedLendingMarketConfig>;
}

export const MorphoConfigs: MorphoProtocolConfig = {
  protocol: ProtocolNames.morpho,
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.morpho,
      metric: DataMetrics.isolatedLending,
      birthday: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
      birthblock: 18883124,
      version: LendingMarketVersions.isolated.morpho,
      address: '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb',
    },
    {
      chain: ChainNames.base,
      protocol: ProtocolNames.morpho,
      metric: DataMetrics.isolatedLending,
      birthday: 1714780800, // Sat May 04 2024 00:00:00 GMT+0000
      birthblock: 13977148,
      version: LendingMarketVersions.isolated.morpho,
      address: '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb',
    },
  ],
};
