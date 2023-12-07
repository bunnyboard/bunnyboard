import AvalancheTokenList from '../tokenlists/avalanche.json';
import EthereumTokenList from '../tokenlists/ethereum.json';
import FantomTokenList from '../tokenlists/fantom.json';
import OptimismTokenList from '../tokenlists/optimism.json';
import { CompoundProtocolConfig } from './compound';

export const IronbankConfigs: CompoundProtocolConfig = {
  protocol: 'ironbank',
  comptrollers: {},
  lendingMarkets: [
    {
      chain: 'ethereum',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1607126400, // Sat Dec 05 2020 00:00:00 GMT+0000
      address: '0x41c84c0e2ee0b740cf0d31f63f3b6f627dc6b393',
      underlying: EthereumTokenList.WETH,
    },
    {
      chain: 'ethereum',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1607126400, // Sat Dec 05 2020 00:00:00 GMT+0000
      address: '0x8e595470ed749b85c6f7669de83eae304c2ec68f',
      underlying: EthereumTokenList.DAI,
    },
    {
      chain: 'ethereum',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1610928000, // Mon Jan 18 2021 00:00:00 GMT+0000
      address: '0xe7bff2da8a2f619c2586fb83938fa56ce803aa16',
      underlying: EthereumTokenList.LINK,
    },
    {
      chain: 'ethereum',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1610928000, // Mon Jan 18 2021 00:00:00 GMT+0000
      address: '0xfa3472f7319477c9bfecdd66e4b948569e7621b9',
      underlying: EthereumTokenList.YFI,
    },
    {
      chain: 'ethereum',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1610928000, // Mon Jan 18 2021 00:00:00 GMT+0000
      address: '0x12a9cc33a980daa74e00cc2d1a0e74c57a93d12c',
      underlying: EthereumTokenList.SNX,
    },
    {
      chain: 'ethereum',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1610928000, // Mon Jan 18 2021 00:00:00 GMT+0000
      address: '0x8fc8bfd80d6a9f17fb98a373023d72531792b431',
      underlying: EthereumTokenList.WBTC,
    },
    {
      chain: 'ethereum',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1611014400, // Tue Jan 19 2021 00:00:00 GMT+0000
      address: '0x48759f220ed983db51fa7a8c0d2aab8f3ce4166a',
      underlying: EthereumTokenList.USDT,
    },
    {
      chain: 'ethereum',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1611014400, // Tue Jan 19 2021 00:00:00 GMT+0000
      address: '0x76eb2fe28b36b3ee97f3adae0c69606eedb2a37c',
      underlying: EthereumTokenList.USDC,
    },
    {
      chain: 'ethereum',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1613779200, // Sat Feb 20 2021 00:00:00 GMT+0000
      address: '0xa7c4054afd3dbbbf5bfe80f41862b89ea05c9806',
      underlying: EthereumTokenList.sUSD,
    },
    {
      chain: 'ethereum',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1611014400, // Tue Jan 19 2021 00:00:00 GMT+0000
      address: '0xa8caea564811af0e92b1e044f3edd18fa9a73e4f',
      underlying: EthereumTokenList.EURS,
    },
    {
      chain: 'ethereum',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1611014400, // Tue Jan 19 2021 00:00:00 GMT+0000
      address: '0xca55f9c4e77f7b8524178583b0f7c798de17fd54',
      underlying: EthereumTokenList.sEUR,
    },
    {
      chain: 'ethereum',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1611619200, // Tue Jan 26 2021 00:00:00 GMT+0000
      address: '0x7736ffb07104c0c400bb0cc9a7c228452a732992',
      underlying: EthereumTokenList.DPI,
    },
    {
      chain: 'ethereum',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1620777600, // Wed May 12 2021 00:00:00 GMT+0000
      address: '0xfeeb92386a055e2ef7c2b598c872a4047a7db59f',
      underlying: EthereumTokenList.UNI,
    },
    {
      chain: 'ethereum',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1620777600, // Wed May 12 2021 00:00:00 GMT+0000
      address: '0x226f3738238932ba0db2319a8117d9555446102f',
      underlying: EthereumTokenList.SUSHI,
    },
    {
      chain: 'ethereum',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1631577600, // Tue Sep 14 2021 00:00:00 GMT+0000
      address: '0xb8c5af54bbdcc61453144cf472a9276ae36109f9',
      underlying: EthereumTokenList.CRV,
    },
    {
      chain: 'ethereum',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1631577600, // Tue Sep 14 2021 00:00:00 GMT+0000
      address: '0x30190a3b52b5ab1daf70d46d72536f5171f22340',
      underlying: EthereumTokenList.AAVE,
    },
    {
      chain: 'ethereum',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1635206400, // Tue Oct 26 2021 00:00:00 GMT+0000
      address: '0x9e8e207083ffd5bdc3d99a1f32d1e6250869c1a9',
      underlying: EthereumTokenList.MIM,
    },
    {
      chain: 'ethereum',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1648684800, // Thu Mar 31 2022 00:00:00 GMT+0000
      address: '0xe0b57feed45e7d908f2d0dacd26f113cf26715bf',
      underlying: EthereumTokenList.CVX,
    },

    // optimism
    {
      chain: 'optimism',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1655942400, // Thu Jun 23 2022 00:00:00 GMT+0000
      address: '0x17533a1bde957979e3977ebbfbc31e6deeb25c7d',
      underlying: OptimismTokenList.WETH,
    },
    {
      chain: 'optimism',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1655942400, // Thu Jun 23 2022 00:00:00 GMT+0000
      address: '0x1d073cf59ae0c169cbc58b6fdd518822ae89173a',
      underlying: OptimismTokenList.USDC,
    },
    {
      chain: 'optimism',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1655942400, // Thu Jun 23 2022 00:00:00 GMT+0000
      address: '0x874c01c2d1767efa01fa54b2ac16be96fad5a742',
      underlying: OptimismTokenList.USDT,
    },
    {
      chain: 'optimism',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1655942400, // Thu Jun 23 2022 00:00:00 GMT+0000
      address: '0x049e04bee77cffb055f733a138a2f204d3750283',
      underlying: OptimismTokenList.DAI,
    },
    {
      chain: 'optimism',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1655942400, // Thu Jun 23 2022 00:00:00 GMT+0000
      address: '0xcdb9b4db65c913ab000b40204248c8a53185d14d',
      underlying: OptimismTokenList.WBTC,
    },
    {
      chain: 'optimism',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1655942400, // Thu Jun 23 2022 00:00:00 GMT+0000
      address: '0x4645e0952678e9566fb529d9313f5730e4e1c412',
      underlying: OptimismTokenList.OP,
    },
    {
      chain: 'optimism',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1658448000, // Fri Jul 22 2022 00:00:00 GMT+0000
      address: '0xe724ffa5d30782499086682c8362cb3673bf69ae',
      underlying: OptimismTokenList.SNX,
    },
    {
      chain: 'optimism',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1658448000, // Fri Jul 22 2022 00:00:00 GMT+0000
      address: '0x04f0fd3cd03b17a3e5921c0170ca6dd3952841ca',
      underlying: OptimismTokenList.sUSD,
    },

    // fantom
    {
      chain: 'fantom',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1614124800, // Wed Feb 24 2021 00:00:00 GMT+0000
      address: '0xd528697008ac67a21818751a5e3c58c8dae54696',
      underlying: FantomTokenList.WFTM,
    },
    {
      chain: 'fantom',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1614124800, // Wed Feb 24 2021 00:00:00 GMT+0000
      address: '0xcc3e89fbc10e155f1164f8c9cf0703acde53f6fd',
      underlying: FantomTokenList.anyWETH,
    },
    {
      chain: 'fantom',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1614124800, // Wed Feb 24 2021 00:00:00 GMT+0000
      address: '0x20ca53e2395fa571798623f1cfbd11fe2c114c24',
      underlying: FantomTokenList.BTC,
    },
    {
      chain: 'fantom',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1614124800, // Wed Feb 24 2021 00:00:00 GMT+0000
      address: '0x04c762a5df2fa02fe868f25359e0c259fb811cfe',
      underlying: FantomTokenList.DAI,
    },
    {
      chain: 'fantom',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1614124800, // Wed Feb 24 2021 00:00:00 GMT+0000
      address: '0x328a7b4d538a2b3942653a9983fda3c12c571141',
      underlying: FantomTokenList.anyUSDC,
    },
    {
      chain: 'fantom',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1614124800, // Wed Feb 24 2021 00:00:00 GMT+0000
      address: '0x0980f2f0d2af35ef2c4521b2342d59db575303f7',
      underlying: FantomTokenList.anyYFI,
    },
    {
      chain: 'fantom',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1614124800, // Wed Feb 24 2021 00:00:00 GMT+0000
      address: '0xb1fd648d8ca4be22445963554b85abbfc210bc83',
      underlying: FantomTokenList.SUSHI,
    },
    {
      chain: 'fantom',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1614124800, // Wed Feb 24 2021 00:00:00 GMT+0000
      address: '0x79ea17bee0a8dcb900737e8caa247c8358a5dfa1',
      underlying: FantomTokenList.AAVE,
    },
    {
      chain: 'fantom',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1614124800, // Wed Feb 24 2021 00:00:00 GMT+0000
      address: '0x4eceddf62277ed78623f9a94995c680f8fd6c00e',
      underlying: FantomTokenList.LINK,
    },
    {
      chain: 'fantom',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1614124800, // Wed Feb 24 2021 00:00:00 GMT+0000
      address: '0x1cc6cf8455f7783980b1ee06ecd4ed9acd94e1c7',
      underlying: FantomTokenList.SNX,
    },
    {
      chain: 'fantom',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1631750400, // Thu Sep 16 2021 00:00:00 GMT+0000
      address: '0x70fac71debfd67394d1278d98a29dea79dc6e57a',
      underlying: FantomTokenList.fUSDT,
    },
    {
      chain: 'fantom',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1632787200, // Tue Sep 28 2021 00:00:00 GMT+0000
      address: '0x46f298d5bb6389ccb6c1366bb0c8a30892ca2f7c',
      underlying: FantomTokenList.MIM,
    },
    {
      chain: 'fantom',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1642809600, // Sat Jan 22 2022 00:00:00 GMT+0000
      address: '0x2919ec3e7b35fb0c8597a5f806fb1f59c540eab4',
      underlying: FantomTokenList.FRAX,
    },
    {
      chain: 'fantom',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1642809600, // Sat Jan 22 2022 00:00:00 GMT+0000
      address: '0x28192abdb1d6079767ab3730051c7f9ded06fe46',
      underlying: {
        chain: 'fantom',
        symbol: 'TUSD',
        decimals: 18,
        address: '0x9879abdea01a879644185341f7af7d8343556b7a',
      },
    },
    {
      chain: 'fantom',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1642809600, // Sat Jan 22 2022 00:00:00 GMT+0000
      address: '0xf13252c1044aa83b910c77322e67387e187f64ca',
      underlying: {
        chain: 'fantom',
        symbol: 'UST',
        decimals: 6,
        address: '0xe2d27f06f63d98b8e11b38b5b08a75d0c8dd62b9',
      },
    },

    // avalanche
    {
      chain: 'avalanche',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1633737600, // Sat Oct 09 2021 00:00:00 GMT+0000
      address: '0xb3c68d69e95b095ab4b33b4cb67dbc0fbf3edf56',
      underlying: AvalancheTokenList.WAVAX,
    },
    {
      chain: 'avalanche',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1634083200, // Wed Oct 13 2021 00:00:00 GMT+0000
      address: '0x338eee1f7b89ce6272f302bdc4b952c13b221f1d',
      underlying: AvalancheTokenList['WETH.e'],
    },
    {
      chain: 'avalanche',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1634083200, // Wed Oct 13 2021 00:00:00 GMT+0000
      address: '0xceb1ce674f38398432d20bc8f90345e91ef46fd3',
      underlying: AvalancheTokenList['USDT.e'],
    },
    {
      chain: 'avalanche',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1666137600, // Wed Oct 19 2022 00:00:00 GMT+0000
      address: '0x3af7c11d112c1c730e5cee339ca5b48f9309acbc',
      underlying: AvalancheTokenList.USDT,
    },
    {
      chain: 'avalanche',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1634083200, // Wed Oct 13 2021 00:00:00 GMT+0000
      address: '0xe28965073c49a02923882b8329d3e8c1d805e832',
      underlying: AvalancheTokenList['USDC.e'],
    },
    {
      chain: 'avalanche',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1640131200, // Wed Dec 22 2021 00:00:00 GMT+0000
      address: '0xec5aa19566aa442c8c50f3c6734b6bb23ff21cd7',
      underlying: AvalancheTokenList.USDC,
    },
    {
      chain: 'avalanche',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1634083200, // Wed Oct 13 2021 00:00:00 GMT+0000
      address: '0x085682716f61a72bf8c573fbaf88cca68c60e99b',
      underlying: AvalancheTokenList['DAI.e'],
    },
    {
      chain: 'avalanche',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1634083200, // Wed Oct 13 2021 00:00:00 GMT+0000
      address: '0xb09b75916c5f4097c8b5812e63e216fef97661fc',
      underlying: AvalancheTokenList['WBTC.e'],
    },
    {
      chain: 'avalanche',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1634083200, // Wed Oct 13 2021 00:00:00 GMT+0000
      address: '0x18931772adb90e7f214b6cbc78ddd6e0f090d4b1',
      underlying: AvalancheTokenList['LINK.e'],
    },
    {
      chain: 'avalanche',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1643068800, // Tue Jan 25 2022 00:00:00 GMT+0000
      address: '0xbf1430d9ec170b7e97223c7f321782471c587b29',
      underlying: AvalancheTokenList.MIM,
    },
    {
      chain: 'avalanche',
      protocol: 'ironbank',
      type: 'cross',
      version: 'compound',
      birthday: 1644451200, // Thu Feb 10 2022 00:00:00 GMT+0000
      address: '0x02c9133627a14214879175a7a222d0a7f7404efb',
      underlying: AvalancheTokenList.ALPHA,
    },
  ],
};
