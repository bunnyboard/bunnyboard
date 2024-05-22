import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import CompoundWithOracleEthAdapter from '../compound/compoundWithOracleEth';

export default class IonicAdapter extends CompoundWithOracleEthAdapter {
  public readonly name: string = 'adapter.ionic';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }
}
