import { normalizeAddress } from '../../lib/utils';
import { AddressZero } from '../constants';
import AvalancheTokenList from '../tokenlists/avalanche.json';
import { CompoundProtocolConfig } from './compound';

export const BenqiConfigs: CompoundProtocolConfig = {
  protocol: 'benqi',
  lendingMarkets: [
    {
      chain: 'avalanche',
      protocol: 'benqi',
      version: 'compound',
      birthday: 1629331200, // Thu Aug 19 2021 00:00:00 GMT+0000
      address: normalizeAddress('0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c'),
      underlying: {
        chain: 'avalanche',
        symbol: 'AVAX',
        decimals: 18,
        address: AddressZero,
      },
    },
    {
      chain: 'avalanche',
      protocol: 'benqi',
      version: 'compound',
      birthday: 1656374400, // Tue Jun 28 2022 00:00:00 GMT+0000
      address: normalizeAddress('0x89a415b3D20098E6A6C8f7a59001C67BD3129821'),
      underlying: AvalancheTokenList['BTC.b'],
    },
    {
      chain: 'avalanche',
      protocol: 'benqi',
      version: 'compound',
      birthday: 1629331200, // Thu Aug 19 2021 00:00:00 GMT+0000
      address: normalizeAddress('0xe194c4c5aC32a3C9ffDb358d9Bfd523a0B6d1568'),
      underlying: AvalancheTokenList.WBTC,
    },
    {
      chain: 'avalanche',
      protocol: 'benqi',
      version: 'compound',
      birthday: 1629331200, // Thu Aug 19 2021 00:00:00 GMT+0000
      address: normalizeAddress('0x334AD834Cd4481BB02d09615E7c11a00579A7909'),
      underlying: AvalancheTokenList.WETH,
    },
    {
      chain: 'avalanche',
      protocol: 'benqi',
      version: 'compound',
      birthday: 1629331200, // Thu Aug 19 2021 00:00:00 GMT+0000
      address: normalizeAddress('0x4e9f683A27a6BdAD3FC2764003759277e93696e6'),
      underlying: AvalancheTokenList.LINK,
    },
    {
      chain: 'avalanche',
      protocol: 'benqi',
      version: 'compound',
      birthday: 1629331200, // Thu Aug 19 2021 00:00:00 GMT+0000
      address: normalizeAddress('0xc9e5999b8e75C3fEB117F6f73E664b9f3C8ca65C'),
      underlying: AvalancheTokenList['USDT.e'],
    },
    {
      chain: 'avalanche',
      protocol: 'benqi',
      version: 'compound',
      birthday: 1630368000, // Tue Aug 31 2021 00:00:00 GMT+0000
      address: normalizeAddress('0xBEb5d47A3f720Ec0a390d04b4d41ED7d9688bC7F'),
      underlying: AvalancheTokenList['USDC.e'],
    },
    {
      chain: 'avalanche',
      protocol: 'benqi',
      version: 'compound',
      birthday: 1649808000, // Wed Apr 13 2022 00:00:00 GMT+0000
      address: normalizeAddress('0xd8fcDa6ec4Bdc547C0827B8804e89aCd817d56EF'),
      underlying: AvalancheTokenList.USDt,
    },
    {
      chain: 'avalanche',
      protocol: 'benqi',
      version: 'compound',
      birthday: 1649808000, // Wed Apr 13 2022 00:00:00 GMT+0000
      address: normalizeAddress('0xB715808a78F6041E46d61Cb123C9B4A27056AE9C'),
      underlying: AvalancheTokenList.USDC,
    },
    {
      chain: 'avalanche',
      protocol: 'benqi',
      version: 'compound',
      birthday: 1629331200, // Thu Aug 19 2021 00:00:00 GMT+0000
      address: normalizeAddress('0x835866d37AFB8CB8F8334dCCdaf66cf01832Ff5D'),
      underlying: AvalancheTokenList.DAI,
    },
    {
      chain: 'avalanche',
      protocol: 'benqi',
      version: 'compound',
      birthday: 1666137600, // Wed Oct 19 2022 00:00:00 GMT+0000
      address: normalizeAddress('0x872670CcAe8C19557cC9443Eff587D7086b8043A'),
      underlying: AvalancheTokenList.BUSD,
    },
    {
      chain: 'avalanche',
      protocol: 'benqi',
      version: 'compound',
      birthday: 1631836800, // Fri Sep 17 2021 00:00:00 GMT+0000
      address: normalizeAddress('0x35Bd6aedA81a7E5FC7A7832490e71F757b0cD9Ce'),
      underlying: AvalancheTokenList.QI,
    },
  ],
};
