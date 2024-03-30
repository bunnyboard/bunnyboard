import { OracleSourceChainlink } from '../../types/oracles';
import { AddressesBook } from '../data';

// name => OracleSourceChainlink
export const OracleSourceChainlinkList: { [key: string]: OracleSourceChainlink } = {
  ETH_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_ETH_USD,
    decimals: 8,
  },
  BTC_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_BTC_USD,
    decimals: 8,
  },
  WBTC_BTC: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_WBTC_USD,
    decimals: 8,
  },
  BNB_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    address: AddressesBook.bnbchain.ChainlinkFeed_BNB_USD,
    decimals: 8,
  },
  MATIC_USD: {
    type: 'chainlink',
    chain: 'polygon',
    address: AddressesBook.polygon.ChainlinkFeed_MATIC_USD,
    decimals: 8,
  },
  AVAX_USD: {
    type: 'chainlink',
    chain: 'avalanche',
    address: AddressesBook.avalanche.ChainlinkFeed_AVAX_USD,
    decimals: 8,
  },
  FTM_USD: {
    type: 'chainlink',
    chain: 'fantom',
    address: AddressesBook.fantom.ChainlinkFeed_FTM_USD,
    decimals: 8,
  },
  DAI_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_DAI_USD,
    decimals: 8,
  },
  USDT_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_USDT_USD,
    decimals: 8,
  },
  USDC_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_USDC_USD,
    decimals: 8,
  },
  EUR_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_EUR_USD,
    decimals: 8,
  },
  BAT_ETH: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_BAT_ETH,
    decimals: 18,
  },
  LINK_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_LINK_USD,
    decimals: 8,
  },
  KNC_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_KNC_USD,
    decimals: 8,
  },
  BUSD_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_BUSD_USD,
    decimals: 8,
  },
  GUSD_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_GUSD_USD,
    decimals: 8,
  },
  FIL_ETH: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_FIL_ETH,
    decimals: 18,
  },
  USDP_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_USDP_USD,
    decimals: 8,
  },
  TRX_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    address: AddressesBook.bnbchain.ChainlinkFeed_TRX_USD,
    decimals: 8,
  },
  USDD_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    address: AddressesBook.bnbchain.ChainlinkFeed_USDD_USD,
    decimals: 8,
  },
  BCH_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    address: AddressesBook.bnbchain.ChainlinkFeed_BCH_USD,
    decimals: 8,
  },
  AUD_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_AUD_USD,
    decimals: 8,
  },
  GBP_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_GBP_USD,
    decimals: 8,
  },
  JPY_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_JPY_USD,
    decimals: 8,
  },
  KRW_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_KRW_USD,
    decimals: 8,
  },
  CHF_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_CHF_USD,
    decimals: 8,
  },
  DOGE_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_DOGE_USD,
    decimals: 8,
  },
  SOL_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: AddressesBook.ethereum.ChainlinkFeed_SOL_USD,
    decimals: 8,
  },
};
