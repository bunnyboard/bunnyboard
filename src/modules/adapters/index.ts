import { ProtocolConfigs } from '../../configs';
import { ContextServices, IProtocolAdapter } from '../../types/namespaces';
import Aavev2Adapter from './aave/aavev2';
import Aavev3Adapter from './aave/aavev3';

function getProtocolAdapters(services: ContextServices): { [key: string]: IProtocolAdapter } {
  return {
    aavev2: new Aavev2Adapter(services, ProtocolConfigs.aavev2),
    aavev3: new Aavev3Adapter(services, ProtocolConfigs.aavev3),
  };
}

export default getProtocolAdapters;
