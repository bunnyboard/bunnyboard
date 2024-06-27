import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import { AddressesBook } from '../data';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

export const ZerolendConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.zerolend,
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.zerolend,
      version: LendingMarketVersions.cross.aavev3,
      metric: DataMetrics.crossLending,
      birthday: 1709510400, // Mon Mar 04 2024 00:00:00 GMT+0000
      address: AddressesBook.ethereum.ZerolendLendingPool,
      dataProvider: AddressesBook.ethereum.ZerolendDataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.ethereum.ZerolendOracle,
      },
    },
    {
      chain: ChainNames.blast,
      protocol: ProtocolNames.zerolend,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1709251200, // Fri Mar 01 2024 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.blast.ZerolendLendingPool,
      dataProvider: AddressesBook.blast.ZerolendDataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.blast.ZerolendOracle,
      },
    },
    {
      chain: ChainNames.linea,
      protocol: ProtocolNames.zerolend,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1710028800, // Sun Mar 10 2024 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.linea.ZerolendLendingPool,
      dataProvider: AddressesBook.linea.ZerolendDataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.linea.ZerolendOracle,
      },
    },
    {
      chain: ChainNames.zksync,
      protocol: ProtocolNames.zerolend,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1689552000, // Mon Jul 17 2023 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.zksync.ZerolendLendingPool,
      dataProvider: AddressesBook.zksync.ZerolendDataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.zksync.ZerolendOracle,
      },
    },
    {
      chain: ChainNames.manta,
      protocol: ProtocolNames.zerolend,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1705276800, // Mon Jan 15 2024 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.manta.ZerolendLendingPool,
      dataProvider: AddressesBook.manta.ZerolendDataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.manta.ZerolendOracle,
      },
    },

    // for flashloan
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.zerolend,
      version: LendingMarketVersions.cross.aavev3,
      metric: DataMetrics.flashloan,
      birthday: 1709510400, // Mon Mar 04 2024 00:00:00 GMT+0000
      address: AddressesBook.ethereum.ZerolendLendingPool,
    },
    {
      chain: ChainNames.blast,
      protocol: ProtocolNames.zerolend,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1709251200, // Fri Mar 01 2024 00:00:00 GMT+0000
      metric: DataMetrics.flashloan,
      address: AddressesBook.blast.ZerolendLendingPool,
    },
    {
      chain: ChainNames.linea,
      protocol: ProtocolNames.zerolend,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1710028800, // Sun Mar 10 2024 00:00:00 GMT+0000
      metric: DataMetrics.flashloan,
      address: AddressesBook.linea.ZerolendLendingPool,
    },
    {
      chain: ChainNames.zksync,
      protocol: ProtocolNames.zerolend,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1689552000, // Mon Jul 17 2023 00:00:00 GMT+0000
      metric: DataMetrics.flashloan,
      address: AddressesBook.zksync.ZerolendLendingPool,
    },
    {
      chain: ChainNames.manta,
      protocol: ProtocolNames.zerolend,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1705276800, // Mon Jan 15 2024 00:00:00 GMT+0000
      metric: DataMetrics.flashloan,
      address: AddressesBook.manta.ZerolendLendingPool,
    },
  ],
};
