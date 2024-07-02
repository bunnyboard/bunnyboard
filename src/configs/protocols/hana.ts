import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

export const HanaConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.hana,
  configs: [
    {
      chain: ChainNames.taiko,
      protocol: ProtocolNames.hana,
      version: LendingMarketVersions.cross.aavev3,
      metric: DataMetrics.crossLending,
      birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
      address: '0x4ab85bf9ea548410023b25a13031e91b4c4f3b91',
      dataProvider: '0x9e3d95b518f68349464da1b6dbd0b94db59addc1',
      oracle: {
        currency: 'usd',
        address: '0x47bd9d96b420709b2c6270da99459de9b3550ea1',
      },
    },
  ],
};
