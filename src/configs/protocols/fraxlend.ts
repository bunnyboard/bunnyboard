import { DataMetrics, IsolatedLendingMarketConfig, LendingMarketVersions, ProtocolConfig } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';

export interface FraxlendLendingConfig extends IsolatedLendingMarketConfig {
  address: string; // factory - pair deployer
  fraxlendPairVersion: 1 | 2;
  blacklists: Array<string>;
}

export interface FraxlendProtocolConfig extends ProtocolConfig {
  configs: Array<FraxlendLendingConfig>;
}

export const FraxlendConfigs: FraxlendProtocolConfig = {
  protocol: ProtocolNames.fraxlend,
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.fraxlend,
      metric: DataMetrics.isolatedLending,
      version: LendingMarketVersions.isolated.fraxlend,
      birthday: 1662076800, // Fri Sep 02 2022 00:00:00 GMT+0000
      fraxlendPairVersion: 1,
      address: '0x5d6e79bcf90140585ce88c7119b7e43caaa67044',
      blacklists: [],
    },
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.fraxlend,
      metric: DataMetrics.isolatedLending,
      version: LendingMarketVersions.isolated.fraxlend,
      birthday: 1675900800, // Thu Feb 09 2023 00:00:00 GMT+0000
      fraxlendPairVersion: 2,
      address: '0x7ab788d0483551428f2291232477f1818952998c',
      blacklists: [],
    },
  ],
};
