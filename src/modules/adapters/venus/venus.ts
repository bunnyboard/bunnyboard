import { ProtocolConfig } from '../../../types/configs';
import { ContextServices } from '../../../types/namespaces';
import CompoundAdapter from '../compound/compound';
import { VenusCoreEventAbiMappings, VenusCoreEventSignatures } from './abis';

export default class VenusAdapter extends CompoundAdapter {
  public readonly name: string = 'adapter.venus';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = VenusCoreEventSignatures;
    this.abiConfigs.eventAbiMappings = VenusCoreEventAbiMappings;
  }
}
