import { OracleSourceChainlink } from '../../types/oracles';

// chain => tokenAddress => config
export const OracleSourceChainlinkList: { [key: string]: OracleSourceChainlink } = {
  ETH_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419',
    decimals: 8,
  },
  BTC_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
    decimals: 8,
  },
  WBTC_BTC: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0xfdFD9C85aD200c506Cf9e21F1FD8dd01932FBB23',
    decimals: 8,
  },
  BNB_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    address: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE',
    decimals: 8,
  },
  MATIC_USD: {
    type: 'chainlink',
    chain: 'polygon',
    address: '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0',
    decimals: 8,
  },
  AVAX_USD: {
    type: 'chainlink',
    chain: 'avalanche',
    address: '0x0A77230d17318075983913bC2145DB16C7366156',
    decimals: 8,
  },
  FTM_USD: {
    type: 'chainlink',
    chain: 'fantom',
    address: '0xf4766552D15AE4d256Ad41B6cf2933482B0680dc',
    decimals: 8,
  },
  DAI_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9',
    decimals: 8,
  },
  USDT_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D',
    decimals: 8,
  },
  USDC_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
    decimals: 8,
  },
  EUR_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0xb49f677943BC038e9857d61E7d053CaA2C1734C1',
    decimals: 8,
  },
  BAT_ETH: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x0d16d4528239e9ee52fa531af613AcdB23D88c94',
    decimals: 18,
  },
  LINK_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c',
    decimals: 8,
  },
  KNC_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0xf8fF43E991A81e6eC886a3D281A2C6cC19aE70Fc',
    decimals: 8,
  },
  BUSD_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x833D8Eb16D306ed1FbB5D7A2E019e106B960965A',
    decimals: 8,
  },
  GUSD_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0xa89f5d2365ce98B3cD68012b6f503ab1416245Fc',
    decimals: 8,
  },
  FIL_ETH: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x0606Be69451B1C9861Ac6b3626b99093b713E801',
    decimals: 18,
  },
  USDP_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x09023c0DA49Aaf8fc3fA3ADF34C6A7016D38D5e3',
    decimals: 8,
  },
  TRX_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    address: '0xF4C5e535756D11994fCBB12Ba8adD0192D9b88be',
    decimals: 8,
  },
  USDD_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    address: '0x51c78c299C42b058Bf11d47FbB74aC437C6a0c8C',
    decimals: 8,
  },
  BCH_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    address: '0x43d80f616DAf0b0B42a928EeD32147dC59027D41',
    decimals: 8,
  },
  AUD_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x77F9710E7d0A19669A13c055F62cd80d313dF022',
    decimals: 8,
  },
  GBP_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x5c0Ab2d9b5a7ed9f470386e82BB36A3613cDd4b5',
    decimals: 8,
  },
  JPY_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0xBcE206caE7f0ec07b545EddE332A47C2F75bbeb3',
    decimals: 8,
  },
  KRW_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x01435677FB11763550905594A16B645847C1d0F3',
    decimals: 8,
  },
  CHF_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x449d117117838fFA61263B61dA6301AA2a88B13A',
    decimals: 8,
  },
  DOGE_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x2465CefD3b488BE410b941b1d4b2767088e2A028',
    decimals: 8,
  },
};
