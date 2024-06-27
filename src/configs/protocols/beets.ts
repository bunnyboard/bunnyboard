import { DataMetrics, FlashloanConfig, FlashloanVersion, ProtocolConfig } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';

export interface BalancerProtocolConfig extends ProtocolConfig {
  configs: Array<FlashloanConfig>;
}

export const BeetsConfigs: BalancerProtocolConfig = {
  protocol: ProtocolNames.beets,
  configs: [
    {
      chain: ChainNames.fantom,
      protocol: ProtocolNames.beets,
      version: FlashloanVersion.balancer,
      birthday: 1631404800, // Sun Sep 12 2021 00:00:00 GMT+0000
      metric: DataMetrics.flashloan,
      address: '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce',
    },
    {
      chain: ChainNames.optimism,
      protocol: ProtocolNames.beets,
      version: FlashloanVersion.balancer,
      birthday: 1654214400, // Fri Jun 03 2022 00:00:00 GMT+0000
      metric: DataMetrics.flashloan,
      address: '0xba12222222228d8ba445958a75a0704d566bf2c8',
    },
  ],
};
