import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import { AddressesBook } from '../data';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

export const PacConfigs: AaveProtocolConfig = {
  protocol: 'pac',
  configs: [
    {
      chain: ChainNames.blast,
      protocol: ProtocolNames.pac,
      version: LendingMarketVersions.cross.aavev3,
      metric: DataMetrics.crossLending,
      birthday: 1709251200, // Fri Mar 01 2024 00:00:00 GMT+0000
      address: AddressesBook.blast.PacLendingPool,
      dataProvider: AddressesBook.blast.PacDataProvider,
      oracle: {
        currency: 'usd',
        address: AddressesBook.blast.PacOracle,
      },
    },
  ],
};
