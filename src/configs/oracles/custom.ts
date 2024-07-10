import { OracleSourceMakerRwaPip, OracleSourceSavingDai, OracleSourceStakingTokenWrapper } from '../../types/oracles';
import { TokensBook } from '../data';

export const OracleSourceCustomList: {
  [key: string]: OracleSourceSavingDai | OracleSourceMakerRwaPip | OracleSourceStakingTokenWrapper;
} = {
  SAVING_DAI: {
    type: 'savingDai',
    chain: 'ethereum',
    address: '0x83F20F44975D03b1b09e64809B757c47f942BEeA',
    token: TokensBook.ethereum['0x6b175474e89094c44da98b954eedeac495271d0f'],
  },
  SAVING_xDAI: {
    type: 'savingDai',
    chain: 'gnosis',
    address: '0xaf204776c7245bf4147c2612bf6e5972ee483701',
    token: TokensBook.gnosis['0xe91d153e0b41518a2ce8dd3d7944fa863463a97d'],
  },
  MAKER_RWA001: {
    type: 'makerRwaPip',
    chain: 'ethereum',
    address: '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b',
    token: TokensBook.ethereum['0x10b2aa5d77aa6484886d8e244f0686ab319a270d'],
    ilk: '0x5257413030312d41000000000000000000000000000000000000000000000000',
  },
  MAKER_RWA002: {
    type: 'makerRwaPip',
    chain: 'ethereum',
    address: '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b',
    token: TokensBook.ethereum['0xaaa760c2027817169d7c8db0dc61a2fb4c19ac23'],
    ilk: '0x5257413030322d41000000000000000000000000000000000000000000000000',
  },
  MAKER_RWA003: {
    type: 'makerRwaPip',
    chain: 'ethereum',
    address: '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b',
    token: TokensBook.ethereum['0x07f0a80ad7aeb7bfb7f139ea71b3c8f7e17156b9'],
    ilk: '0x5257413030332d41000000000000000000000000000000000000000000000000',
  },
  MAKER_RWA004: {
    type: 'makerRwaPip',
    chain: 'ethereum',
    address: '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b',
    token: TokensBook.ethereum['0x873f2101047a62f84456e3b2b13df2287925d3f9'],
    ilk: '0x5257413030342d41000000000000000000000000000000000000000000000000',
  },
  MAKER_RWA005: {
    type: 'makerRwaPip',
    chain: 'ethereum',
    address: '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b',
    token: TokensBook.ethereum['0x6db236515e90fc831d146f5829407746eddc5296'],
    ilk: '0x5257413030352d41000000000000000000000000000000000000000000000000',
  },
  MAKER_RWA006: {
    type: 'makerRwaPip',
    chain: 'ethereum',
    address: '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b',
    token: TokensBook.ethereum['0x4ee03cfbf6e784c462839f5954d60f7c2b60b113'],
    ilk: '0x5257413030362d41000000000000000000000000000000000000000000000000',
  },
  MAKER_RWA007: {
    type: 'makerRwaPip',
    chain: 'ethereum',
    address: '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b',
    token: TokensBook.ethereum['0x078fb926b041a816facced3614cf1e4bc3c723bd'],
    ilk: '0x5257413030372d41000000000000000000000000000000000000000000000000',
  },
  MAKER_RWA008: {
    type: 'makerRwaPip',
    chain: 'ethereum',
    address: '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b',
    token: TokensBook.ethereum['0xb9737098b50d7c536b6416daeb32879444f59fca'],
    ilk: '0x5257413030382d41000000000000000000000000000000000000000000000000',
  },
  MAKER_RWA009: {
    type: 'makerRwaPip',
    chain: 'ethereum',
    address: '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b',
    token: TokensBook.ethereum['0x8b9734bbaa628bfc0c9f323ba08ed184e5b88da2'],
    ilk: '0x5257413030392d41000000000000000000000000000000000000000000000000',
  },
  MAKER_RWA012: {
    type: 'makerRwaPip',
    chain: 'ethereum',
    address: '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b',
    token: TokensBook.ethereum['0x3c7f1379b5ac286eb3636668deae71eaa5f7518c'],
    ilk: '0x5257413031322d41000000000000000000000000000000000000000000000000',
  },
  MAKER_RWA014: {
    type: 'makerRwaPip',
    chain: 'ethereum',
    address: '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b',
    token: TokensBook.ethereum['0x75dca04c4acc1ffb0aef940e5b49e2c17416008a'],
    ilk: '0x5257413031342d41000000000000000000000000000000000000000000000000',
  },
  MAKER_RWA013: {
    type: 'makerRwaPip',
    chain: 'ethereum',
    address: '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b',
    token: TokensBook.ethereum['0xd6c7fd4392d328e4a8f8bc50f4128b64f4db2d4c'],
    ilk: '0x5257413031332d41000000000000000000000000000000000000000000000000',
  },
  MAKER_RWA015: {
    type: 'makerRwaPip',
    chain: 'ethereum',
    address: '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b',
    token: TokensBook.ethereum['0xf5e5e706efc841bed1d24460cd04028075cdbfde'],
    ilk: '0x5257413031352d41000000000000000000000000000000000000000000000000',
  },
  sFRAX: {
    type: 'stakingTokenWrapper',
    chain: 'ethereum',
    method: 'balance',
    address: '0xa663b02cf0a4b149d2ad41910cb81e23e1c41c32',
    underlyingToken: TokensBook.ethereum['0x853d955acef822db058eb8505911ed77f175b99e'],
  },
  sDOLA: {
    type: 'stakingTokenWrapper',
    chain: 'ethereum',
    method: 'erc4626',
    address: '0xb45ad160634c528cc3d2926d9807104fa3157305',
    underlyingToken: TokensBook.ethereum['0x865377367054516e17014ccded1e7d814edc9ce4'],
  },
};
