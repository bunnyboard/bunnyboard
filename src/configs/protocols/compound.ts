import { normalizeAddress } from '../../lib/utils';
import { DataMetrics, LendingMarketConfig, ProtocolConfig, Token } from '../../types/configs';

export interface CompoundLendingMarketConfig extends LendingMarketConfig {
  governanceToken: Token | null;
  underlying: {
    // contract address => underlying token
    [key: string]: Token;
  };
  blacklists?: {
    [key: string]: boolean;
  };
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
    };
  });
}

export const CompoundConfigs: CompoundProtocolConfig = {
  protocol: 'compound',
  configs: formatCompoundLendingMarketConfig([
    {
      chain: 'ethereum',
      protocol: 'compound',
      type: 'cross',
      version: 'compound',
      metric: DataMetrics.lending,
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
    },
  ]),
};

// export const Compoundv3Configs: ProtocolConfig = {
//   protocol: 'compoundv3',
//   lendingMarkets: [
//     {
//       chain: 'ethereum',
//       protocol: 'compoundv3',
//       type: ' cdp',
//       version: 'compoundv3',
//       birthday: 1660521600, // Mon Aug 15 2022 00:00:00 GMT+0000
//       debtToken: EthereumTokenList.USDC,
//       address: '0xc3d688b66703497daa19211eedff47f25384cdc3', // USDC market
//     },
//     {
//       chain: 'ethereum',
//       protocol: 'compoundv3',
//       type: ' cdp',
//       version: 'compoundv3',
//       birthday: 1673654400, // Sat Jan 14 2023 00:00:00 GMT+0000
//       debtToken: EthereumTokenList.WETH,
//       address: '0xa17581a9e3356d9a858b789d68b4d866e593ae94', // WETH market
//     },
//     {
//       chain: 'arbitrum',
//       protocol: 'compoundv3',
//       type: ' cdp',
//       version: 'compoundv3',
//       birthday: 1683244800, // Fri May 05 2023 00:00:00 GMT+0000
//       debtToken: ArbitrumTokenList['USDC.e'],
//       address: '0xa5edbdd9646f8dff606d7448e414884c7d905dca', // USDC
//     },
//     {
//       chain: 'arbitrum',
//       protocol: 'compoundv3',
//       type: ' cdp',
//       version: 'compoundv3',
//       birthday: 1692230400, // Thu Aug 17 2023 00:00:00 GMT+0000
//       debtToken: ArbitrumTokenList.USDC,
//       address: '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf', // USDC
//     },
//     {
//       chain: 'base',
//       protocol: 'compoundv3',
//       type: ' cdp',
//       version: 'compoundv3',
//       birthday: 1691193600, // Sat Aug 05 2023 00:00:00 GMT+0000
//       debtToken: BaseTokenList.USDbC,
//       address: '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf', // USDC
//     },
//     {
//       chain: 'base',
//       protocol: 'compoundv3',
//       type: ' cdp',
//       version: 'compoundv3',
//       birthday: 1691798400, // Sat Aug 12 2023 00:00:00 GMT+0000
//       debtToken: BaseTokenList.USDC,
//       address: '0x46e6b214b524310239732d51387075e0e70970bf', // USDC
//     },
//     {
//       chain: 'polygon',
//       protocol: 'compoundv3',
//       type: ' cdp',
//       version: 'compoundv3',
//       birthday: 1676764800, // Sun Feb 19 2023 00:00:00 GMT+0000
//       debtToken: PolygonTokenList['USDC.e'],
//       address: '0xf25212e676d1f7f89cd72ffee66158f541246445', // USDC.e
//     },
//   ],
// };
