import { LendingCdpConfig, LendingMarketConfig, ProtocolConfig, Token } from '../../types/configs';
import ArbitrumTokenList from '../tokenlists/arbitrum.json';
import BaseTokenList from '../tokenlists/base.json';
import EthereumTokenList from '../tokenlists/ethereum.json';
import PolygonTokenList from '../tokenlists/polygon.json';

export interface CompoundLendingMarketConfig extends LendingMarketConfig {
  underlying: Token;
}

export interface CompoundComptroller {
  chain: string;
  address: string;
  governanceToken: Token;
}

export interface CompoundProtocolConfig extends ProtocolConfig {
  comptrollers: {
    // chain => Comptroller
    [key: string]: CompoundComptroller;
  };
  lendingMarkets: Array<CompoundLendingMarketConfig>;
}

export const CompoundConfigs: CompoundProtocolConfig = {
  protocol: 'compound',
  comptrollers: {
    ethereum: {
      chain: 'ethereum',
      address: '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b',
      governanceToken: {
        chain: 'ethereum',
        symbol: 'COMP',
        decimals: 18,
        address: '0xc00e94cb662c3520282e6f5717214004a7f26888',
      },
    },
  },
  lendingMarkets: [
    {
      chain: 'ethereum',
      protocol: 'compound',
      version: 'compound',
      birthday: 1557273600, // Wed May 08 2019 00:00:00 GMT+0000
      address: '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5',
      underlying: {
        chain: 'ethereum',
        symbol: 'ETH',
        decimals: 18,
        address: '0x0000000000000000000000000000000000000000',
      },
    },
    {
      protocol: 'compound',
      chain: 'ethereum',
      version: 'compound',
      address: '0xe65cdb6479bac1e22340e4e755fae7e509ecd06c',
      birthday: 1626652800, // Mon Jul 19 2021 00:00:00 GMT+0000
      underlying: {
        chain: 'ethereum',
        symbol: 'AAVE',
        decimals: 18,
        address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
      },
    },
    {
      protocol: 'compound',
      chain: 'ethereum',
      version: 'compound',
      address: '0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e',
      birthday: 1557273600, // Wed May 08 2019 00:00:00 GMT+0000
      underlying: EthereumTokenList.BAT,
    },
    {
      protocol: 'compound',
      chain: 'ethereum',
      version: 'compound',
      address: '0x70e36f6bf80a52b3b46b3af8e106cc0ed743e8e4',
      birthday: 1601424000, // Wed Sep 30 2020 00:00:00 GMT+0000
      underlying: EthereumTokenList.COMP,
    },
    {
      protocol: 'compound',
      chain: 'ethereum',
      version: 'compound',
      address: '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643',
      birthday: 1574553600, // Sun Nov 24 2019 00:00:00 GMT+0000
      underlying: EthereumTokenList.DAI,
    },
    {
      protocol: 'compound',
      chain: 'ethereum',
      version: 'compound',
      address: '0x7713dd9ca933848f6819f38b8352d9a15ea73f67',
      birthday: 1631750400, // Thu Sep 16 2021 00:00:00 GMT+0000
      underlying: EthereumTokenList.FEI,
    },
    {
      protocol: 'compound',
      chain: 'ethereum',
      version: 'compound',
      address: '0xface851a4921ce59e912d19329929ce6da6eb0c7',
      birthday: 1619049600, // Thu Apr 22 2021 00:00:00 GMT+0000
      underlying: EthereumTokenList.LINK,
    },
    {
      protocol: 'compound',
      chain: 'ethereum',
      version: 'compound',
      address: '0x95b4ef2869ebd94beb4eee400a99824bf5dc325b',
      birthday: 1626480000, // Sat Jul 17 2021 00:00:00 GMT+0000
      underlying: EthereumTokenList.MKR,
    },
    {
      protocol: 'compound',
      chain: 'ethereum',
      version: 'compound',
      address: '0x158079ee67fce2f58472a96584a73c7ab9ac95c1',
      birthday: 1557273600, // Wed May 08 2019 00:00:00 GMT+0000
      underlying: EthereumTokenList.REP,
    },
    {
      protocol: 'compound',
      chain: 'ethereum',
      version: 'compound',
      address: '0xf5dce57282a584d2746faf1593d3121fcac444dc',
      birthday: 1557273600, // Wed May 08 2019 00:00:00 GMT+0000
      underlying: EthereumTokenList.SAI,
    },
    {
      protocol: 'compound',
      chain: 'ethereum',
      version: 'compound',
      address: '0x4b0181102a0112a2ef11abee5563bb4a3176c9d7',
      birthday: 1626652800, // Mon Jul 19 2021 00:00:00 GMT+0000
      underlying: EthereumTokenList.SUSHI,
    },
    {
      protocol: 'compound',
      chain: 'ethereum',
      version: 'compound',
      address: '0x12392f67bdf24fae0af363c24ac620a2f67dad86',
      birthday: 1602115200, // Thu Oct 08 2020 00:00:00 GMT+0000
      underlying: EthereumTokenList.TUSD,
    },
    {
      protocol: 'compound',
      chain: 'ethereum',
      version: 'compound',
      address: '0x35a18000230da775cac24873d00ff85bccded550',
      birthday: 1600905600, // Thu Sep 24 2020 00:00:00 GMT+0000
      underlying: EthereumTokenList.UNI,
    },
    {
      protocol: 'compound',
      chain: 'ethereum',
      version: 'compound',
      address: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
      birthday: 1557273600, // Wed May 08 2019 00:00:00 GMT+0000
      underlying: EthereumTokenList.USDC,
    },
    {
      protocol: 'compound',
      chain: 'ethereum',
      version: 'compound',
      address: '0x041171993284df560249b57358f931d9eb7b925d',
      birthday: 1632096000, // Mon Sep 20 2021 00:00:00 GMT+0000
      underlying: EthereumTokenList.PAX,
    },
    {
      protocol: 'compound',
      chain: 'ethereum',
      version: 'compound',
      address: '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9',
      birthday: 1586995200, // Thu Apr 16 2020 00:00:00 GMT+0000
      underlying: EthereumTokenList.USDT,
    },
    {
      protocol: 'compound',
      chain: 'ethereum',
      version: 'compound',
      address: '0xc11b1268c1a384e55c48c2391d8d480264a3a7f4',
      birthday: 1563321600, // Wed Jul 17 2019 00:00:00 GMT+0000
      underlying: EthereumTokenList.WBTC,
    },
    {
      protocol: 'compound',
      chain: 'ethereum',
      version: 'compound',
      address: '0xccf4429db6322d5c611ee964527d42e5d685dd6a',
      birthday: 1615766400, // Mon Mar 15 2021 00:00:00 GMT+0000
      underlying: EthereumTokenList.WBTC,
    },
    {
      protocol: 'compound',
      chain: 'ethereum',
      version: 'compound',
      address: '0x80a2ae356fc9ef4305676f7a3e2ed04e12c33946',
      birthday: 1626652800, // Mon Jul 19 2021 00:00:00 GMT+0000
      underlying: EthereumTokenList.YFI,
    },
    {
      protocol: 'compound',
      chain: 'ethereum',
      version: 'compound',
      address: '0xb3319f5d18bc0d84dd1b4825dcde5d5f7266d407',
      birthday: 1557273600, // Wed May 08 2019 00:00:00 GMT+0000
      underlying: EthereumTokenList.ZRX,
    },
  ],
};

