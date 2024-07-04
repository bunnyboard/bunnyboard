import { OracleSourceCurvePool } from '../../types/oracles';
import { TokensBook } from '../data';

export const OracleSourceCurveList: {
  [key: string]: OracleSourceCurvePool;
} = {
  MIM_METAPOOL: {
    type: 'curveMetaPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0x5a6a4d54456819380173272a5e8e9b9904bdf41b',
    baseToken: TokensBook.ethereum['0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0x6b175474e89094c44da98b954eedeac495271d0f'],
    quotaTokenIndex: 1,
  },
  GUSD_METAPOOL: {
    type: 'curveMetaPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0x4f062658eaaf2c1ccf8c8e36d6824cdf41167956',
    baseToken: TokensBook.ethereum['0x056fd409e1d7a124bd7017459dfea2f387b6d5cd'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0x6b175474e89094c44da98b954eedeac495271d0f'],
    quotaTokenIndex: 1,
  },
  mUSD_METAPOOL: {
    type: 'curveMetaPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0x8474ddbe98f5aa3179b3b3f5942d724afcdec9f6',
    baseToken: TokensBook.ethereum['0xe2f2a5c287993345a840db3b0845fbc70f5935a5'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0x6b175474e89094c44da98b954eedeac495271d0f'],
    quotaTokenIndex: 1,
  },
  mkUSD_USDC: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0xf980b4a4194694913af231de69ab4593f5e0fcdc',
    baseToken: TokensBook.ethereum['0x4591dbff62656e7859afe5e45f6f47d3669fbb28'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    quotaTokenIndex: 1,
  },
  ULTRA_USDC: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0xc03fef1c425956a3cd5762022e511e0d4148b3d6',
    baseToken: TokensBook.ethereum['0x35282d87011f87508d457f08252bc5bfa52e10a0'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    quotaTokenIndex: 1,
  },
};
