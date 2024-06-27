import { ProtocolConfigs } from '../../configs';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';
import AaveAdapter from './aave/aave';
import AbracadabraAdapter from './abracadabra/abracadabra';
import AjnaAdapter from './ajna/ajna';
import AvalonAdapter from './avalon/avalon';
import BalancerAdapter from './balancer/balancer';
import BenqiAdapter from './benqi/benqi';
import BungeeAdapter from './bungee/bungee';
import CompoundAdapter from './compound/compound';
import Compoundv3Adapter from './compound/compoundv3';
import CrvusdAdapter from './crvusd/crvusd';
import IronbankAdapter from './ironbank/ironbank';
import KinzaAdapter from './kinza/kinza';
import LiquityAdapter from './liquity/liquity';
import MakerAdapter from './maker/maker';
import MendiAdapter from './mendi/mendi';
import MorphoAdapter from './morpho/morpho';
import OrbitAdapter from './orbit/orbit';
import PacAdapter from './pac/pac';
import RadiantAdapter from './radiant/radiant';
import SeamlessAdapter from './seamless/seamless';
import SonneAdapter from './sonne/sonne';
import SparkAdapter from './spark/spark';
import SushiAdapter from './sushi/sushi';
import UwulendAdapter from './uwulend/uwulend';
import VenusAdapter from './venus/venus';
import ZerolendAdapter from './zerolend/zerolend';

export function getProtocolAdapters(
  services: ContextServices,
  storages: ContextStorages,
): { [key: string]: IProtocolAdapter } {
  return {
    aave: new AaveAdapter(services, storages, ProtocolConfigs.aave),
    aavev2: new AaveAdapter(services, storages, ProtocolConfigs.aavev2),
    aavev3: new AaveAdapter(services, storages, ProtocolConfigs.aavev3),
    abracadabra: new AbracadabraAdapter(services, storages, ProtocolConfigs.abracadabra),
    ajna: new AjnaAdapter(services, storages, ProtocolConfigs.ajna),
    avalon: new AvalonAdapter(services, storages, ProtocolConfigs.avalon),
    balancer: new BalancerAdapter(services, storages, ProtocolConfigs.balancer),
    beets: new BalancerAdapter(services, storages, ProtocolConfigs.beets),
    benqi: new BenqiAdapter(services, storages, ProtocolConfigs.benqi),
    bungee: new BungeeAdapter(services, storages, ProtocolConfigs.bungee),
    compound: new CompoundAdapter(services, storages, ProtocolConfigs.compound),
    compoundv3: new Compoundv3Adapter(services, storages, ProtocolConfigs.compoundv3),
    crvusd: new CrvusdAdapter(services, storages, ProtocolConfigs.crvusd),
    ironbank: new IronbankAdapter(services, storages, ProtocolConfigs.ironbank),
    kinza: new KinzaAdapter(services, storages, ProtocolConfigs.kinza),
    venus: new VenusAdapter(services, storages, ProtocolConfigs.venus),
    radiant: new RadiantAdapter(services, storages, ProtocolConfigs.radiant),
    sonne: new SonneAdapter(services, storages, ProtocolConfigs.sonne),
    spark: new SparkAdapter(services, storages, ProtocolConfigs.spark),
    liquity: new LiquityAdapter(services, storages, ProtocolConfigs.liquity),
    maker: new MakerAdapter(services, storages, ProtocolConfigs.maker),
    mendi: new MendiAdapter(services, storages, ProtocolConfigs.mendi),
    morpho: new MorphoAdapter(services, storages, ProtocolConfigs.morpho),
    orbit: new OrbitAdapter(services, storages, ProtocolConfigs.orbit),
    seamless: new SeamlessAdapter(services, storages, ProtocolConfigs.seamless),
    sushi: new SushiAdapter(services, storages, ProtocolConfigs.sushi),
    uwulend: new UwulendAdapter(services, storages, ProtocolConfigs.uwulend),
    pac: new PacAdapter(services, storages, ProtocolConfigs.pac),
    zerolend: new ZerolendAdapter(services, storages, ProtocolConfigs.zerolend),
  };
}
