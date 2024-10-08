import { ProtocolConfigs } from '../../configs';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';
import AaveAdapter from './aave/aave';
import Aavev2Adapter from './aave/aavev2';
import Aavev3Adapter from './aave/aavev3';
import AjnaAdapter from './ajna/ajna';
import AvalonAdapter from './avalon/avalon';
import BalancerAdapter from './balancer/balancer';
import BenqiAdapter from './benqi/benqi';
import BungeeAdapter from './bungee/bungee';
import CompoundAdapter from './compound/compound';
import Compoundv3Adapter from './compound/compoundv3';
import CompoundWithOracleAdapter from './compound/compoundWithOracle';
import CrvusdAdapter from './crvusd/crvusd';
import CurvelendAdapter from './curvelend/curvelend';
import EthereumAdapter from './ethereum/ethereum';
import FluidAdapter from './fluid/fluid';
import FraxlendAdapter from './fraxlend/fraxlend';
import GravitaAdapter from './gravita/gravita';
import IonicAdapter from './ionic/ionic';
import IronbankAdapter from './ironbank/ironbank';
import IroncladAdapter from './ironclad/ironclad';
import KatanaAdapter from './katana/katana';
import KinzaAdapter from './kinza/kinza';
import LayerbankAdapter from './layerbank/layerbank';
import LiquityAdapter from './liquity/liquity';
import MakerAdapter from './maker/maker';
import MendiAdapter from './mendi/mendi';
import MoonwellAdapter from './moonwell/moonwell';
import MorphoAdapter from './morpho/morpho';
import OrbitAdapter from './orbit/orbit';
import OrbynetworkAdapter from './orbynetwork/orbynetwork';
import PacAdapter from './pac/pac';
import PancakeAdapter from './pancake/pancake';
import Pancakev3Adapter from './pancake/pancakev3';
import PrismaAdapter from './prisma/prisma';
import RadiantAdapter from './radiant/radiant';
import SeamlessAdapter from './seamless/seamless';
import SonneAdapter from './sonne/sonne';
import SparkAdapter from './spark/spark';
import SushiAdapter from './sushi/sushi';
import TectonicAdapter from './tectonic/tectonic';
import Uniswapv2Adapter from './uniswap/uniswapv2';
import Uniswapv3Adapter from './uniswap/uniswapv3';
import UwulendAdapter from './uwulend/uwulend';
import VenusAdapter from './venus/venus';
import VvsfinanceAdapter from './vvsfinance/vvsfinance';
import Vvsfinancev3Adapter from './vvsfinance/vvsfinancev3';
import ZerolendAdapter from './zerolend/zerolend';

