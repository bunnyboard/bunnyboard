import { normalizeAddress } from '../../lib/utils';
import { DataMetrics, LendingMarketConfig, ProtocolConfig } from '../../types/configs';
import { AddressZero } from '../constants';

export interface LiquityLendingMarketConfig extends LendingMarketConfig {
  borrowOperation: string;
}

export interface LiquityProtocolConfig extends ProtocolConfig {
  configs: Array<LiquityLendingMarketConfig>;
}

export function formatLiquityLendingMarketConfig(
  configs: Array<LiquityLendingMarketConfig>,
): Array<LiquityLendingMarketConfig> {
  return configs.map((config) => {
    return {
      ...config,

      address: normalizeAddress(config.address),
      borrowOperation: normalizeAddress(config.borrowOperation),
    };
  });
}

export const LiquityConfigs: LiquityProtocolConfig = {
  protocol: 'liquity',
  configs: formatLiquityLendingMarketConfig([
    {
      chain: 'ethereum',
      protocol: 'liquity',
      type: 'cdp',
      version: 'liquity',
      birthday: 1617667200, // Tue Apr 06 2021 00:00:00 GMT+0000
      metric: DataMetrics.lending,
      address: '0xa39739ef8b0231dbfa0dcda07d7e29faabcf4bb2', // trove manager
      borrowOperation: '0x24179cd81c9e782a4096035f7ec97fb8b783e007',
      debtToken: {
        chain: 'ethereum',
        symbol: 'LUSD',
        decimals: 18,
        address: '0x5f98805a4e8be255a32880fdec7f6728c6568ba0',
      },
      collateralToken: {
        chain: 'ethereum',
        symbol: 'ETH',
        decimals: 18,
        address: AddressZero,
      },
    },
  ]),
};
