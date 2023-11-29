import { ProtocolConfigs } from '../../configs';
import { ContextServices, IProtocolAdapter } from '../../types/namespaces';
import Aavev1Adapter from './aave/aavev1';
import Aavev2Adapter from './aave/aavev2';
import Aavev3Adapter from './aave/aavev3';
import CompoundAdapter from './compound/compound';
import Compoundv3Adapter from './compound/compoundv3';
import VenusAdapter from './venus/venus';

function getProtocolAdapters(services: ContextServices): { [key: string]: IProtocolAdapter } {
  return {
    aavev1: new Aavev1Adapter(services, ProtocolConfigs.aavev1),
    aavev2: new Aavev2Adapter(services, ProtocolConfigs.aavev2),
    aavev3: new Aavev3Adapter(services, ProtocolConfigs.aavev3),
    compound: new CompoundAdapter(services, ProtocolConfigs.compound),
    compoundv3: new Compoundv3Adapter(services, ProtocolConfigs.compoundv3),
    ironbank: new CompoundAdapter(services, ProtocolConfigs.ironbank),
    venus: new VenusAdapter(services, ProtocolConfigs.venus),
    radiant: new Aavev2Adapter(services, ProtocolConfigs.radiant),
  };
}

export default getProtocolAdapters;
