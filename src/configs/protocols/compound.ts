import { normalizeAddress } from '../../lib/utils';
import {
  CdpLendingMarketConfig,
  CrossLendingMarketConfig,
  DataMetrics,
  ProtocolConfig,
  Token,
} from '../../types/configs';
import EthereumTokenList from '../tokenlists/ethereum.json';

export interface CompoundLendingMarketConfig extends CrossLendingMarketConfig {
  governanceToken: Token | null;
  underlying: {
    // contract address => underlying token
    [key: string]: Token;
  };
  // we can get all cTokens from Comptroller contract
  // however, the old version of Comptroller didn't support it
  // in that case, we use this cTokens list instead,
  preDefinedMarkets?: Array<string>;
}

export interface CompoundProtocolConfig extends ProtocolConfig {
  configs: Array<CompoundLendingMarketConfig>;
}

export function formatCompoundLendingMarketConfig(
  configs: Array<CompoundLendingMarketConfig>,
): Array<CompoundLendingMarketConfig> {
  return configs.map((config) => {
    return {
      ...config,

      address: normalizeAddress(config.address),
      preDefinedMarkets: config.preDefinedMarkets ? config.preDefinedMarkets.map((item) => normalizeAddress(item)) : [],
    };
  });
}

export const CompoundConfigs: CompoundProtocolConfig = {
  protocol: 'compound',
  configs: formatCompoundLendingMarketConfig([
    {
      chain: 'ethereum',
      protocol: 'compound',
      version: 'compound',
      metric: DataMetrics.crossLending,
      birthday: 1557273600, // Wed May 08 2019 00:00:00 GMT+0000
      address: '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b',
      governanceToken: {
        chain: 'ethereum',
        symbol: 'COMP',
        decimals: 18,
        address: '0xc00e94cb662c3520282e6f5717214004a7f26888',
      },
      underlying: {
        '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5': {
          chain: 'ethereum',
          symbol: 'ETH',
          decimals: 18,
          address: '0x0000000000000000000000000000000000000000',
        },
      },
      preDefinedMarkets: [
        '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E',
        '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
        '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
        '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1',
        '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
        '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
        '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4',
        '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407',
        '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC',
      ],
    },
  ]),
};

export function formatCompoundv3LendingMarketConfig(
  configs: Array<CdpLendingMarketConfig>,
): Array<CdpLendingMarketConfig> {
  return configs.map((config) => {
    return {
      ...config,
      debtToken: {
        ...config.debtToken,
        address: normalizeAddress(config.debtToken.address),
      },
      address: normalizeAddress(config.address),
    };
  });
}

export interface Compoundv3ProtocolConfig extends ProtocolConfig {
  configs: Array<CdpLendingMarketConfig>;
}

export const Compoundv3Configs: Compoundv3ProtocolConfig = {
  protocol: 'compoundv3',
  configs: formatCompoundv3LendingMarketConfig([
    {
      chain: 'ethereum',
      protocol: 'compoundv3',
      version: 'compoundv3',
      birthday: 1660435200, // Sun Aug 14 2022 00:00:00 GMT+0000
      metric: DataMetrics.cdpLending,
      address: '0xc3d688b66703497daa19211eedff47f25384cdc3', // borrow operations
      debtToken: EthereumTokenList['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    },
  ]),
};
