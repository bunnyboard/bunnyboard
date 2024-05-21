import { Token } from '../types/configs';
import { TokensBook, TokensBookBase } from './data';
import { AaveConfigs, Aavev2Configs, Aavev3Configs } from './protocols/aave';
import { AbracadabraConfigs } from './protocols/abracadabra';
import { BenqiConfigs } from './protocols/benqi';
import { CompoundConfigs, Compoundv3Configs } from './protocols/compound';
import { IronbankConfigs } from './protocols/ironbank';
import { KinzaConfigs } from './protocols/kinza';
import { KyberswapConfigs } from './protocols/kyberswap';
import { LiquityConfigs } from './protocols/liquity';
import { MakerConfigs } from './protocols/maker';
import { MendiConfigs } from './protocols/mendi';
import { OrbitConfigs } from './protocols/orbit';
import { PacConfigs } from './protocols/pac';
import { RadiantConfigs } from './protocols/radiant';
import { SeamlessConfigs } from './protocols/seamless';
import { SonneConfigs } from './protocols/sonne';
import { SparkConfigs } from './protocols/spark';
import { SpookyConfigs } from './protocols/spooky';
import { SushiConfigs, Sushiv3Configs } from './protocols/sushi';
import { Uniswapv2Configs, Uniswapv3Configs } from './protocols/uniswap';
import { VenusConfigs } from './protocols/venus';
import { YethConfigs } from './protocols/yearn';
import { ZerolendConfigs } from './protocols/zerolend';

export { ChainBoardConfigs } from './boards/chainBoard';

export const DefaultQueryContractLogsBlockRange = 1000;
export const CustomQueryContractLogsBlockRange: { [key: string]: number } = {
  polygon: 200,
};

export const DefaultMemcacheTime = 300; // 5 minutes

export const TokenList: { [key: string]: { [key: string]: Token } } = TokensBook;
export const TokenListBase = TokensBookBase;

export const ProtocolConfigs = {
  aave: AaveConfigs,
  aavev2: Aavev2Configs,
  aavev3: Aavev3Configs,
  abracadabra: AbracadabraConfigs,
  benqi: BenqiConfigs,
  compound: CompoundConfigs,
  compoundv3: Compoundv3Configs,
  ironbank: IronbankConfigs,
  kinza: KinzaConfigs,
  kyberswap: KyberswapConfigs,
  liquity: LiquityConfigs,
  maker: MakerConfigs,
  mendi: MendiConfigs,
  orbit: OrbitConfigs,
  pac: PacConfigs,
  radiant: RadiantConfigs,
  seamless: SeamlessConfigs,
  sonne: SonneConfigs,
  spark: SparkConfigs,
  spooky: SpookyConfigs,
  sushi: SushiConfigs,
  sushiv3: Sushiv3Configs,
  uniswapv2: Uniswapv2Configs,
  uniswapv3: Uniswapv3Configs,
  // uwulend: UwulendConfigs,
  venus: VenusConfigs,
  yeth: YethConfigs,
  zerolend: ZerolendConfigs,
};
