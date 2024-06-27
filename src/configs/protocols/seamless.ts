import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import { AddressesBook } from '../data';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

export const SeamlessConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.seamless,
  configs: [
    {
      chain: ChainNames.base,
      protocol: ProtocolNames.seamless,
      version: LendingMarketVersions.cross.aavev3,
      metric: DataMetrics.crossLending,
      birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
      address: AddressesBook.base.SeamlessLendingPool,
      dataProvider: AddressesBook.base.SeamlessDataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.base.SeamlessOracle,
      },
    },

    // for flashloan
    {
      chain: ChainNames.base,
      protocol: ProtocolNames.seamless,
      version: LendingMarketVersions.cross.aavev3,
      metric: DataMetrics.flashloan,
      birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
      address: AddressesBook.base.SeamlessLendingPool,
    },
  ],
};
