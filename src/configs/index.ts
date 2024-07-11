import { Token } from '../types/configs';
import { TokensBook, TokensBookBase } from './data';
import { AaveConfigs, Aavev2Configs, Aavev3Configs } from './protocols/aave';
import { AbracadabraConfigs } from './protocols/abracadabra';
import { AjnaConfigs } from './protocols/ajna';
import { AvalonConfigs } from './protocols/avalon';
import { BalancerConfigs } from './protocols/balancer';
import { BeetsConfigs } from './protocols/beets';
import { BenqiConfigs } from './protocols/benqi';
import { BungeeConfigs } from './protocols/bungee';
import { ColendCOnfigs } from './protocols/colend';
import { CompoundConfigs, Compoundv3Configs } from './protocols/compound';
import { CrvusdConfigs } from './protocols/crvusd';
import { FluidConfigs } from './protocols/fluid';
import { GravitaConfigs } from './protocols/gravita';
import { HanaConfigs } from './protocols/hana';
import { IonicConfigs } from './protocols/ionic';
import { IronbankConfigs } from './protocols/ironbank';
import { IroncladConfigs } from './protocols/ironclad';
import { KinzaConfigs } from './protocols/kinza';
import { LayerbankConfigs } from './protocols/layerbank';
import { LiquityConfigs } from './protocols/liquity';
import { MakerConfigs } from './protocols/maker';
import { MendiConfigs } from './protocols/mendi';
import { MoonwellConfigs } from './protocols/moonwell';
import { MorphoConfigs } from './protocols/morpho';
import { OrbitConfigs } from './protocols/orbit';
import { OrbynetworkConfigs } from './protocols/orbynetwork';
import { PacConfigs } from './protocols/pac';
import { PrismaConfigs } from './protocols/prisma';
import { RadiantConfigs } from './protocols/radiant';
import { RhoConfigs } from './protocols/rho';
import { SeamlessConfigs } from './protocols/seamless';
import { SonneConfigs } from './protocols/sonne';
import { SparkConfigs } from './protocols/spark';
import { StrikeConfigs } from './protocols/strike';
import { SushiConfigs } from './protocols/sushi';
import { TectonicConfigs } from './protocols/tectonic';
import { UwulendConfigs } from './protocols/uwulend';
import { VenusConfigs } from './protocols/venus';
import { YethConfigs } from './protocols/yearn';
import { YeifinanceConfigs } from './protocols/yeifinance';
import { ZerolendConfigs } from './protocols/zerolend';

export const DefaultQueryContractLogsBlockRange = 1000;
export const CustomQueryContractLogsBlockRange: { [key: string]: number } = {
  polygon: 200,
  merlin: 200,
  zklinknova: 50,
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
  avalon: AvalonConfigs,
  balancer: BalancerConfigs,
  beets: BeetsConfigs,
  benqi: BenqiConfigs,
  bungee: BungeeConfigs,
  colend: ColendCOnfigs,
  compound: CompoundConfigs,
  compoundv3: Compoundv3Configs,
  crvusd: CrvusdConfigs,
  fluid: FluidConfigs,
  gravita: GravitaConfigs,
  hana: HanaConfigs,
  ionic: IonicConfigs,
  ironbank: IronbankConfigs,
  ironclad: IroncladConfigs,
  kinza: KinzaConfigs,
  layerbank: LayerbankConfigs,
  liquity: LiquityConfigs,
  maker: MakerConfigs,
  mendi: MendiConfigs,
  moonwell: MoonwellConfigs,
  morpho: MorphoConfigs,
  orbit: OrbitConfigs,
  orbynetwork: OrbynetworkConfigs,
  pac: PacConfigs,
  prisma: PrismaConfigs,
  radiant: RadiantConfigs,
  rho: RhoConfigs,
  seamless: SeamlessConfigs,
  sonne: SonneConfigs,
  spark: SparkConfigs,
  sushi: SushiConfigs,
  strike: StrikeConfigs,
  tectonic: TectonicConfigs,
  uwulend: UwulendConfigs,
  venus: VenusConfigs,
  yeth: YethConfigs,
  yeifinance: YeifinanceConfigs,
  zerolend: ZerolendConfigs,
};
