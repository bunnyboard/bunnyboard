import { normalizeAddress } from '../../lib/utils';
import BaseTokenList from '../tokenlists/base.json';
import OptimismTokenList from '../tokenlists/optimism.json';
import { CompoundProtocolConfig } from './compound';

export const SonneConfigs: CompoundProtocolConfig = {
  protocol: 'sonne',
  lendingMarkets: [
    {
      chain: 'optimism',
      protocol: 'sonne',
      version: 'compound',
      birthday: 1664409600, // Thu Sep 29 2022 00:00:00 GMT+0000
      address: normalizeAddress('0xf7B5965f5C117Eb1B5450187c9DcFccc3C317e8E'),
      underlying: OptimismTokenList.WETH,
    },
    {
      chain: 'optimism',
      protocol: 'sonne',
      version: 'compound',
      birthday: 1664409600, // Thu Sep 29 2022 00:00:00 GMT+0000
      address: normalizeAddress('0x5569b83de187375d43FBd747598bfe64fC8f6436'),
      underlying: OptimismTokenList.DAI,
    },
    {
      chain: 'optimism',
      protocol: 'sonne',
      version: 'compound',
      birthday: 1664409600, // Thu Sep 29 2022 00:00:00 GMT+0000
      address: normalizeAddress('0xEC8FEa79026FfEd168cCf5C627c7f486D77b765F'),
      underlying: OptimismTokenList['USDC.e'],
    },
    {
      chain: 'optimism',
      protocol: 'sonne',
      version: 'compound',
      birthday: 1664409600, // Thu Sep 29 2022 00:00:00 GMT+0000
      address: normalizeAddress('0x5Ff29E4470799b982408130EFAaBdeeAE7f66a10'),
      underlying: OptimismTokenList.USDT,
    },
    {
      chain: 'optimism',
      protocol: 'sonne',
      version: 'compound',
      birthday: 1664409600, // Thu Sep 29 2022 00:00:00 GMT+0000
      address: normalizeAddress('0x8cD6b19A07d754bF36AdEEE79EDF4F2134a8F571'),
      underlying: OptimismTokenList.OP,
    },
    {
      chain: 'optimism',
      protocol: 'sonne',
      version: 'compound',
      birthday: 1664409600, // Thu Sep 29 2022 00:00:00 GMT+0000
      address: normalizeAddress('0xd14451E0Fa44B18f08aeB1E4a4d092B823CaCa68'),
      underlying: OptimismTokenList.sUSD,
    },
    {
      chain: 'optimism',
      protocol: 'sonne',
      version: 'compound',
      birthday: 1667088000, // Sun Oct 30 2022 00:00:00 GMT+0000
      address: normalizeAddress('0xD7dAabd899D1fAbbC3A9ac162568939CEc0393Cc'),
      underlying: OptimismTokenList.SNX,
    },
    {
      chain: 'optimism',
      protocol: 'sonne',
      version: 'compound',
      birthday: 1670112000, // Sun Dec 04 2022 00:00:00 GMT+0000
      address: normalizeAddress('0x33865E09A572d4F1CC4d75Afc9ABcc5D3d4d867D'),
      underlying: OptimismTokenList.WBTC,
    },
    {
      chain: 'optimism',
      protocol: 'sonne',
      version: 'compound',
      birthday: 1675382400, // Fri Feb 03 2023 00:00:00 GMT+0000
      address: normalizeAddress('0xAFdf91f120DEC93c65fd63DBD5ec372e5dcA5f82'),
      underlying: OptimismTokenList.LUSD,
    },
    {
      chain: 'optimism',
      protocol: 'sonne',
      version: 'compound',
      birthday: 1676851200, // Mon Feb 20 2023 00:00:00 GMT+0000
      address: normalizeAddress('0x26AaB17f27CD1c8d06a0Ad8E4a1Af8B1032171d5'),
      underlying: OptimismTokenList.wstETH,
    },
    {
      chain: 'optimism',
      protocol: 'sonne',
      version: 'compound',
      birthday: 1688428800, // Tue Jul 04 2023 00:00:00 GMT+0000
      address: normalizeAddress('0xE7De932d50EfC9ea0a7a409Fc015B4f71443528e'),
      underlying: OptimismTokenList.MAI,
    },

    // base
    {
      chain: 'base',
      protocol: 'sonne',
      version: 'compound',
      birthday: 1691798400, // Sat Aug 12 2023 00:00:00 GMT+0000
      address: normalizeAddress('0x5F5c479fe590cD4442A05aE4a941dd991A633B8E'),
      underlying: BaseTokenList.WETH,
    },
    {
      chain: 'base',
      protocol: 'sonne',
      version: 'compound',
      birthday: 1691798400, // Sat Aug 12 2023 00:00:00 GMT+0000
      address: normalizeAddress('0xb864BA2aab1f53BC3af7AE49a318202dD3fd54C2'),
      underlying: BaseTokenList.DAI,
    },
    {
      chain: 'base',
      protocol: 'sonne',
      version: 'compound',
      birthday: 1691798400, // Sat Aug 12 2023 00:00:00 GMT+0000
      address: normalizeAddress('0x225886C9beb5eeE254F79d58bbD80cf9F200D4d0'),
      underlying: BaseTokenList.USDbC,
    },
    {
      chain: 'base',
      protocol: 'sonne',
      version: 'compound',
      birthday: 1694476800, // Tue Sep 12 2023 00:00:00 GMT+0000
      address: normalizeAddress('0xfd68F92B45b633bbe0f475294C1A86aecD62985A'),
      underlying: BaseTokenList.USDC,
    },
  ],
};
