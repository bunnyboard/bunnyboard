import { DataMetrics, IsolatedLendingMarketConfig, LendingMarketVersions, ProtocolConfig } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';

export interface FluidLendingConfig extends IsolatedLendingMarketConfig {
  address: string; // vault factory
  liquidityResolver: string;
  vaultResolver: string;
}

export interface FluidProtocolConfig extends ProtocolConfig {
  configs: Array<FluidLendingConfig>;
}

export const FluidConfigs: FluidProtocolConfig = {
  protocol: ProtocolNames.fluid,
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.fluid,
      metric: DataMetrics.isolatedLending,
      version: LendingMarketVersions.cross.fluid,
      birthday: 1717200000, // Sat Jun 01 2024 00:00:00 GMT+0000
      address: '0x324c5dc1fc42c7a4d43d92df1eba58a54d13bf2d',
      liquidityResolver: '0xd7588f6c99605ab274c211a0afec60947668a8cb',
      vaultResolver: '0x56ddf84b2c94bf3361862fcedb704c382dc4cd32',
    },
  ],
};
