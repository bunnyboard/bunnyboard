import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import CompoundAdapter from '../compound/compound';

export default class IronbankAdapter extends CompoundAdapter {
  public readonly name: string = 'adapter.ironbank';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }
}
