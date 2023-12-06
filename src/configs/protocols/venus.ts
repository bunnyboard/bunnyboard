import { normalizeAddress } from '../../lib/utils';
import { AddressZero } from '../constants';
import BnbchainTokenList from '../tokenlists/bnbchain.json';
import { CompoundProtocolConfig } from './compound';

export const VenusConfigs: CompoundProtocolConfig = {
  protocol: 'venus',
  comptrollers: {
    bnbchain: {
      chain: 'bnbchain',
      address: '0xfD36E2c2a6789Db23113685031d7F16329158384',
      governanceToken: BnbchainTokenList.XVS,
    },
  },
  lendingMarkets: [
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1630627200, // Fri Sep 03 2021 00:00:00 GMT+0000
      address: '0x26da28954763b92139ed49283625cecaf52c6f94',
      underlying: BnbchainTokenList.AAVE,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1613692800, // Fri Feb 19 2021 00:00:00 GMT+0000
      address: '0x9a0af7fdb2065ce470d72664de73cae409da28ec',
      underlying: BnbchainTokenList.ADA,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1607990400, // Tue Dec 15 2020 00:00:00 GMT+0000
      address: '0x5f0388ebc2b94fa8e123f404b79ccf5f40b29176',
      underlying: BnbchainTokenList.BCH,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1610409600, // Tue Jan 12 2021 00:00:00 GMT+0000
      address: '0x972207a639cc1b374b893cc33fa251b55ceb7c07',
      underlying: BnbchainTokenList.BETH,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1606176000, // Tue Nov 24 2020 00:00:00 GMT+0000
      address: '0xa07c5b74c9b40447a954e1466938b865b6bbea36',
      underlying: {
        chain: 'bnbchain',
        symbol: 'BNB',
        decimals: 18,
        address: AddressZero,
      },
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1607126400, // Sat Dec 05 2020 00:00:00 GMT+0000
      address: '0x882c173bc7ff3b7786ca16dfed3dfffb9ee7847b',
      underlying: BnbchainTokenList.BTCB,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1606176000, // Tue Nov 24 2020 00:00:00 GMT+0000
      address: normalizeAddress('0x95c78222B3D6e262426483D42CfA53685A67Ab9D'),
      underlying: BnbchainTokenList.BUSD,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1627344000, // Tue Jul 27 2021 00:00:00 GMT+0000
      address: normalizeAddress('0x86aC3974e2BD0d60825230fa6F355fF11409df5c'),
      underlying: BnbchainTokenList.CAKE,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1609977600, // Thu Jan 07 2021 00:00:00 GMT+0000
      address: normalizeAddress('0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1'),
      underlying: BnbchainTokenList.DAI,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1619136000, // Fri Apr 23 2021 00:00:00 GMT+0000
      address: normalizeAddress('0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71'),
      underlying: BnbchainTokenList.DOGE,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1607990400, // Tue Dec 15 2020 00:00:00 GMT+0000
      address: normalizeAddress('0x1610bc33319e9398de5f57B33a5b184c806aD217'),
      underlying: BnbchainTokenList.DOT,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1607126400, // Sat Dec 05 2020 00:00:00 GMT+0000
      address: normalizeAddress('0xf508fCD89b8bd15579dc79A6827cB4686A3592c8'),
      underlying: BnbchainTokenList.ETH,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1609977600, // Thu Jan 07 2021 00:00:00 GMT+0000
      address: normalizeAddress('0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343'),
      underlying: BnbchainTokenList.FIL,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1607990400, // Tue Dec 15 2020 00:00:00 GMT+0000
      address: normalizeAddress('0x650b940a1033B8A1b1873f78730FcFC73ec11f1f'),
      underlying: BnbchainTokenList.LINK,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1607126400, // Sat Dec 05 2020 00:00:00 GMT+0000
      address: normalizeAddress('0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B'),
      underlying: BnbchainTokenList.LTC,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1646956800, // Fri Mar 11 2022 00:00:00 GMT+0000
      address: normalizeAddress('0xb91A659E88B51474767CD97EF3196A3e7cEDD2c8'),
      underlying: {
        chain: 'bnbchain',
        symbol: 'LUNA',
        decimals: 18,
        address: '0x156ab3346823b651294766e23e6cf87254d68962',
      },
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1625875200, // Sat Jul 10 2021 00:00:00 GMT+0000
      address: normalizeAddress('0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8'),
      underlying: BnbchainTokenList.MATIC,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1606176000, // Tue Nov 24 2020 00:00:00 GMT+0000
      address: normalizeAddress('0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0'),
      underlying: BnbchainTokenList.SXP,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1677024000, // Wed Feb 22 2023 00:00:00 GMT+0000
      address: normalizeAddress('0xC5D3466aA484B040eE977073fcF337f2c00071c1'),
      underlying: {
        chain: 'bnbchain',
        symbol: 'TRX',
        decimals: 18,
        address: '0xce7de646e7208a4ef112cb6ed5038fa6cc6b12e3',
      },
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1637366400, // Sat Nov 20 2021 00:00:00 GMT+0000
      address: normalizeAddress('0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93'),
      underlying: BnbchainTokenList.TRX,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1686700800, // Wed Jun 14 2023 00:00:00 GMT+0000
      address: normalizeAddress('0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E'),
      underlying: BnbchainTokenList.TUSD,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1631577600, // Tue Sep 14 2021 00:00:00 GMT+0000
      address: normalizeAddress('0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3'),
      underlying: BnbchainTokenList.TUSD,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1698796800, // Wed Nov 01 2023 00:00:00 GMT+0000
      address: normalizeAddress('0x27FF564707786720C71A2e5c1490A63266683612'),
      underlying: BnbchainTokenList.UNI,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1606176000, // Tue Nov 24 2020 00:00:00 GMT+0000
      address: normalizeAddress('0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8'),
      underlying: BnbchainTokenList.USDC,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1606176000, // Tue Nov 24 2020 00:00:00 GMT+0000
      address: normalizeAddress('0xfD5840Cd36d94D7229439859C0112a4185BC0255'),
      underlying: BnbchainTokenList.USDT,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1646956800, // Fri Mar 11 2022 00:00:00 GMT+0000
      address: normalizeAddress('0x78366446547D062f45b4C0f320cDaa6d710D87bb'),
      underlying: BnbchainTokenList.UST,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1686873600, // Fri Jun 16 2023 00:00:00 GMT+0000
      address: normalizeAddress('0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0'),
      underlying: {
        chain: 'bnbchain',
        symbol: 'wBETH',
        decimals: 18,
        address: '0xa2e3356610840701bdf5611a53974510ae27e2e1',
      },
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1607126400, // Sat Dec 05 2020 00:00:00 GMT+0000
      address: normalizeAddress('0xB248a295732e0225acd3337607cc01068e3b9c10'),
      underlying: BnbchainTokenList.XRP,
    },
    {
      chain: 'bnbchain',
      protocol: 'venus',
      version: 'compound',
      birthday: 1606176000, // Tue Nov 24 2020 00:00:00 GMT+0000
      address: normalizeAddress('0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D'),
      underlying: BnbchainTokenList.XVS,
    },

    // isolated pools
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1687824000, // Tue Jun 27 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0xCa2D81AA7C09A1a025De797600A7081146dceEd9'),
    //   underlying: {
    //     chain: 'bnbchain',
    //     symbol: 'HAY',
    //     decimals: 18,
    //     address: '0x0782b6d8c4551b9760e74c0545a9bcd90bdc41e5',
    //   },
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1687824000, // Tue Jun 27 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0xc3a45ad8812189cAb659aD99E64B1376f6aCD035'),
    //   underlying: {
    //     chain: 'bnbchain',
    //     symbol: 'USDD',
    //     decimals: 18,
    //     address: '0xd17479997f34dd9156deef8f95a52d81d265be9c',
    //   },
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1687824000, // Tue Jun 27 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B'),
    //   underlying: BnbchainTokenList.USDT,
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1695945600, // Fri Sep 29 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0x795DE779Be00Ea46eA97a28BDD38d9ED570BCF0F'),
    //   underlying: BnbchainTokenList.agEUR,
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0x8f657dFD3a1354DEB4545765fE6840cc54AFd379'),
    //   underlying: {
    //     chain: 'bnbchain',
    //     symbol: 'BSW',
    //     decimals: 18,
    //     address: '0x965f527d9159dce6288a2219db51fc6eef120dd1',
    //   },
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0x02c5Fb0F26761093D297165e902e96D08576D344'),
    //   underlying: BnbchainTokenList.ALPACA,
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854'),
    //   underlying: BnbchainTokenList.USDT,
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0xA615467caE6B9E0bb98BC04B4411d9296fd1dFa0'),
    //   underlying: {
    //     chain: 'bnbchain',
    //     symbol: 'USDD',
    //     decimals: 18,
    //     address: '0xd17479997f34dd9156deef8f95a52d81d265be9c',
    //   },
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0x19CE11C8817a1828D1d357DFBF62dCf5b0B2A362'),
    //   underlying: BnbchainTokenList.ANKR,
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1693008000, // Sat Aug 26 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0x736bf1D21A28b5DC19A1aC8cA71Fc2856C23c03F'),
    //   underlying: BnbchainTokenList.TWT,
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1689724800, // Wed Jul 19 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0x53728FD51060a85ac41974C6C3Eb1DaE42776723'),
    //   underlying: {
    //     chain: 'bnbchain',
    //     symbol: 'ankrBNB',
    //     decimals: 18,
    //     address: '0x52f24a5e03aee338da5fd9df68d2b6fae1178827',
    //   },
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0xE5FE5527A5b76C75eedE77FdFA6B80D52444A465'),
    //   underlying: BnbchainTokenList.RACA,
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb'),
    //   underlying: BnbchainTokenList.FLOKI,
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0x4978591f17670A846137d9d613e333C38dc68A37'),
    //   underlying: BnbchainTokenList.USDT,
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0x9f2FD23bd0A5E08C5f2b9DD6CF9C96Bfb5fA515C'),
    //   underlying: {
    //     chain: 'bnbchain',
    //     symbol: 'USDD',
    //     decimals: 18,
    //     address: '0xd17479997f34dd9156deef8f95a52d81d265be9c',
    //   },
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f'),
    //   underlying: {
    //     chain: 'bnbchain',
    //     symbol: 'ankrBNB',
    //     decimals: 18,
    //     address: '0x52f24a5e03aee338da5fd9df68d2b6fae1178827',
    //   },
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791'),
    //   underlying: {
    //     chain: 'bnbchain',
    //     symbol: 'BNBx',
    //     decimals: 18,
    //     address: '0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275',
    //   },
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0xcc5D9e502574cda17215E70bC0B4546663785227'),
    //   underlying: {
    //     chain: 'bnbchain',
    //     symbol: 'stkBNB',
    //     decimals: 18,
    //     address: '0xc2e9d07f66a89c44062459a47a0d2dc038e4fb16',
    //   },
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1695772800, // Wed Sep 27 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A'),
    //   underlying: {
    //     chain: 'bnbchain',
    //     symbol: 'SnBNB',
    //     decimals: 18,
    //     address: '0xb0b84d294e0c75a6abe60171b70edeb2efd14a1b',
    //   },
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2'),
    //   underlying: BnbchainTokenList.WBNB,
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0x49c26e12959345472E2Fd95E5f79F8381058d3Ee'),
    //   underlying: {
    //     chain: 'bnbchain',
    //     symbol: 'BTT',
    //     decimals: 18,
    //     address: '0x352cb5e19b12fc216548a2677bd0fce83bae434b',
    //   },
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0x836beb2cB723C498136e1119248436A645845F4E'),
    //   underlying: {
    //     chain: 'bnbchain',
    //     symbol: 'TRX',
    //     decimals: 18,
    //     address: '0xce7de646e7208a4ef112cb6ed5038fa6cc6b12e3',
    //   },
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0xb114cfA615c828D88021a41bFc524B800E64a9D5'),
    //   underlying: {
    //     chain: 'bnbchain',
    //     symbol: 'WIN',
    //     decimals: 18,
    //     address: '0xaef0d72a118ce24fee3cd1d43d383897d05b4e99',
    //   },
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0xf1da185CCe5BeD1BeBbb3007Ef738Ea4224025F7'),
    //   underlying: {
    //     chain: 'bnbchain',
    //     symbol: 'USDD',
    //     decimals: 18,
    //     address: '0xd17479997f34dd9156deef8f95a52d81d265be9c',
    //   },
    // },
    // {
    //   chain: 'bnbchain',
    //   protocol: 'venus',
    //   version: 'compound',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   address: normalizeAddress('0x281E5378f99A4bc55b295ABc0A3E7eD32Deba059'),
    //   underlying: BnbchainTokenList.USDT,
    // },
  ],
};
