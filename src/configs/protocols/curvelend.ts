import { DataMetrics, IsolatedLendingMarketConfig, LendingMarketVersions, ProtocolConfig } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';

export interface CurvelendFactoryConfig extends IsolatedLendingMarketConfig {
  address: string; // factory
}

export interface CurvelendProtocolConfig extends ProtocolConfig {
  configs: Array<CurvelendFactoryConfig>;
}

export const CurvelendConfigs: CurvelendProtocolConfig = {
  protocol: ProtocolNames.curvelend,
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.curvelend,
      metric: DataMetrics.isolatedLending,
      version: LendingMarketVersions.isolated.curvelend,
      birthday: 1710374400, // Thu Mar 14 2024 00:00:00 GMT+0000
      address: '0xea6876dde9e3467564acbee1ed5bac88783205e0',
    },
    {
      chain: ChainNames.arbitrum,
      protocol: ProtocolNames.curvelend,
      metric: DataMetrics.isolatedLending,
      version: LendingMarketVersions.isolated.curvelend,
      birthday: 1711324800, // Mon Mar 25 2024 00:00:00 GMT+0000
      address: '0xcaec110c784c9df37240a8ce096d352a75922dea',
    },
  ],
};
