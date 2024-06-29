import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

export const IroncladConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.ironclad,
  configs: [
    {
      chain: ChainNames.mode,
      protocol: ProtocolNames.ironclad,
      version: LendingMarketVersions.cross.aavev2,
      metric: DataMetrics.crossLending,
      birthday: 1708128000, // Sat Feb 17 2024 00:00:00 GMT+0000
      address: '0xb702ce183b4e1faa574834715e5d4a6378d0eed3',
      dataProvider: '0x29563f73de731ae555093deb795ba4d1e584e42e',
      oracle: {
        currency: 'usd',
        address: '0xe4f4f36fcbb2d53c0bab95f5d117489579553caa',
      },
    },

    // for flashloan
    {
      chain: ChainNames.mode,
      protocol: ProtocolNames.ironclad,
      version: LendingMarketVersions.cross.aavev2,
      metric: DataMetrics.flashloan,
      birthday: 1708128000, // Sat Feb 17 2024 00:00:00 GMT+0000
      address: '0xb702ce183b4e1faa574834715e5d4a6378d0eed3',
    },
  ],
};
