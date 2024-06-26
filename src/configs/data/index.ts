import ArbitrumAddresses from './addresses/arbitrum.json';
import AvalancheAddresses from './addresses/avalanche.json';
import BaseAddresses from './addresses/base.json';
import BlastAddresses from './addresses/blast.json';
import BnbchainAddresses from './addresses/bnbchain.json';
import EthereumAddresses from './addresses/ethereum.json';
import FantomAddresses from './addresses/fantom.json';
import GnosisAddresses from './addresses/gnosis.json';
import LineaAddresses from './addresses/linea.json';
import MantaAddresses from './addresses/manta.json';
import MetisAddresses from './addresses/metis.json';
import OptimismAddresses from './addresses/optimism.json';
import PolygonAddresses from './addresses/polygon.json';
import ScrollAddresses from './addresses/scroll.json';
import ZksyncAddresses from './addresses/zksync.json';
import TokenListArbitrum from './tokenlists/arbitrum.json';
import TokenListAvalanche from './tokenlists/avalanche.json';
import TokenListBase from './tokenlists/base.json';
import TokenListBlast from './tokenlists/blast.json';
import TokenListBnbchain from './tokenlists/bnbchain.json';
import TokenListEthereum from './tokenlists/ethereum.json';
import TokenListFantom from './tokenlists/fantom.json';
import TokenListGnosis from './tokenlists/gnosis.json';
import TokenListLinea from './tokenlists/linea.json';
import TokenListManta from './tokenlists/manta.json';
import TokenListMantle from './tokenlists/mantle.json';
import TokenListMerlin from './tokenlists/merlin.json';
import TokenListMetis from './tokenlists/metis.json';
import TokenListOptimism from './tokenlists/optimism.json';
import TokenListPolygon from './tokenlists/polygon.json';
import TokenListScroll from './tokenlists/scroll.json';
import TokenListZksync from './tokenlists/zksync.json';

export const AddressesBook = {
  ethereum: EthereumAddresses,
  arbitrum: ArbitrumAddresses,
  optimism: OptimismAddresses,
  base: BaseAddresses,
  bnbchain: BnbchainAddresses,
  polygon: PolygonAddresses,
  avalanche: AvalancheAddresses,
  fantom: FantomAddresses,
  gnosis: GnosisAddresses,
  metis: MetisAddresses,
  scroll: ScrollAddresses,
  blast: BlastAddresses,
  linea: LineaAddresses,
  zksync: ZksyncAddresses,
  manta: MantaAddresses,
};

export const TokensBook = {
  ethereum: TokenListEthereum,
  arbitrum: TokenListArbitrum,
  base: TokenListBase,
  optimism: TokenListOptimism,
  polygon: TokenListPolygon,
  bnbchain: TokenListBnbchain,
  avalanche: TokenListAvalanche,
  fantom: TokenListFantom,
  metis: TokenListMetis,
  gnosis: TokenListGnosis,
  scroll: TokenListScroll,
  blast: TokenListBlast,
  linea: TokenListLinea,
  zksync: TokenListZksync,
  manta: TokenListManta,
  mantle: TokenListMantle,
  merlin: TokenListMerlin,
};

// these tokens will be used for general purpose
// like query dex liquidity and pools
export const TokensBookBase = {
  ethereum: {
    WETH: TokenListEthereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
    USDT: TokenListEthereum['0xdac17f958d2ee523a2206206994597c13d831ec7'],
    USDC: TokenListEthereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    DAI: TokenListEthereum['0x6b175474e89094c44da98b954eedeac495271d0f'],
    RAI: TokenListEthereum['0x03ab458634910aad20ef5f1c8ee96f1d6ac54919'],
    TUSD: TokenListEthereum['0x0000000000085d4780b73119b644ae5ecd22b376'],
    YFI: TokenListEthereum['0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e'],
    BAT: TokenListEthereum['0x0d8775f648430679a709e98d2b0cb6250d2887ef'],
    MANA: TokenListEthereum['0x0f5d2fb29fb7d3cfee444a200298f468908cc942'],
    DPI: TokenListEthereum['0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b'],
    '1INCH': TokenListEthereum['0x111111111117dc0aa78b770fa6a738034120c302'],
    UNI: TokenListEthereum['0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
    WBTC: TokenListEthereum['0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'],
    CVX: TokenListEthereum['0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b'],
    LINK: TokenListEthereum['0x514910771af9ca656af840dff83e8264ecf986ca'],
    LDO: TokenListEthereum['0x5a98fcbea516cf06857215779fd812ca3bef1b32'],
    LUSD: TokenListEthereum['0x5f98805a4e8be255a32880fdec7f6728c6568ba0'],
    SUSHI: TokenListEthereum['0x6b3595068778dd592e39a122f4f5a5cf09c90fe2'],
    wstETH: TokenListEthereum['0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0'],
    AAVE: TokenListEthereum['0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'],
    xSUSHI: TokenListEthereum['0x8798249c2e607446efb7ad49ec89dd1865ff4272'],
    MKR: TokenListEthereum['0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2'],
    rETH: TokenListEthereum['0xae78736cd615f374d3085123a210448e74fc6393'],
    stETH: TokenListEthereum['0xae7ab96520de3a18e5e111b5eaab095312d7fe84'],
    BAL: TokenListEthereum['0xba100000625a3754423978a60c9317c58a424e3d'],
    cbETH: TokenListEthereum['0xbe9895146f7af43049ca1c1ae358b0541ea49704'],
    COMP: TokenListEthereum['0xc00e94cb662c3520282e6f5717214004a7f26888'],
    SNX: TokenListEthereum['0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f'],
    ENS: TokenListEthereum['0xc18360217d8f7ab5e7c516566761ea12ce7f9d72'],
    RPL: TokenListEthereum['0xd33526068d116ce69f19a9ee46f0bd304f21a51f'],
    CRV: TokenListEthereum['0xd533a949740bb3306d119cc777fa900ba034cd52'],
  },
  arbitrum: {
    WETH: TokenListArbitrum['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
  },
  optimism: {
    WETH: TokenListOptimism['0x4200000000000000000000000000000000000006'],
  },
  base: {
    WETH: TokenListBase['0x4200000000000000000000000000000000000006'],
  },
  polygon: {
    WMATIC: TokenListPolygon['0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'],
  },
  bnbchain: {
    WBNB: TokenListBnbchain['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'],
  },
  fantom: {
    WFTM: TokenListFantom['0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'],
  },
  avalanche: {
    WAVAX: TokenListAvalanche['0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'],
  },
  gnosis: {
    WXDAI: TokenListGnosis['0xe91d153e0b41518a2ce8dd3d7944fa863463a97d'],
  },
};
