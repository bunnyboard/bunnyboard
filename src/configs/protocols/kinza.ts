import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import { AddressesBook } from '../data';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

export const KinzaConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.kinza,
  configs: [
    {
      chain: ChainNames.bnbchain,
      protocol: ProtocolNames.kinza,
      version: LendingMarketVersions.cross.aavev3,
      metric: DataMetrics.crossLending,
      birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
      address: AddressesBook.bnbchain.KinzaLendingPool,
      dataProvider: AddressesBook.bnbchain.KinzaDataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.bnbchain.KinzaOracle,
      },
    },
  ],
};
