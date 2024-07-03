import { DataMetrics, LendingMarketVersions } from '../../types/configs';
import { ChainNames, ProtocolNames } from '../names';
import { formatLiquityLendingMarketConfig, LiquityProtocolConfig } from './liquity';

export const OrbynetworkConfigs: LiquityProtocolConfig = {
  protocol: ProtocolNames.orbynetwork,
  configs: formatLiquityLendingMarketConfig([
    {
      chain: ChainNames.cronos,
      protocol: ProtocolNames.orbynetwork,
      version: LendingMarketVersions.cdp.liquity,
      birthday: 1706918400, // Sat Feb 03 2024 00:00:00 GMT+0000
      metric: DataMetrics.cdpLending,
      address: '0xd42e078cea2be8d03cd9dfecc1f0d28915edea78', // USC token address
      debtToken: {
        chain: ChainNames.cronos,
        symbol: 'USC',
        decimals: 18,
        address: '0xd42e078cea2be8d03cd9dfecc1f0d28915edea78',
      },
      troves: [
        {
          borrowOperation: '0x80d32b0fe29a56dd4b6ed5bdcfd2d488db4878fb',
          troveManager: '0x7a47cf15a1fcbad09c66077d1d021430eed7ac65',
          collateralToken: {
            chain: ChainNames.cronos,
            symbol: 'CDCETH',
            decimals: 18,
            address: '0x7a7c9db510ab29a2fc362a4c34260becb5ce3446',
          },
        },
      ],
    },
  ]),
};
