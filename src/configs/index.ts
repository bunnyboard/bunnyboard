import { ProtocolConfig, Token } from '../types/configs';
import { TokenBoardErc20Configs } from './boards/tokenBoard';
import { TokensBook, TokensBookBase } from './data';
import { Aavev2Configs, Aavev3Configs } from './protocols/aave';
import { CompoundConfigs, Compoundv3Configs } from './protocols/compound';
import { IronbankConfigs } from './protocols/ironbank';
import { LiquityConfigs } from './protocols/liquity';
import { MakerConfigs } from './protocols/maker';
import { RadiantConfigs } from './protocols/radiant';
import { SonneConfigs } from './protocols/sonne';
import { SparkConfigs } from './protocols/spark';
import { SushiConfigs } from './protocols/sushi';
import { Uniswapv2Configs } from './protocols/uniswap';
import { VenusConfigs } from './protocols/venus';

export const DefaultQueryContractLogsBlockRange = 1000;

export const DefaultMemcacheTime = 300; // 5 minutes

export const TokenList: { [key: string]: { [key: string]: Token } } = TokensBook;
export const TokenListBase = TokensBookBase;

export const ProtocolConfigs: { [key: string]: ProtocolConfig } = {
  aavev2: Aavev2Configs,
  aavev3: Aavev3Configs,
  compound: CompoundConfigs,
  compoundv3: Compoundv3Configs,
  ironbank: IronbankConfigs,
  venus: VenusConfigs,
  radiant: RadiantConfigs,
  sonne: SonneConfigs,
  liquity: LiquityConfigs,
  maker: MakerConfigs,
  spark: SparkConfigs,
  sushi: SushiConfigs,
  uniswapv2: Uniswapv2Configs,
  // gmx: GmxConfigs,
  // gmxv2: Gmxv2Configs,

  tokenBoard: {
    protocol: 'tokenBoard',
    configs: TokenBoardErc20Configs,
  },
};
