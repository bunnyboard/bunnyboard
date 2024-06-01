import { Token } from '../types/configs';
import { TokensBook, TokensBookBase } from './data';
import { AaveConfigs, Aavev2Configs, Aavev3Configs } from './protocols/aave';
import { AbracadabraConfigs } from './protocols/abracadabra';
import { AjnaConfigs } from './protocols/ajna';
import { BenqiConfigs } from './protocols/benqi';
import { BungeeConfigs } from './protocols/bungee';
import { CompoundConfigs, Compoundv3Configs } from './protocols/compound';
import { CrvusdConfigs } from './protocols/crvusd';
import { IonicConfigs } from './protocols/ionic';
import { IronbankConfigs } from './protocols/ironbank';
import { KinzaConfigs } from './protocols/kinza';
import { LiquityConfigs } from './protocols/liquity';
import { MakerConfigs } from './protocols/maker';
import { MendiConfigs } from './protocols/mendi';
import { OrbitConfigs } from './protocols/orbit';
import { PacConfigs } from './protocols/pac';
import { RadiantConfigs } from './protocols/radiant';
import { SeamlessConfigs } from './protocols/seamless';
import { SonneConfigs } from './protocols/sonne';
import { SparkConfigs } from './protocols/spark';
import { SushiConfigs } from './protocols/sushi';
import { UwulendConfigs } from './protocols/uwulend';
import { VenusConfigs } from './protocols/venus';
import { YethConfigs } from './protocols/yearn';
import { ZerolendConfigs } from './protocols/zerolend';

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
  ajna: AjnaConfigs,
  benqi: BenqiConfigs,
  bungee: BungeeConfigs,
  compound: CompoundConfigs,
  compoundv3: Compoundv3Configs,
  crvusd: CrvusdConfigs,
  ionic: IonicConfigs,
  ironbank: IronbankConfigs,
  kinza: KinzaConfigs,
  liquity: LiquityConfigs,
  maker: MakerConfigs,
  mendi: MendiConfigs,
  orbit: OrbitConfigs,
  pac: PacConfigs,
  radiant: RadiantConfigs,
  seamless: SeamlessConfigs,
  sonne: SonneConfigs,
  spark: SparkConfigs,
  sushi: SushiConfigs,
  uwulend: UwulendConfigs,
  venus: VenusConfigs,
  yeth: YethConfigs,
  zerolend: ZerolendConfigs,
};
