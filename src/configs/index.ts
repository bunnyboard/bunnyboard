import { ProtocolConfig, Token } from '../types/configs';
import { Aavev1Configs, Aavev2Configs, Aavev3Configs } from './protocols/aave';
import { CompoundConfigs, Compoundv3Configs } from './protocols/compound';
import { IronbankConfigs } from './protocols/ironbank';
import { RadiantConfigs } from './protocols/radiant';
import { VenusConfigs } from './protocols/venus';
import TokenListArbitrum from './tokenlists/arbitrum.json';
import TokenListAvalanche from './tokenlists/avalanche.json';
import TokenListBase from './tokenlists/base.json';
import TokenListBnbchain from './tokenlists/bnbchain.json';
import TokenListEthereum from './tokenlists/ethereum.json';
import TokenListFantom from './tokenlists/fantom.json';
import TokenListOptimism from './tokenlists/optimism.json';
import TokenListPolygon from './tokenlists/polygon.json';

export const DefaultQueryLogsBlockRange = 2000;

export const TokenList: {
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
};

export const ProtocolConfigs: { [key: string]: ProtocolConfig } = {
  aavev1: Aavev1Configs,
  aavev2: Aavev2Configs,
  aavev3: Aavev3Configs,
  compound: CompoundConfigs,
  compoundv3: Compoundv3Configs,
  ironbank: IronbankConfigs,
  venus: VenusConfigs,
  radiant: RadiantConfigs,
};
