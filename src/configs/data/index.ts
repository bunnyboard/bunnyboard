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
import TokenListCronos from './tokenlists/cronos.json';
import TokenListRonin from './tokenlists/ronin.json';

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
  cronos: TokenListCronos,
  ronin: TokenListRonin,
};

// these tokens will be used for dex data calculation
export const TokenBookDexBase = {
  ethereum: [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  ],
  arbitrum: [
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // WETH
    '0xaf88d065e77c8cc2239327c5edb3a432268e5831', // USDC
    '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', // USDC.e
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', // USDT
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', // DAI
  ],
  optimism: [
    '0x4200000000000000000000000000000000000006', // WETH
    '0x0b2c639c533813f4aa9d7837caf62653d097ff85', // USDC
    '0x7f5c764cbc14f9669b88837ca1490cca17c31607', // USDC.e
    '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', // USDT
    '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1', // USDT
  ],
  base: [
    '0x4200000000000000000000000000000000000006', // WETH
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC
    '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca', // USDBC
    '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2', // USDBC
    '0x50c5725949a6f0c72e6c4a641f24049a917db0cb', // DAI
  ],
  polygon: [
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // WMATIC
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', // WETH
  ],
  bnbchain: [
    '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB
    '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
    '0x2d3b329aed5d62945f35104cb73514f507929841', // USDT
  ],
  cronos: [
    '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23', // WCRO
    '0xc21223249ca28397b4b6541dffaecc539bff0c59', // USDC
    '0xe44fd7fcb2b1581822d0c862b68222998a0c299a', // WETH
    '0x66e428c3f67a68878562e79a0234c1f83c208770', // USDT
  ],
  ronin: [
    '0xe514d9deb7966c8be0ca922de8a064264ea6bcd4', // WRON
    '0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5', // WETH
    '0x0b7007c13325c48911f73a2dad5fa5dcbf808adc', // USDC
  ],
};
