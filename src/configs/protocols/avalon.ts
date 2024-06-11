import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

export const AvalonConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.avalon,
  configs: [
    {
      chain: ChainNames.merlin,
      protocol: ProtocolNames.avalon,
      version: LendingMarketVersions.cross.aavev2,
      metric: DataMetrics.crossLending,
      birthday: 1710892800, // Wed Mar 20 2024 00:00:00 GMT+0000
      address: '0xea5c99a3cca5f95ef6870a1b989755f67b6b1939',
      dataProvider: '0x5f314b36412765f3e1016632fd1ad528929536ca',
      oracle: {
        currency: 'usd',
        address: '0x191a6ac7cbc29de2359de10505e05935a1ed5478',
      },
    },
  ],
};
