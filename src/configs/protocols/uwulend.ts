import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import { AddressesBook } from '../data';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

export const UwulendConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.uwulend,
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.uwulend,
      version: LendingMarketVersions.cross.aavev2,
      metric: DataMetrics.crossLending,
      birthday: 1663632000, // Tue Sep 20 2022 00:00:00 GMT+0000
      address: AddressesBook.ethereum.UwulendLendingPool,
      dataProvider: AddressesBook.ethereum.UwulendDataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.ethereum.UwulendOracle,
      },
    },
  ],
};
