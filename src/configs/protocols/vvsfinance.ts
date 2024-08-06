import { DataMetrics, DexConfig, DexVersions, ProtocolConfig } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';

export interface VvsfinanceConfig extends ProtocolConfig {
  configs: Array<DexConfig>;
}

export const VvsfinanceConfigs: VvsfinanceConfig = {
  protocol: ProtocolNames.vvsfinance,
  configs: [
    {
      chain: ChainNames.cronos,
      protocol: ProtocolNames.vvsfinance,
      metric: DataMetrics.dex,
      version: DexVersions.univ2,
      feeRate: '0.003', // 0.3%
      address: '0x3b44b2a187a7b3824131f8db5a74194d0a42fc15',
      birthblock: 4112,
      birthday: 1636416000, // Tue Nov 09 2021 00:00:00 GMT+0000
    },
  ],
};

export const Vvsfinancev3Configs: VvsfinanceConfig = {
  protocol: ProtocolNames.vvsfinancev3,
  configs: [
    {
      chain: ChainNames.cronos,
      protocol: ProtocolNames.vvsfinancev3,
      metric: DataMetrics.dex,
      version: DexVersions.univ3,
      address: '0x40ab11c64e9ff5368f09343ac860dafa34e14c35',
      birthblock: 10292950,
      birthday: 1695254400, // Thu Sep 21 2023 00:00:00 GMT+0000
    },
  ],
};
