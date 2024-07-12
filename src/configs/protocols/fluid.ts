import { CrossLendingMarketConfig, DataMetrics, LendingMarketVersions, ProtocolConfig } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';

export interface FluidLendingConfig extends CrossLendingMarketConfig {
  address: string; // liquidity address
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
      metric: DataMetrics.crossLending,
      version: LendingMarketVersions.cross.fluid,
      birthday: 1717200000, // Sat Jun 01 2024 00:00:00 GMT+0000
      address: '0x52aa899454998be5b000ad077a46bbe360f4e497',
      liquidityResolver: '0xd7588f6c99605ab274c211a0afec60947668a8cb',
      vaultResolver: '0x56ddf84b2c94bf3361862fcedb704c382dc4cd32',
    },
    {
      chain: ChainNames.arbitrum,
      protocol: ProtocolNames.fluid,
      metric: DataMetrics.crossLending,
      version: LendingMarketVersions.cross.fluid,
      birthday: 1718150400, // Wed Jun 12 2024 00:00:00 GMT+0000
      address: '0x52aa899454998be5b000ad077a46bbe360f4e497',
      liquidityResolver: '0x46859d33e662d4bf18eeed88f74c36256e606e44',
      vaultResolver: '0x77648d39be25a1422467060e11e5b979463bea3d',
    },
  ],
};
