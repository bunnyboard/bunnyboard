import { ProtocolConfigs } from '../../configs';
import { ContextServices, IProtocolAdapter } from '../../types/namespaces';
import Aavev2Adapter from './aave/aavev2';
import Aavev3Adapter from './aave/aavev3';
import CompoundAdapter from './compound/compound';
import Compoundv3Adapter from './compound/compoundv3';

function getProtocolAdapters(services: ContextServices): { [key: string]: IProtocolAdapter } {
  return {
    aavev2: new Aavev2Adapter(services, ProtocolConfigs.aavev2),
    aavev3: new Aavev3Adapter(services, ProtocolConfigs.aavev3),
    compound: new CompoundAdapter(services, ProtocolConfigs.compound),
    compoundv3: new Compoundv3Adapter(services, ProtocolConfigs.compoundv3),
  };
}

export default getProtocolAdapters;
