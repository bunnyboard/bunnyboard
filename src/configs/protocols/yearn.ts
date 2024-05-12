import { DataMetrics, ProtocolConfig, StakingConfig, StakingVersions } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';

export interface YethStakingConfig extends StakingConfig {
  styETH: string;
}

export interface YethProtocolConfig extends ProtocolConfig {
  configs: Array<YethStakingConfig>;
}

export const YethConfigs: YethProtocolConfig = {
  protocol: ProtocolNames.yeth,
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.yeth,
      metric: DataMetrics.staking,
      version: StakingVersions.yeth,
      birthday: 1694044800, // Thu Sep 07 2023 00:00:00 GMT+0000
      address: '0x2cced4ffa804adbe1269cdfc22d7904471abde63',
      styETH: '0x583019ff0f430721ada9cfb4fac8f06ca104d0b4',
    },
  ],
};
