import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import Aavev3Adapter from '../aave/aavev3';

export default class KinzaAdapter extends Aavev3Adapter {
  public readonly name: string = 'adapter.kinza';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }
}
