import { ProtocolConfigs } from '../../configs';
import { ContextServices, IProtocolAdapter } from '../../types/namespaces';
import Aavev2Adapter from './aave/aavev2';
import Aavev3Adapter from './aave/aavev3';
import CompoundAdapter from './compound/compound';
import RadiantAdapter from './radiant/radiant';
import VenusAdapter from './venus/venus';

function getProtocolAdapters(services: ContextServices): { [key: string]: IProtocolAdapter } {
  return {
    aavev2: new Aavev2Adapter(services, ProtocolConfigs.aavev2),
    aavev3: new Aavev3Adapter(services, ProtocolConfigs.aavev3),
    compound: new CompoundAdapter(services, ProtocolConfigs.compound),
    ironbank: new CompoundAdapter(services, ProtocolConfigs.ironbank),
    venus: new VenusAdapter(services, ProtocolConfigs.venus),
    radiant: new RadiantAdapter(services, ProtocolConfigs.radiant),
    sonne: new CompoundAdapter(services, ProtocolConfigs.sonne),
  };
}

export default getProtocolAdapters;
