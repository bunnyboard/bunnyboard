import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

export const YeifinanceConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.yeifinance,
  configs: [
    {
      chain: ChainNames.seievm,
      protocol: ProtocolNames.yeifinance,
      version: LendingMarketVersions.cross.aavev3,
      metric: DataMetrics.crossLending,
      birthday: 1717372800, // Mon Jun 03 2024 00:00:00 GMT+0000
      address: '0x4a4d9abd36f923cba0af62a39c01dec2944fb638',
      dataProvider: '0x60c82a40c57736a9c692c42e87a8849fb407f0d6',
      oracle: {
        currency: 'usd',
        address: '0xa1ce28cebab91d8df346d19970e4ee69a6989734',
      },
    },
  ],
};
