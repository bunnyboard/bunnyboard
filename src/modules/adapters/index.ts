import { ProtocolConfigs } from '../../configs';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';
import Aavev2Adapter from './aave/aavev2';
import Aavev3Adapter from './aave/aavev3';
import AbracadabraAdapter from './abracadabra/abracadabra';
import CompoundAdapter from './compound/compound';
import Compoundv3Adapter from './compound/compoundv3';
import IronbankAdapter from './ironbank/ironbank';
import KinzaAdapter from './kinza/kinza';
import LiquityAdapter from './liquity/liquity';
import MakerAdapter from './maker/maker';
import MendiAdapter from './mendi/mendi';
import OrbitAdapter from './orbit/orbit';
import PacAdapter from './pac/pac';
import RadiantAdapter from './radiant/radiant';
import SeamlessAdapter from './seamless/seamless';
import SonneAdapter from './sonne/sonne';
import SparkAdapter from './spark/spark';
import SpookyAdapter from './spooky/spooky';
import SushiAdapter from './sushi/sushi';
import Sushiv3Adapter from './sushi/sushiv3';
import Uniswapv2Adapter from './uniswap/uniswapv2';
import Uniswapv3Adapter from './uniswap/uniswapv3';
import VenusAdapter from './venus/venus';
import ZerolendAdapter from './zerolend/zerolend';

export function getProtocolAdapters(
  services: ContextServices,
  storages: ContextStorages,
): { [key: string]: IProtocolAdapter } {
  return {
    aavev2: new Aavev2Adapter(services, storages, ProtocolConfigs.aavev2),
    aavev3: new Aavev3Adapter(services, storages, ProtocolConfigs.aavev3),
    abracadabra: new AbracadabraAdapter(services, storages, ProtocolConfigs.abracadabra),
    compound: new CompoundAdapter(services, storages, ProtocolConfigs.compound),
    compoundv3: new Compoundv3Adapter(services, storages, ProtocolConfigs.compoundv3),
    ironbank: new IronbankAdapter(services, storages, ProtocolConfigs.ironbank),
    kinza: new KinzaAdapter(services, storages, ProtocolConfigs.kinza),
    venus: new VenusAdapter(services, storages, ProtocolConfigs.venus),
    radiant: new RadiantAdapter(services, storages, ProtocolConfigs.radiant),
    sonne: new SonneAdapter(services, storages, ProtocolConfigs.sonne),
    spark: new SparkAdapter(services, storages, ProtocolConfigs.spark),
    liquity: new LiquityAdapter(services, storages, ProtocolConfigs.liquity),
    maker: new MakerAdapter(services, storages, ProtocolConfigs.maker),
    mendi: new MendiAdapter(services, storages, ProtocolConfigs.mendi),
    orbit: new OrbitAdapter(services, storages, ProtocolConfigs.orbit),
    seamless: new SeamlessAdapter(services, storages, ProtocolConfigs.seamless),
    spooky: new SpookyAdapter(services, storages, ProtocolConfigs.spooky),
    sushi: new SushiAdapter(services, storages, ProtocolConfigs.sushi),
    sushiv3: new Sushiv3Adapter(services, storages, ProtocolConfigs.sushiv3),
    uniswapv2: new Uniswapv2Adapter(services, storages, ProtocolConfigs.uniswapv2),
    uniswapv3: new Uniswapv3Adapter(services, storages, ProtocolConfigs.uniswapv3),
    pac: new PacAdapter(services, storages, ProtocolConfigs.pac),
    zerolend: new ZerolendAdapter(services, storages, ProtocolConfigs.zerolend),
  };
}