export function getProtocolAdapters(
  services: ContextServices,
  storages: ContextStorages,
): { [key: string]: IProtocolAdapter } {
  return {
    aave: new AaveAdapter(services, storages, ProtocolConfigs.aave),
    aavev2: new AaveAdapter(services, storages, ProtocolConfigs.aavev2),
    aavev3: new AaveAdapter(services, storages, ProtocolConfigs.aavev3),
    // abracadabra: new AbracadabraAdapter(services, storages, ProtocolConfigs.abracadabra),
    ajna: new AjnaAdapter(services, storages, ProtocolConfigs.ajna),
    avalon: new AvalonAdapter(services, storages, ProtocolConfigs.avalon),
    balancer: new BalancerAdapter(services, storages, ProtocolConfigs.balancer),
    beets: new BalancerAdapter(services, storages, ProtocolConfigs.beets),
    benqi: new BenqiAdapter(services, storages, ProtocolConfigs.benqi),
    bungee: new BungeeAdapter(services, storages, ProtocolConfigs.bungee),
    colend: new Aavev3Adapter(services, storages, ProtocolConfigs.colend),
    compound: new CompoundAdapter(services, storages, ProtocolConfigs.compound),
    compoundv3: new Compoundv3Adapter(services, storages, ProtocolConfigs.compoundv3),
    crvusd: new CrvusdAdapter(services, storages, ProtocolConfigs.crvusd),
    hana: new Aavev3Adapter(services, storages, ProtocolConfigs.hana),
    gravita: new GravitaAdapter(services, storages, ProtocolConfigs.gravita),
    ionic: new IonicAdapter(services, storages, ProtocolConfigs.ionic),
    ironbank: new IronbankAdapter(services, storages, ProtocolConfigs.ironbank),
    ironclad: new IroncladAdapter(services, storages, ProtocolConfigs.ironclad),
    kinza: new KinzaAdapter(services, storages, ProtocolConfigs.kinza),
    venus: new VenusAdapter(services, storages, ProtocolConfigs.venus),
    prisma: new PrismaAdapter(services, storages, ProtocolConfigs.prisma),
    radiant: new RadiantAdapter(services, storages, ProtocolConfigs.radiant),
    rho: new CompoundWithOracleAdapter(services, storages, ProtocolConfigs.rho),
    sonne: new SonneAdapter(services, storages, ProtocolConfigs.sonne),
    spark: new SparkAdapter(services, storages, ProtocolConfigs.spark),
    liquity: new LiquityAdapter(services, storages, ProtocolConfigs.liquity),
    maker: new MakerAdapter(services, storages, ProtocolConfigs.maker),
    mendi: new MendiAdapter(services, storages, ProtocolConfigs.mendi),
    moonwell: new MoonwellAdapter(services, storages, ProtocolConfigs.moonwell),
    morpho: new MorphoAdapter(services, storages, ProtocolConfigs.morpho),
    orbit: new OrbitAdapter(services, storages, ProtocolConfigs.orbit),
    orbynetwork: new OrbynetworkAdapter(services, storages, ProtocolConfigs.orbynetwork),
    seamless: new SeamlessAdapter(services, storages, ProtocolConfigs.seamless),
    sushi: new SushiAdapter(services, storages, ProtocolConfigs.sushi),
    sushiv3: new SushiAdapter(services, storages, ProtocolConfigs.sushiv3),
    // strike: new StrikeAdapter(services, storages, ProtocolConfigs.strike),
    tectonic: new TectonicAdapter(services, storages, ProtocolConfigs.tectonic),
    uwulend: new UwulendAdapter(services, storages, ProtocolConfigs.uwulend),
    pac: new PacAdapter(services, storages, ProtocolConfigs.pac),
    yeifinance: new Aavev3Adapter(services, storages, ProtocolConfigs.yeifinance),
    zerolend: new ZerolendAdapter(services, storages, ProtocolConfigs.zerolend),
    layerbank: new LayerbankAdapter(services, storages, ProtocolConfigs.layerbank),
    fluid: new FluidAdapter(services, storages, ProtocolConfigs.fluid),
    fraxlend: new FraxlendAdapter(services, storages, ProtocolConfigs.fraxlend),
    curvelend: new CurvelendAdapter(services, storages, ProtocolConfigs.curvelend),
    polter: new Aavev2Adapter(services, storages, ProtocolConfigs.polter),
    ethereum: new EthereumAdapter(services, storages, ProtocolConfigs.ethereum),
    uniswapv2: new Uniswapv2Adapter(services, storages, ProtocolConfigs.uniswapv2),
    uniswapv3: new Uniswapv3Adapter(services, storages, ProtocolConfigs.uniswapv3),
    pancake: new PancakeAdapter(services, storages, ProtocolConfigs.pancake),
    pancakev3: new Pancakev3Adapter(services, storages, ProtocolConfigs.pancakev3),
    vvsfinance: new VvsfinanceAdapter(services, storages, ProtocolConfigs.vvsfinance),
    vvsfinancev3: new Vvsfinancev3Adapter(services, storages, ProtocolConfigs.vvsfinancev3),
    katana: new KatanaAdapter(services, storages, ProtocolConfigs.katana),
  };
}
