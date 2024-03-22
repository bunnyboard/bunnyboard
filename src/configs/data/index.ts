import { Token } from '../../types/configs';
import AvalancheAddresses from './addresses/avalanche.json';
import EthereumAddresses from './addresses/ethereum.json';
import PolygonAddresses from './addresses/polygon.json';
import { BlockSubGraphEndpoints, DataSubGraphEndpoints } from './subgraphs';
import TokenListArbitrum from './tokenlists/arbitrum.json';
import TokenListAvalanche from './tokenlists/avalanche.json';
import TokenListBase from './tokenlists/base.json';
import TokenListBnbchain from './tokenlists/bnbchain.json';
import TokenListEthereum from './tokenlists/ethereum.json';
import TokenListFantom from './tokenlists/fantom.json';
import TokenListGnosis from './tokenlists/gnosis.json';
import TokenListMetis from './tokenlists/metis.json';
import TokenListOptimism from './tokenlists/optimism.json';
import TokenListPolygon from './tokenlists/polygon.json';

export const SubgraphEndpoints: {
  blocks: { [key: string]: string };
  data: { [key: string]: string };
} = {
  blocks: BlockSubGraphEndpoints,
  data: DataSubGraphEndpoints,
};

export const AddressesBook = {
  ethereum: EthereumAddresses,
  polygon: PolygonAddresses,
  avalanche: AvalancheAddresses,
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
};

export const TokensBookBase: { [key: string]: { [key: string]: Token } } = {
  ethereum: {
    WETH: TokenListEthereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
    USDT: TokenListEthereum['0xdac17f958d2ee523a2206206994597c13d831ec7'],
    USDC: TokenListEthereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    DAI: TokenListEthereum['0x6b175474e89094c44da98b954eedeac495271d0f'],
  },
};
