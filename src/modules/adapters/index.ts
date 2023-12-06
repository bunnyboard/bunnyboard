import { ProtocolConfigs } from '../../configs';
import { ContextServices, IProtocolAdapter } from '../../types/namespaces';
import Aavev1Adapter from './aave/aavev1';
import Aavev2Adapter from './aave/aavev2';
import Aavev3Adapter from './aave/aavev3';
import {
  AaveV1EventSignatures,
  AaveV2EventSignatures,
  AaveV3EventSignatures,
  Aavev1EventAbiMappings,
  Aavev2EventAbiMappings,
  Aavev3EventAbiMappings,
} from './aave/abis';
import BenqiAdapter from './benqi/benqi';
// import Compoundv3Adapter from './compound/compoundv3';
import { CompoundEventAbiMappings, CompoundEventSignatures } from './compound/abis';
import CompoundAdapter from './compound/compound';
import { VenusCoreEventAbiMappings, VenusCoreEventSignatures } from './venus/abis';

function getProtocolAdapters(services: ContextServices): { [key: string]: IProtocolAdapter } {
  return {
    aavev1: new Aavev1Adapter(services, ProtocolConfigs.aavev1, {
      eventSignatures: AaveV1EventSignatures,
      eventAbiMappings: Aavev1EventAbiMappings,
    }),
    aavev2: new Aavev2Adapter(services, ProtocolConfigs.aavev2, {
      eventSignatures: AaveV2EventSignatures,
      eventAbiMappings: Aavev2EventAbiMappings,
    }),
    aavev3: new Aavev3Adapter(services, ProtocolConfigs.aavev3, {
      eventSignatures: AaveV3EventSignatures,
      eventAbiMappings: Aavev3EventAbiMappings,
    }),
    compound: new CompoundAdapter(services, ProtocolConfigs.compound, {
      eventSignatures: CompoundEventSignatures,
      eventAbiMappings: CompoundEventAbiMappings,
    }),
    // compoundv3: new Compoundv3Adapter(services, ProtocolConfigs.compoundv3),
    ironbank: new CompoundAdapter(services, ProtocolConfigs.ironbank, {
      eventSignatures: CompoundEventSignatures,
      eventAbiMappings: CompoundEventAbiMappings,
    }),
    venus: new CompoundAdapter(services, ProtocolConfigs.venus, {
      eventSignatures: VenusCoreEventSignatures,
      eventAbiMappings: VenusCoreEventAbiMappings,
    }),
    radiant: new Aavev2Adapter(services, ProtocolConfigs.radiant, {
      eventSignatures: AaveV2EventSignatures,
      eventAbiMappings: Aavev2EventAbiMappings,
    }),
    benqi: new BenqiAdapter(services, ProtocolConfigs.benqi, {
      eventSignatures: CompoundEventSignatures,
      eventAbiMappings: CompoundEventAbiMappings,
    }),
    sonne: new CompoundAdapter(services, ProtocolConfigs.sonne, {
      eventSignatures: CompoundEventSignatures,
      eventAbiMappings: CompoundEventAbiMappings,
    }),
  };
}

export default getProtocolAdapters;
