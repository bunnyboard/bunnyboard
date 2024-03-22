import { ContextServices, IProtocolAdapter } from '../../types/namespaces';
import Aavev2Adapter from './aave/aavev2';
import Aavev3Adapter from './aave/aavev3';
import CompoundAdapter from './compound/compound';
import LiquityAdapter from './liquity/liquity';
import MakerAdapter from './maker/maker';
import RadiantAdapter from './radiant/radiant';
import VenusAdapter from './venus/venus';

export function getProtocolAdapters(services: ContextServices): { [key: string]: IProtocolAdapter } {
  return {
    aavev2: new Aavev2Adapter(services),
    aavev3: new Aavev3Adapter(services),
    compound: new CompoundAdapter(services),
    ironbank: new CompoundAdapter(services),
    venus: new VenusAdapter(services),
    radiant: new RadiantAdapter(services),
    sonne: new CompoundAdapter(services),
    spark: new Aavev3Adapter(services),
    liquity: new LiquityAdapter(services),
    maker: new MakerAdapter(services),
  };
}
