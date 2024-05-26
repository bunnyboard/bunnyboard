import { normalizeAddress } from '../../lib/utils';
import { CdpLendingMarketConfig, DataMetrics, LendingMarketVersions, ProtocolConfig, Token } from '../../types/configs';
import { AddressZero } from '../constants';
import { ChainNames, ProtocolNames } from '../names';

export interface LiquityTrove {
  borrowOperation: string;
  troveManager: string;
  collateralToken: Token;
}

export interface LiquityLendingMarketConfig extends CdpLendingMarketConfig {
  address: string; // debt token address
  troves: Array<LiquityTrove>;
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
      troves: config.troves.map((trove) => {
        return {
          borrowOperation: normalizeAddress(trove.borrowOperation),
          troveManager: normalizeAddress(trove.troveManager),
          collateralToken: {
            ...trove.collateralToken,
            address: normalizeAddress(trove.collateralToken.address),
          },
        };
      }),
    };
  });
}

export const LiquityConfigs: LiquityProtocolConfig = {
  protocol: 'liquity',
  configs: formatLiquityLendingMarketConfig([
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.liquity,
      version: LendingMarketVersions.cdp.liquity,
      birthday: 1617667200, // Tue Apr 06 2021 00:00:00 GMT+0000
      metric: DataMetrics.cdpLending,
      address: '0x5f98805a4e8be255a32880fdec7f6728c6568ba0', // LUSD token address
      debtToken: {
        chain: 'ethereum',
        symbol: 'LUSD',
        decimals: 18,
        address: '0x5f98805a4e8be255a32880fdec7f6728c6568ba0',
      },
      troves: [
        {
          borrowOperation: '0x24179cd81c9e782a4096035f7ec97fb8b783e007',
          troveManager: '0xa39739ef8b0231dbfa0dcda07d7e29faabcf4bb2',
          collateralToken: {
            chain: 'ethereum',
            symbol: 'ETH',
            decimals: 18,
            address: AddressZero,
          },
        },
      ],
    },
  ]),
};
