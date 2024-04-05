import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import { AddressesBook } from '../data';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

export const RadiantConfigs: AaveProtocolConfig = {
  protocol: 'radiant',
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.radiant,
      version: LendingMarketVersions.cross.aavev2,
      metric: DataMetrics.crossLending,
      birthday: 1698710400, // Tue Oct 31 2023 00:00:00 GMT+0000
      address: AddressesBook.ethereum.RadiantLendingPool,
      dataProvider: AddressesBook.ethereum.RadiantDataProvider,
    },
    {
      chain: ChainNames.arbitrum,
      protocol: ProtocolNames.radiant,
      version: LendingMarketVersions.cross.aavev2,
      birthday: 1679184000, // Sun Mar 19 2023 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.arbitrum.RadiantLendingPool,
      dataProvider: AddressesBook.arbitrum.RadiantDataProvider,
    },
    {
      chain: ChainNames.bnbchain,
      protocol: ProtocolNames.radiant,
      version: LendingMarketVersions.cross.aavev2,
      birthday: 1679961600, // Tue Mar 28 2023 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.bnbchain.RadiantLendingPool,
      dataProvider: AddressesBook.bnbchain.RadiantDataProvider,
    },
  ],
};
