import { OracleSourceChainlink } from '../../types/configs';

// chain => tokenAddress => config
export const OracleSourceChainlinkList: { [key: string]: { [key: string]: OracleSourceChainlink } } = {
  ethereum: {
    ETH_USD: {
      type: 'chainlink',
      chain: 'ethereum',
      address: '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419',
      decimals: 8,
      birthday: 1596758400, // Fri Aug 07 2020 00:00:00 GMT+0000
    },
    BTC_USD: {
      type: 'chainlink',
      chain: 'ethereum',
      address: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
      decimals: 8,
      birthday: 1596758400, // Fri Aug 07 2020 00:00:00 GMT+0000
    },
    WBTC_BTC: {
      type: 'chainlink',
      chain: 'ethereum',
      address: '0xfdFD9C85aD200c506Cf9e21F1FD8dd01932FBB23',
      decimals: 8,
      birthday: 1648598400, // Wed Mar 30 2022 00:00:00 GMT+0000
    },
  },
};
