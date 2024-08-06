import { DataMetrics, DexConfig, DexVersions, ProtocolConfig } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';

export interface KatanaConfig extends ProtocolConfig {
  configs: Array<DexConfig>;
}

export const KatanaConfigs: KatanaConfig = {
  protocol: ProtocolNames.katana,
  configs: [
    {
      chain: ChainNames.ronin,
      protocol: ProtocolNames.katana,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0xb255d6a720bb7c39fee173ce22113397119cb930',
      birthblock: 7860906,
      birthday: 1635206400, // Tue Oct 26 2021 00:00:00 GMT+0000
    },
  ],
};
