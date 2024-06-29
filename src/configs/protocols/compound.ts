import { normalizeAddress } from '../../lib/utils';
import {
  CrossLendingMarketConfig,
  DataMetrics,
  IsolatedLendingMarketConfig,
  LendingMarketVersions,
  ProtocolConfig,
  Token,
} from '../../types/configs';
import { TokensBook } from '../data';
import cTokenMappings from '../data/statics/cTokenMappings.json';
import { ChainNames, ProtocolNames } from '../names';

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
      underlying: cTokenMappings,
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

export interface Compoundv3LendingMarketConfig extends IsolatedLendingMarketConfig {
  debtToken: Token;
}

export function formatCompoundv3LendingMarketConfig(
  configs: Array<Compoundv3LendingMarketConfig>,
): Array<Compoundv3LendingMarketConfig> {
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
  configs: Array<Compoundv3LendingMarketConfig>;
}

export const Compoundv3Configs: Compoundv3ProtocolConfig = {
  protocol: ProtocolNames.compoundv3,
  configs: formatCompoundv3LendingMarketConfig([
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.compoundv3,
      version: LendingMarketVersions.isolated.compoundv3,
      birthday: 1660435200, // Sun Aug 14 2022 00:00:00 GMT+0000
      metric: DataMetrics.isolatedLending,
      address: '0xc3d688b66703497daa19211eedff47f25384cdc3', // cUSDCv3
      debtToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    },
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.compoundv3,
      version: LendingMarketVersions.isolated.compoundv3,
      birthday: 1673654400, // Sat Jan 14 2023 00:00:00 GMT+0000
      metric: DataMetrics.isolatedLending,
      address: '0xA17581A9E3356d9A858b789D68B4d866e593aE94', // cWETHv3
      debtToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
    },
    {
      chain: ChainNames.polygon,
      protocol: ProtocolNames.compoundv3,
      version: LendingMarketVersions.isolated.compoundv3,
      birthday: 1676764800, // Sun Feb 19 2023 00:00:00 GMT+0000
      metric: DataMetrics.isolatedLending,
      address: '0xF25212E676D1F7F89Cd72fFEe66158f541246445', // cWETHv3
      debtToken: TokensBook.polygon['0x2791bca1f2de4661ed88a30c99a7a9449aa84174'],
    },
    {
      chain: ChainNames.arbitrum,
      protocol: ProtocolNames.compoundv3,
      version: LendingMarketVersions.isolated.compoundv3,
      birthday: 1683244800, // Fri May 05 2023 00:00:00 GMT+0000
      metric: DataMetrics.isolatedLending,
      address: '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA', // cUSDCv3
      debtToken: TokensBook.arbitrum['0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'],
    },
    {
      chain: ChainNames.arbitrum,
      protocol: ProtocolNames.compoundv3,
      version: LendingMarketVersions.isolated.compoundv3,
      birthday: 1692230400, // Thu Aug 17 2023 00:00:00 GMT+0000
      metric: DataMetrics.isolatedLending,
      address: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf', // cUSDCv3 Native
      debtToken: TokensBook.arbitrum['0xaf88d065e77c8cc2239327c5edb3a432268e5831'],
    },
    {
      chain: ChainNames.arbitrum,
      protocol: ProtocolNames.compoundv3,
      version: LendingMarketVersions.isolated.compoundv3,
      birthday: 1717804800, // Sat Jun 08 2024 00:00:00 GMT+0000
      metric: DataMetrics.isolatedLending,
      address: '0x6f7d514bbd4aff3bcd1140b7344b32f063dee486', // cWETHv3
      debtToken: TokensBook.arbitrum['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
    },
    {
      chain: ChainNames.base,
      protocol: ProtocolNames.compoundv3,
      version: LendingMarketVersions.isolated.compoundv3,
      birthday: 1691193600, // Sat Aug 05 2023 00:00:00 GMT+0000
      metric: DataMetrics.isolatedLending,
      address: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf', // cUSDCv3
      debtToken: TokensBook.base['0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca'],
    },
    {
      chain: ChainNames.base,
      protocol: ProtocolNames.compoundv3,
      version: LendingMarketVersions.isolated.compoundv3,
      birthday: 1710201600, // Tue Mar 12 2024 00:00:00 GMT+0000
      metric: DataMetrics.isolatedLending,
      address: '0xb125E6687d4313864e53df431d5425969c15Eb2F', // cUSDCv3
      debtToken: TokensBook.base['0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'],
    },
    {
      chain: ChainNames.base,
      protocol: ProtocolNames.compoundv3,
      version: LendingMarketVersions.isolated.compoundv3,
      birthday: 1691798400, // Sat Aug 12 2023 00:00:00 GMT+0000
      metric: DataMetrics.isolatedLending,
      address: '0x46e6b214b524310239732D51387075E0e70970bf', // cWETHv3
      debtToken: TokensBook.base['0x4200000000000000000000000000000000000006'],
    },
    {
      chain: ChainNames.scroll,
      protocol: ProtocolNames.compoundv3,
      version: LendingMarketVersions.isolated.compoundv3,
      birthday: 1708128000, // Sat Feb 17 2024 00:00:00 GMT+0000
      metric: DataMetrics.isolatedLending,
      address: '0xB2f97c1Bd3bf02f5e74d13f02E3e26F93D77CE44', // cUSDCv3
      debtToken: TokensBook.scroll['0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4'],
    },
    {
      chain: ChainNames.optimism,
      protocol: ProtocolNames.compoundv3,
      version: LendingMarketVersions.isolated.compoundv3,
      birthday: 1712448000, // Sun Apr 07 2024 00:00:00 GMT+0000
      metric: DataMetrics.isolatedLending,
      address: '0x2e44e174f7D53F0212823acC11C01A11d58c5bCB', // cUSDCv3
      debtToken: TokensBook.optimism['0x0b2c639c533813f4aa9d7837caf62653d097ff85'],
    },
    {
      chain: ChainNames.optimism,
      protocol: ProtocolNames.compoundv3,
      version: LendingMarketVersions.isolated.compoundv3,
      birthday: 1716249600, // Tue May 21 2024 00:00:00 GMT+0000
      metric: DataMetrics.isolatedLending,
      address: '0x995e394b8b2437ac8ce61ee0bc610d617962b214', // cUSDTv3
      debtToken: TokensBook.optimism['0x94b008aa00579c1307b0ef2c499ad98a8ce58e58'],
    },
  ]),
};
