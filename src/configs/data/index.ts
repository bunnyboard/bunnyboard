import { Token } from '../../types/configs';
import EthereumAddresses from './addresses/ethereum.json';
import PolygonAddresses from './addresses/polygon.json';
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

export const AddressesBook = {
  ethereum: EthereumAddresses,
  polygon: PolygonAddresses,
};

export const TokensBook: {
  [key: string]: {
    [key: string]: Token;
  };
} = {
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
