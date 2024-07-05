import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

export const ColendCOnfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.colend,
  configs: [
    {
      chain: ChainNames.core,
      protocol: ProtocolNames.colend,
      version: LendingMarketVersions.cross.aavev3,
      metric: DataMetrics.crossLending,
      birthday: 1713225600, // Tue Apr 16 2024 00:00:00 GMT+0000
      address: '0x0cea9f0f49f30d376390e480ba32f903b43b19c5',
      dataProvider: '0x567af83d912c85c7a66d093e41d92676fa9076e3',
      oracle: {
        currency: 'usd',
        address: '0xbc3c48e10e6eeca877e82d17baa0ca6ae5d0a153',
      },
    },
  ],
};
