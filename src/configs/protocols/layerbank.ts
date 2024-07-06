import { CrossLendingMarketConfig, DataMetrics, LendingMarketVersions, ProtocolConfig } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';

export interface LayerbankProtocolConfig extends ProtocolConfig {
  configs: Array<CrossLendingMarketConfig>;
}

export const LayerbankConfigs: LayerbankProtocolConfig = {
  protocol: ProtocolNames.layerbank,
  configs: [
    {
      protocol: ProtocolNames.layerbank,
      chain: ChainNames.linea,
      metric: DataMetrics.crossLending,
      birthday: 1710288000, // Wed Mar 13 2024 00:00:00 GMT+0000
      version: LendingMarketVersions.cross.layerbank,
      address: '0x43eac5bfea14531b8de0b334e123ea98325de866', // Layerbank core
    },
    {
      protocol: ProtocolNames.layerbank,
      chain: ChainNames.scroll,
      metric: DataMetrics.crossLending,
      birthday: 1697846400, // Sat Oct 21 2023 00:00:00 GMT+0000
      version: LendingMarketVersions.cross.layerbank,
      address: '0xec53c830f4444a8a56455c6836b5d2aa794289aa', // Layerbank core
    },
    {
      protocol: ProtocolNames.layerbank,
      chain: ChainNames.mode,
      metric: DataMetrics.crossLending,
      birthday: 1708473600, // Wed Feb 21 2024 00:00:00 GMT+0000
      version: LendingMarketVersions.cross.layerbank,
      address: '0x80980869d90a737aff47aba6fbaa923012c1ff50', // Layerbank core
    },
    {
      protocol: ProtocolNames.layerbank,
      chain: ChainNames.zklinknova,
      metric: DataMetrics.crossLending,
      birthday: 1711756800, // Sat Mar 30 2024 00:00:00 GMT+0000
      version: LendingMarketVersions.cross.layerbank,
      address: '0x4ac518dbf0cc730a1c880739cfa98fe0bb284959', // Layerbank core
    },
    {
      protocol: ProtocolNames.layerbank,
      chain: ChainNames.bsquared,
      metric: DataMetrics.crossLending,
      birthday: 1713225600, // Tue Apr 16 2024 00:00:00 GMT+0000
      version: LendingMarketVersions.cross.layerbank,
      address: '0x72f7a8eb9f83de366ae166dc50f16074076c3ea6', // Layerbank core
    },
    {
      protocol: ProtocolNames.layerbank,
      chain: ChainNames.bob,
      metric: DataMetrics.crossLending,
      birthday: 1714521600, // Wed May 01 2024 00:00:00 GMT+0000
      version: LendingMarketVersions.cross.layerbank,
      address: '0x77cabfd057bd7c81c011059f1bf74ec1fbeda971', // Layerbank core
    },
    {
      protocol: ProtocolNames.layerbank,
      chain: ChainNames.bitlayer,
      metric: DataMetrics.crossLending,
      birthday: 1715990400, // Sat May 18 2024 00:00:00 GMT+0000
      version: LendingMarketVersions.cross.layerbank,
      address: '0xf1e25704e75da0496b46bf4e3856c5480a3c247f', // Layerbank core
    },
    {
      protocol: ProtocolNames.layerbank,
      chain: ChainNames.manta,
      metric: DataMetrics.crossLending,
      birthday: 1698624000, // Mon Oct 30 2023 00:00:00 GMT+0000
      version: LendingMarketVersions.cross.layerbank,
      address: '0xb7a23fc0b066051de58b922dc1a08f33df748bbf', // Layerbank core
    },
  ],
};
