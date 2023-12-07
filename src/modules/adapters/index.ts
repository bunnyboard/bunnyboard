import { ProtocolConfigs } from '../../configs';
import { ContextServices, IProtocolAdapter } from '../../types/namespaces';
import Aavev1Adapter from './aave/aavev1';
import Aavev2Adapter from './aave/aavev2';
import Aavev3Adapter from './aave/aavev3';
import BenqiAdapter from './benqi/benqi';
import CompoundAdapter from './compound/compound';
import SushiAdapter from './sushi/sushi';
import VenusAdapter from './venus/venus';

function getProtocolAdapters(services: ContextServices): { [key: string]: IProtocolAdapter } {
  return {
    aavev1: new Aavev1Adapter(services, ProtocolConfigs.aavev1),
    aavev2: new Aavev2Adapter(services, ProtocolConfigs.aavev2),
    aavev3: new Aavev3Adapter(services, ProtocolConfigs.aavev3),
    compound: new CompoundAdapter(services, ProtocolConfigs.compound),
    ironbank: new CompoundAdapter(services, ProtocolConfigs.ironbank),
    venus: new VenusAdapter(services, ProtocolConfigs.venus),
    radiant: new Aavev2Adapter(services, ProtocolConfigs.radiant),
    benqi: new BenqiAdapter(services, ProtocolConfigs.benqi),
    sonne: new CompoundAdapter(services, ProtocolConfigs.sonne),
    sushi: new SushiAdapter(services, ProtocolConfigs.sushi),
  };
}

export default getProtocolAdapters;
