import { ProtocolConfigs } from '../../configs';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';
import Aavev2Adapter from './aave/aavev2';
import Aavev3Adapter from './aave/aavev3';
import AbracadabraAdapter from './abracadabra/abracadabra';
import CompoundAdapter from './compound/compound';
import IronbankAdapter from './ironbank/ironbank';
import LiquityAdapter from './liquity/liquity';
import MakerAdapter from './maker/maker';
import RadiantAdapter from './radiant/radiant';
import SpookyAdapter from './spooky/spooky';
import SushiAdapter from './sushi/sushi';
import Sushiv3Adapter from './sushi/sushiv3';
import Uniswapv2Adapter from './uniswap/uniswapv2';
import Uniswapv3Adapter from './uniswap/uniswapv3';
import VenusAdapter from './venus/venus';

export function getProtocolAdapters(
  services: ContextServices,
  storages: ContextStorages,
): { [key: string]: IProtocolAdapter } {
  return {
    aavev2: new Aavev2Adapter(services, storages, ProtocolConfigs.aavev2),
    aavev3: new Aavev3Adapter(services, storages, ProtocolConfigs.aavev3),
    abracadabra: new AbracadabraAdapter(services, storages, ProtocolConfigs.abracadabra),
    compound: new CompoundAdapter(services, storages, ProtocolConfigs.compound),
    ironbank: new IronbankAdapter(services, storages, ProtocolConfigs.ironbank),
    venus: new VenusAdapter(services, storages, ProtocolConfigs.venus),
    radiant: new RadiantAdapter(services, storages, ProtocolConfigs.radiant),
    sonne: new CompoundAdapter(services, storages, ProtocolConfigs.sonne),
    spark: new Aavev3Adapter(services, storages, ProtocolConfigs.spark),
    liquity: new LiquityAdapter(services, storages, ProtocolConfigs.liquity),
    maker: new MakerAdapter(services, storages, ProtocolConfigs.maker),
    spooky: new SpookyAdapter(services, storages, ProtocolConfigs.spooky),
    sushi: new SushiAdapter(services, storages, ProtocolConfigs.sushi),
    sushiv3: new Sushiv3Adapter(services, storages, ProtocolConfigs.sushiv3),
    uniswapv2: new Uniswapv2Adapter(services, storages, ProtocolConfigs.uniswapv2),
    uniswapv3: new Uniswapv3Adapter(services, storages, ProtocolConfigs.uniswapv3),
  };
}
