import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

export const PolterConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.polter,
  configs: [
    {
      chain: ChainNames.fantom,
      protocol: ProtocolNames.polter,
      version: LendingMarketVersions.cross.aavev2,
      birthday: 1706745600, // Thu Feb 01 2024 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: '0x867faa51b3a437b4e2e699945590ef4f2be2a6d5',
      dataProvider: '0x5f1a219954d231Ae23737325e1C7C1b773ceA5e6',
      oracle: {
        currency: 'usd',
        decimals: 18,
        address: '0x6808b5ce79d44e89883c5393b487c4296abb69fe',
      },
    },
  ],
};
