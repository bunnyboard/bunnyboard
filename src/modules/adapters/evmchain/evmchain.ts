import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, IProtocolAdapter } from '../../../types/namespaces';
import ProtocolAdapter from '../adapter';

export default class EvmchainAdapter extends ProtocolAdapter implements IProtocolAdapter {
  public readonly name: string = 'adapter.evmchain';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);
  }
}
