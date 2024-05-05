import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import Aavev2Adapter from '../aave/aavev2';

export default class UwulendAdapter extends Aavev2Adapter {
  public readonly name: string = 'adapter.uwulend';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }
}
