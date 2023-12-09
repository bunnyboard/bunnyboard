import { LendingMarketConfig, ProtocolConfig, Token } from '../../types/configs';
import { AddressZero } from '../constants';
import EthereumTokenList from '../tokenlists/ethereum.json';

export interface LiquityLendingMarketConfig extends LendingMarketConfig {
  debtToken: Token;
  collateralToken: Token;
  troveManager: string;
}

export interface LiquityProtocolConfig extends ProtocolConfig {
  lendingMarkets: Array<LiquityLendingMarketConfig>;
}

export const LiquityConfigs: LiquityProtocolConfig = {
  protocol: 'liquity',
  lendingMarkets: [
    {
      chain: 'ethereum',
      protocol: 'liquity',
      type: 'cdp',
      version: 'liquity',
      birthday: 1617667200, // Tue Apr 06 2021 00:00:00 GMT+0000
      address: '0x24179cd81c9e782a4096035f7ec97fb8b783e007', // Borrow Operations
      troveManager: '0xa39739ef8b0231dbfa0dcda07d7e29faabcf4bb2', // Trove Manager
      debtToken: EthereumTokenList.LUSD,
      collateralToken: {
        chain: 'ethereum',
        symbol: 'ETH',
        decimals: 18,
        address: AddressZero,
      },
    },
  ],
};
