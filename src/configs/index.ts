import { Token } from '../types/configs';
import { TokenBoardConfigs } from './boards/tokenBoard';
import { TokensBook, TokensBookBase } from './data';
import { Aavev2Configs, Aavev3Configs } from './protocols/aave';
import { AbracadabraConfigs } from './protocols/abracadabra';
import { CompoundConfigs, Compoundv3Configs } from './protocols/compound';
import { IronbankConfigs } from './protocols/ironbank';
import { KyberswapConfigs } from './protocols/kyberswap';
import { LiquityConfigs } from './protocols/liquity';
import { MakerConfigs } from './protocols/maker';
import { RadiantConfigs } from './protocols/radiant';
import { SonneConfigs } from './protocols/sonne';
import { SparkConfigs } from './protocols/spark';
import { SpookyConfigs } from './protocols/spooky';
import { SushiConfigs, Sushiv3Configs } from './protocols/sushi';
import { Uniswapv2Configs, Uniswapv3Configs } from './protocols/uniswap';
import { VenusConfigs } from './protocols/venus';

export const DefaultQueryContractLogsBlockRange = 1000;

export const DefaultMemcacheTime = 300; // 5 minutes

export const TokenList: { [key: string]: { [key: string]: Token } } = TokensBook;
export const TokenListBase = TokensBookBase;

export const ProtocolConfigs = {
  aavev2: Aavev2Configs,
  aavev3: Aavev3Configs,
  abracadabra: AbracadabraConfigs,
  compound: CompoundConfigs,
  compoundv3: Compoundv3Configs,
  ironbank: IronbankConfigs,
  kyberswap: KyberswapConfigs,
  liquity: LiquityConfigs,
  maker: MakerConfigs,
  radiant: RadiantConfigs,
  sonne: SonneConfigs,
  spark: SparkConfigs,
  spooky: SpookyConfigs,
  sushi: SushiConfigs,
  sushiv3: Sushiv3Configs,
  uniswapv2: Uniswapv2Configs,
  uniswapv3: Uniswapv3Configs,
  venus: VenusConfigs,

  tokenBoard: {
    protocol: 'tokenBoard',
    configs: TokenBoardConfigs,
  },
};
