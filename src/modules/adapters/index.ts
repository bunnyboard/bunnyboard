import { ProtocolConfigs } from '../../configs';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';
import Aavev2Adapter from './aave/aavev2';
import Aavev3Adapter from './aave/aavev3';
import CompoundAdapter from './compound/compound';
import IronbankAdapter from './ironbank/ironbank';
import LiquityAdapter from './liquity/liquity';
import MakerAdapter from './maker/maker';
import RadiantAdapter from './radiant/radiant';
import SushiAdapter from './sushi/sushi';
import Uniswapv2Adapter from './uniswap/uniswapv2';
import VenusAdapter from './venus/venus';

export function getProtocolAdapters(
  services: ContextServices,
  storages: ContextStorages,
): { [key: string]: IProtocolAdapter } {
  return {
    aavev2: new Aavev2Adapter(services, storages, ProtocolConfigs.aavev2),
    aavev3: new Aavev3Adapter(services, storages, ProtocolConfigs.aavev3),
    compound: new CompoundAdapter(services, storages, ProtocolConfigs.compound),
    ironbank: new IronbankAdapter(services, storages, ProtocolConfigs.ironbank),
    venus: new VenusAdapter(services, storages, ProtocolConfigs.venus),
    radiant: new RadiantAdapter(services, storages, ProtocolConfigs.radiant),
    sonne: new CompoundAdapter(services, storages, ProtocolConfigs.sonne),
    spark: new Aavev3Adapter(services, storages, ProtocolConfigs.spark),
    liquity: new LiquityAdapter(services, storages, ProtocolConfigs.liquity),
    maker: new MakerAdapter(services, storages, ProtocolConfigs.maker),
    uniswapv2: new Uniswapv2Adapter(services, storages, ProtocolConfigs.uniswapv2),
    sushi: new SushiAdapter(services, storages, ProtocolConfigs.sushi),
  };
}
