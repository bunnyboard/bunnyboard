import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import CompoundWithOracleAdapter from '../compound/compoundWithOracle';

export default class OrbitAdapter extends CompoundWithOracleAdapter {
  public readonly name: string = 'adapter.orbit';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }
}
