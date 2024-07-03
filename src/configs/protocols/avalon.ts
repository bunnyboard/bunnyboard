import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

export const AvalonConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.avalon,
  configs: [
    {
      chain: ChainNames.merlin,
      protocol: ProtocolNames.avalon,
      version: LendingMarketVersions.cross.aavev3,
      metric: DataMetrics.crossLending,
      birthday: 1710892800, // Wed Mar 20 2024 00:00:00 GMT+0000
      address: '0xea5c99a3cca5f95ef6870a1b989755f67b6b1939',
      dataProvider: '0x5f314b36412765f3e1016632fd1ad528929536ca',
      oracle: {
        currency: 'usd',
        address: '0x191a6ac7cbc29de2359de10505e05935a1ed5478',
      },
    },
    {
      chain: ChainNames.bitlayer,
      protocol: ProtocolNames.avalon,
      version: LendingMarketVersions.cross.aavev3,
      metric: DataMetrics.crossLending,
      birthday: 1714953600, // Mon May 06 2024 00:00:00 GMT+0000
      address: '0xea5c99a3cca5f95ef6870a1b989755f67b6b1939',
      dataProvider: '0x5f314b36412765f3e1016632fd1ad528929536ca',
      oracle: {
        currency: 'usd',
        address: '0x191a6ac7cbc29de2359de10505e05935a1ed5478',
      },
    },
    // {
    //   chain: ChainNames.bnbchain,
    //   protocol: ProtocolNames.avalon,
    //   version: LendingMarketVersions.cross.aavev3,
    //   metric: DataMetrics.crossLending,
    //   birthday: 1714953600, // Mon May 06 2024 00:00:00 GMT+0000
    //   address: '0xf9278c7c4aefac4ddfd0d496f7a1c39ca6bca6d4',
    //   dataProvider: '0x672b19dda450120c505214d149ee7f7b6ded8c39',
    //   oracle: {
    //     currency: 'usd',
    //     address: '0xc204f75f22ec427869abf80b1b8cf98e028f7fc1',
    //   },
    // },
    {
      chain: ChainNames.core,
      protocol: ProtocolNames.avalon,
      version: LendingMarketVersions.cross.aavev3,
      metric: DataMetrics.crossLending,
      birthday: 1716336000, // Wed May 22 2024 00:00:00 GMT+0000
      address: '0x67197de79b2a8fc301bab591c78ae5430b9704fd',
      dataProvider: '0x802cb61844325dc9a161bc3a498e3be1b7b6fe00',
      oracle: {
        currency: 'usd',
        address: '0x5ca296a74278bfc0fe3ee86abf7f536afef520f8',
      },
    },
    // {
    //   chain: ChainNames.arbitrum,
    //   protocol: ProtocolNames.avalon,
    //   version: LendingMarketVersions.cross.aavev3,
    //   metric: DataMetrics.crossLending,
    //   birthday: 1715558400, // Mon May 13 2024 00:00:00 GMT+0000
    //   address: '0xe1ee45db12ac98d16f1342a03c93673d74527b55',
    //   dataProvider: '0xec579d2ce07401258710199ff12a5bb56e086a6f',
    //   oracle: {
    //     currency: 'usd',
    //     address: '0x16d0d4d24305ae29161a42f51d15dc8586bbdc9b',
    //   },
    // },
  ],
};
