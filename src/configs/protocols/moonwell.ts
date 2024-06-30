import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import cTokenMappings from '../data/statics/cTokenMappings.json';
import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig, formatCompoundLendingMarketConfig } from './compound';

export const MoonwellConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.moonwell,
  configs: formatCompoundLendingMarketConfig([
    {
      chain: ChainNames.moonbeam,
      protocol: ProtocolNames.moonwell,
      version: LendingMarketVersions.cross.compound,
      birthday: 1624320000, // Tue Jun 22 2021 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: '0x8e00d5e02e65a19337cdba98bba9f84d4186a180',
      governanceToken: null,
      underlying: cTokenMappings,
      blacklists: {
        '0x02e9081dfadd37a852f9a73c4d7d69e615e61334': true,
        '0xc3090f41eb54a7f18587fd6651d4d3ab477b07a4': true,
        '0x24a9d8f1f350d59cb0368d3d52a77db29c833d1d': true,
        '0x298f2e346b82d69a473bf25f329bdf869e17dec8': true,
      },
    },
    {
      chain: ChainNames.moonriver,
      protocol: ProtocolNames.moonwell,
      version: LendingMarketVersions.cross.compound,
      birthday: 1644451200, // Thu Feb 10 2022 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: '0x0b7a0eaa884849c6af7a129e899536dddca4905e',
      governanceToken: null,
      underlying: cTokenMappings,
      blacklists: {
        '0xd0670aee3698f66e2d4daf071eb9c690d978bfa8': true,
        '0x36918b66f9a3ec7a59d0007d8458db17bdffbf21': true,
        '0x6503d905338e2ebb550c9ec39ced525b612e77ae': true,
        '0x6e745367f4ad2b3da7339aee65dc85d416614d90': true,
      },
    },
    {
      chain: ChainNames.base,
      protocol: ProtocolNames.moonwell,
      version: LendingMarketVersions.cross.compound,
      birthday: 1691193600, // Sat Aug 05 2023 00:00:00 GMT+0000
      metric: DataMetrics.crossLending,
      address: '0xfbb21d0380bee3312b33c4353c8936a0f13ef26c',
      governanceToken: null,
      underlying: cTokenMappings,
    },
  ]),
};
