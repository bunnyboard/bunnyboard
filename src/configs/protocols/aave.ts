import { CrossLendingMarketConfig, DataMetrics, LendingMarketVersions, ProtocolConfig } from '../../types/configs';
import { AddressesBook } from '../data';
import { ChainNames, ProtocolNames } from '../names';

export interface AaveLendingMarketConfig extends CrossLendingMarketConfig {
  dataProvider: string;
  incentiveController: string;
}

export interface AaveProtocolConfig extends ProtocolConfig {
  configs: Array<AaveLendingMarketConfig>;
}

export const Aavev2Configs: AaveProtocolConfig = {
  protocol: ProtocolNames.aavev2,
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.aavev2,
      version: LendingMarketVersions.cross.aavev2,
      birthday: 1606780800, // Tue Dec 01 2020 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.ethereum.Aavev2LendingPool,
      dataProvider: AddressesBook.ethereum.Aavev2DataProvider,
      incentiveController: AddressesBook.ethereum.Aavev2IncentiveController,
    },
    {
      chain: ChainNames.polygon,
      protocol: ProtocolNames.aavev2,
      version: LendingMarketVersions.cross.aavev2,
      birthday: 1617235200, // Thu Apr 01 2021 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.polygon.Aavev2LendingPool,
      dataProvider: AddressesBook.polygon.Aavev2DataProvider,
      incentiveController: AddressesBook.polygon.Aavev2IncentiveController,
    },
    {
      chain: ChainNames.avalanche,
      protocol: ProtocolNames.aavev2,
      version: LendingMarketVersions.cross.aavev2,
      birthday: 1632182400, // Tue Sep 21 2021 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.avalanche.Aavev2LendingPool,
      dataProvider: AddressesBook.avalanche.Aavev2DataProvider,
      incentiveController: AddressesBook.avalanche.Aavev2IncentiveController,
    },
  ],
};

export const Aavev3Configs: AaveProtocolConfig = {
  protocol: ProtocolNames.aavev3,
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1674864000, // Sat Jan 28 2023 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.ethereum.Aavev3LendingPool,
      dataProvider: AddressesBook.ethereum.Aavev3DataProvider,
      incentiveController: AddressesBook.ethereum.Aavev3IncentiveController,
    },
    {
      chain: ChainNames.optimism,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.optimism.Aavev3LendingPool,
      dataProvider: AddressesBook.optimism.Aavev3DataProvider,
      incentiveController: AddressesBook.optimism.Aavev3IncentiveController,
    },
    {
      chain: ChainNames.arbitrum,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.arbitrum.Aavev3LendingPool,
      dataProvider: AddressesBook.arbitrum.Aavev3DataProvider,
      incentiveController: AddressesBook.arbitrum.Aavev3IncentiveController,
    },
    {
      chain: ChainNames.polygon,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.polygon.Aavev3LendingPool,
      dataProvider: AddressesBook.polygon.Aavev3DataProvider,
      incentiveController: AddressesBook.polygon.Aavev3IncentiveController,
    },
    {
      chain: ChainNames.avalanche,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.avalanche.Aavev3LendingPool,
      dataProvider: AddressesBook.avalanche.Aavev3DataProvider,
      incentiveController: AddressesBook.avalanche.Aavev3IncentiveController,
    },
    {
      chain: ChainNames.fantom,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1692748800, // Wed Aug 23 2023 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.fantom.Aavev3LendingPool,
      dataProvider: AddressesBook.fantom.Aavev3DataProvider,
      incentiveController: AddressesBook.fantom.Aavev3IncentiveController,
    },
    {
      chain: ChainNames.base,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1692662400, // Tue Aug 22 2023 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.base.Aavev3LendingPool,
      dataProvider: AddressesBook.base.Aavev3DataProvider,
      incentiveController: AddressesBook.base.Aavev3IncentiveController,
    },
    {
      chain: ChainNames.metis,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1682294400, // Mon Apr 24 2023 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.metis.Aavev3LendingPool,
      dataProvider: AddressesBook.metis.Aavev3DataProvider,
      incentiveController: AddressesBook.metis.Aavev3IncentiveController,
    },
    {
      chain: ChainNames.gnosis,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1696464000, // Thu Oct 05 2023 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.gnosis.Aavev3LendingPool,
      dataProvider: AddressesBook.gnosis.Aavev3DataProvider,
      incentiveController: AddressesBook.gnosis.Aavev3IncentiveController,
    },
    {
      chain: ChainNames.bnbchain,
      protocol: ProtocolNames.aavev3,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1706054400, // Wed Jan 24 2024 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.bnbchain.Aavev3LendingPool,
      dataProvider: AddressesBook.bnbchain.Aavev3DataProvider,
      incentiveController: AddressesBook.bnbchain.Aavev3IncentiveController,
    },
  ],
};