export interface Compoundv3MarketConfig extends LendingCdpConfig {
  address: string;
}

export interface Compoundv3Config extends ProtocolConfig {
  lendingCdps: Array<Compoundv3MarketConfig>;
}

export const Compoundv3Configs: Compoundv3Config = {
  protocol: 'compoundv3',
  lendingCdps: [
    {
      chain: 'ethereum',
      protocol: 'compoundv3',
      version: 'compoundv3',
      birthday: 1660521600, // Mon Aug 15 2022 00:00:00 GMT+0000
      debtToken: EthereumTokenList.USDC,
      address: '0xc3d688b66703497daa19211eedff47f25384cdc3', // USDC market
    },
    {
      chain: 'ethereum',
      protocol: 'compoundv3',
      version: 'compoundv3',
      birthday: 1673654400, // Sat Jan 14 2023 00:00:00 GMT+0000
      debtToken: EthereumTokenList.WETH,
      address: '0xa17581a9e3356d9a858b789d68b4d866e593ae94', // WETH market
    },
    {
      chain: 'arbitrum',
      protocol: 'compoundv3',
      version: 'compoundv3',
      birthday: 1683244800, // Fri May 05 2023 00:00:00 GMT+0000
      debtToken: ArbitrumTokenList['USDC.e'],
      address: '0xa5edbdd9646f8dff606d7448e414884c7d905dca', // USDC
    },
    {
      chain: 'arbitrum',
      protocol: 'compoundv3',
      version: 'compoundv3',
      birthday: 1692230400, // Thu Aug 17 2023 00:00:00 GMT+0000
      debtToken: ArbitrumTokenList.USDC,
      address: '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf', // USDC
    },
    {
      chain: 'base',
      protocol: 'compoundv3',
      version: 'compoundv3',
      birthday: 1691193600, // Sat Aug 05 2023 00:00:00 GMT+0000
      debtToken: BaseTokenList.USDbC,
      address: '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf', // USDC
    },
    {
      chain: 'base',
      protocol: 'compoundv3',
      version: 'compoundv3',
      birthday: 1691798400, // Sat Aug 12 2023 00:00:00 GMT+0000
      debtToken: BaseTokenList.USDC,
      address: '0x46e6b214b524310239732d51387075e0e70970bf', // USDC
    },
    {
      chain: 'polygon',
      protocol: 'compoundv3',
      version: 'compoundv3',
      birthday: 1676764800, // Sun Feb 19 2023 00:00:00 GMT+0000
      debtToken: PolygonTokenList['USDC.e'],
      address: '0xf25212e676d1f7f89cd72ffee66158f541246445', // USDC.e
    },
  ],
};
