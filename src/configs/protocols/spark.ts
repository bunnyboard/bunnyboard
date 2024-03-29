import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import { AddressesBook } from '../data';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

export const SparkConfigs: AaveProtocolConfig = {
  protocol: 'spark',
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.spark,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1678233600, // Wed Mar 08 2023 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.ethereum.SparkLendingPool,
      dataProvider: AddressesBook.ethereum.SparkDataProvider,
      incentiveController: AddressesBook.ethereum.SparkIncentiveController,
    },
    {
      chain: ChainNames.gnosis,
      protocol: ProtocolNames.spark,
      version: LendingMarketVersions.cross.aavev3,
      birthday: 1693958400, // Wed Sep 06 2023 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: AddressesBook.gnosis.SparkLendingPool,
      dataProvider: AddressesBook.gnosis.SparkDataProvider,
      incentiveController: AddressesBook.gnosis.SparkIncentiveController,
    },
  ],
};
