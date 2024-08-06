import { DataMetrics, DexConfig, FlashloanConfig, FlashloanVersion, ProtocolConfig } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';

export interface BalancerProtocolConfig extends ProtocolConfig {
  configs: Array<FlashloanConfig | DexConfig>;
}

export const BalancerConfigs: BalancerProtocolConfig = {
  protocol: ProtocolNames.balancer,
  configs: [
    // dexes
    // {
    //   chain: ChainNames.ethereum,
    //   protocol: ProtocolNames.balancer,
    //   version: DexVersions.balv2,
    //   birthday: 1618876800, // Tue Apr 20 2021 00:00:00 GMT+0000
    //   birthblock: 12272147,
    //   metric: DataMetrics.dex,
    //   address: '0xba12222222228d8ba445958a75a0704d566bf2c8',
    // },
    // {
    //   chain: ChainNames.arbitrum,
    //   protocol: ProtocolNames.balancer,
    //   version: DexVersions.balv2,
    //   birthday: 1629849600, // Wed Aug 25 2021 00:00:00 GMT+0000
    //   birthblock: 222833,
    //   metric: DataMetrics.dex,
    //   address: '0xba12222222228d8ba445958a75a0704d566bf2c8',
    // },
    // {
    //   chain: ChainNames.avalanche,
    //   protocol: ProtocolNames.balancer,
    //   version: DexVersions.balv2,
    //   birthday: 1676678400, // Sat Feb 18 2023 00:00:00 GMT+0000
    //   birthblock: 26386142,
    //   metric: DataMetrics.dex,
    //   address: '0xba12222222228d8ba445958a75a0704d566bf2c8',
    // },
    // {
    //   chain: ChainNames.base,
    //   protocol: ProtocolNames.balancer,
    //   version: DexVersions.balv2,
    //   birthday: 1707436800, // Fri Feb 09 2024 00:00:00 GMT+0000
    //   birthblock: 1196037,
    //   metric: DataMetrics.dex,
    //   address: '0xba12222222228d8ba445958a75a0704d566bf2c8',
    // },
    // {
    //   chain: ChainNames.gnosis,
    //   protocol: ProtocolNames.balancer,
    //   version: DexVersions.balv2,
    //   birthday: 1667347200, // Wed Nov 02 2022 00:00:00 GMT+0000
    //   birthblock: 24821599,
    //   metric: DataMetrics.dex,
    //   address: '0xba12222222228d8ba445958a75a0704d566bf2c8',
    // },
    // {
    //   chain: ChainNames.polygon,
    //   protocol: ProtocolNames.balancer,
    //   version: DexVersions.balv2,
    //   birthday: 1623974400, // Fri Jun 18 2021 00:00:00 GMT+0000
    //   birthblock: 15832991,
    //   metric: DataMetrics.dex,
    //   address: '0xba12222222228d8ba445958a75a0704d566bf2c8',
    // },
    // {
    //   chain: ChainNames.polygonzkevm,
    //   protocol: ProtocolNames.balancer,
    //   version: DexVersions.balv2,
    //   birthday: 1683331200, // Sat May 06 2023 00:00:00 GMT+0000
    //   birthblock: 203080,
    //   metric: DataMetrics.dex,
    //   address: '0xba12222222228d8ba445958a75a0704d566bf2c8',
    // },

    // flashloan
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.balancer,
      version: FlashloanVersion.balancer,
      birthday: 1618876800, // Tue Apr 20 2021 00:00:00 GMT+0000
      metric: DataMetrics.flashloan,
      address: '0xba12222222228d8ba445958a75a0704d566bf2c8',
    },
    {
      chain: ChainNames.arbitrum,
      protocol: ProtocolNames.balancer,
      version: FlashloanVersion.balancer,
      birthday: 1629849600, // Wed Aug 25 2021 00:00:00 GMT+0000
      metric: DataMetrics.flashloan,
      address: '0xba12222222228d8ba445958a75a0704d566bf2c8',
    },
    {
      chain: ChainNames.avalanche,
      protocol: ProtocolNames.balancer,
      version: FlashloanVersion.balancer,
      birthday: 1676678400, // Sat Feb 18 2023 00:00:00 GMT+0000
      metric: DataMetrics.flashloan,
      address: '0xba12222222228d8ba445958a75a0704d566bf2c8',
    },
    {
      chain: ChainNames.base,
      protocol: ProtocolNames.balancer,
      version: FlashloanVersion.balancer,
      birthday: 1707436800, // Fri Feb 09 2024 00:00:00 GMT+0000
      metric: DataMetrics.flashloan,
      address: '0xba12222222228d8ba445958a75a0704d566bf2c8',
    },
    {
      chain: ChainNames.gnosis,
      protocol: ProtocolNames.balancer,
      version: FlashloanVersion.balancer,
      birthday: 1667347200, // Wed Nov 02 2022 00:00:00 GMT+0000
      metric: DataMetrics.flashloan,
      address: '0xba12222222228d8ba445958a75a0704d566bf2c8',
    },
    {
      chain: ChainNames.polygon,
      protocol: ProtocolNames.balancer,
      version: FlashloanVersion.balancer,
      birthday: 1623974400, // Fri Jun 18 2021 00:00:00 GMT+0000
      metric: DataMetrics.flashloan,
      address: '0xba12222222228d8ba445958a75a0704d566bf2c8',
    },
    {
      chain: ChainNames.polygonzkevm,
      protocol: ProtocolNames.balancer,
      version: FlashloanVersion.balancer,
      birthday: 1683331200, // Sat May 06 2023 00:00:00 GMT+0000
      metric: DataMetrics.flashloan,
      address: '0xba12222222228d8ba445958a75a0704d566bf2c8',
    },
  ],
};
