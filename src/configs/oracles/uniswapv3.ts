import { OracleSourcePool2 } from '../../types/oracles';
import { TokensBook } from '../data';

export const OracleSourceUniswapv3List: { [key: string]: OracleSourcePool2 } = {
  RAI_DAI: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xcb0c5d9d92f4f2f80cce7aa271a1e148c226e19d',
    baseToken: TokensBook.ethereum['0x03ab458634910aad20ef5f1c8ee96f1d6ac54919'],
    quotaToken: TokensBook.ethereum['0x6b175474e89094c44da98b954eedeac495271d0f'],
  },
  ENS_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x92560c178ce069cc014138ed3c2f5221ba71f58a',
    baseToken: TokensBook.ethereum['0xc18360217d8f7ab5e7c516566761ea12ce7f9d72'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  LUSD_USDC: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x4e0924d3a751be199c426d52fb1f2337fa96f736',
    baseToken: TokensBook.ethereum['0x5f98805a4e8be255a32880fdec7f6728c6568ba0'],
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
  },
  wstETH_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x109830a1aaad605bbf02a9dfa7b0b92ec2fb7daa',
    baseToken: TokensBook.ethereum['0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  cbETH_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x840deeef2f115cf50da625f7368c24af6fe74410',
    baseToken: TokensBook.ethereum['0xbe9895146f7af43049ca1c1ae358b0541ea49704'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  rETH_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xa4e0faa58465a2d369aa21b3e42d43374c6f9613',
    baseToken: TokensBook.ethereum['0xae78736cd615f374d3085123a210448e74fc6393'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  LDO_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xa3f558aebaecaf0e11ca4b2199cc5ed341edfd74',
    baseToken: TokensBook.ethereum['0x5a98fcbea516cf06857215779fd812ca3bef1b32'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  GHO_USDC: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x5c95d4b1c3321cf898d25949f41d50be2db5bc1d',
    baseToken: TokensBook.ethereum['0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f'],
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
  },
  RPL_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xe42318ea3b998e8355a3da364eb9d48ec725eb45',
    baseToken: TokensBook.ethereum['0xd33526068d116ce69f19a9ee46f0bd304f21a51f'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  STG_USDC: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x8592064903ef23d34e4d5aaaed40abf6d96af186',
    baseToken: TokensBook.ethereum['0xaf5191b0de278c7286d6c7cc6ab6bb8a73ba2cd6'],
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
  },
  EURS_USDC: {
    type: 'univ3',
    chain: 'polygon',
    address: '0xc9d0cae8343a2231b1647ab00e639eabdc766147',
    baseToken: TokensBook.polygon['0xe111178a87a3bff0c8d18decba5798827539ae99'],
    quotaToken: TokensBook.polygon['0x2791bca1f2de4661ed88a30c99a7a9449aa84174'],
  },
  agEUR_USDC: {
    type: 'univ3',
    chain: 'polygon',
    address: '0x3fa147d6309abeb5c1316f7d8a7d8bd023e0cd80',
    baseToken: TokensBook.polygon['0xe0b52e49357fd4daf2c15e02058dce6bc0057db4'],
    quotaToken: TokensBook.polygon['0x2791bca1f2de4661ed88a30c99a7a9449aa84174'],
  },
  SAI_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x8f9a0935b26097a1fc15d4919e0b9e466edc1c57',
    baseToken: TokensBook.ethereum['0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  OP_WETH: {
    type: 'univ3',
    chain: 'optimism',
    address: '0x68f5c0a2de713a54991e01858fd27a3832401849',
    baseToken: TokensBook.optimism['0x4200000000000000000000000000000000000042'],
    quotaToken: TokensBook.optimism['0x4200000000000000000000000000000000000006'],
  },
  stMATIC_WMATIC: {
    type: 'univ3',
    chain: 'polygon',
    address: '0x59db5ea66958b19641b6891fc373b44b567ea15c',
    baseToken: TokensBook.polygon['0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4'],
    quotaToken: TokensBook.polygon['0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'],
  },
  ARB_WETH: {
    type: 'univ3',
    chain: 'arbitrum',
    address: '0xc6f780497a95e246eb9449f5e4770916dcd6396a',
    baseToken: TokensBook.arbitrum['0x912ce59144191c1204e64559fe8253a0e49e6548'],
    quotaToken: TokensBook.arbitrum['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
  },
  wBETH_ETH: {
    type: 'univ3',
    chain: 'bnbchain',
    address: '0x379044e32f5a162233e82de19da852255d0951b8',
    baseToken: TokensBook.bnbchain['0xa2e3356610840701bdf5611a53974510ae27e2e1'],
    quotaToken: TokensBook.bnbchain['0x2170ed0880ac9a755fd29b2688956bd959f933f8'],
  },
  crvUSD_USDC: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x73ea3d8ba3d7380201b270ec504b33ed5e478542',
    baseToken: TokensBook.ethereum['0xf939e0a03fb07f59a73314e73794be0e57ac1b4e'],
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
  },
  RDNT_WETH: {
    type: 'univ3',
    chain: 'arbitrum',
    address: '0x446bf9748b4ea044dd759d9b9311c70491df8f29',
    baseToken: TokensBook.arbitrum['0x3082cc23568ea640225c2467653db90e9250aaa0'],
    quotaToken: TokensBook.arbitrum['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
  },
  FDUSD_USDT: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xcdfc3d54c8452b12285abb8c102df09ce83b8334',
    baseToken: TokensBook.ethereum['0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409'],
    quotaToken: TokensBook.ethereum['0xdac17f958d2ee523a2206206994597c13d831ec7'],
  },
  GMX_WETH: {
    type: 'univ3',
    chain: 'arbitrum',
    address: '0x1aeedd3727a6431b8f070c0afaa81cc74f273882',
    baseToken: TokensBook.arbitrum['0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a'],
    quotaToken: TokensBook.arbitrum['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
  },
  PYUSD_USDC: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x13394005c1012e708fce1eb974f1130fdc73a5ce',
    baseToken: TokensBook.ethereum['0x6c3ea9036406852006290770bedfcaba0e23a0e8'],
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
  },
};
