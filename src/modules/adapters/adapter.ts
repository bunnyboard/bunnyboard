import { compareAddress } from '../../lib/utils';
import { ProtocolConfig } from '../../types/configs';
import { ContextServices, IProtocolAdapter } from '../../types/namespaces';
import { AdapterAbiConfigs, TransformEventLogOptions, TransformEventLogResult } from '../../types/options';

export default class ProtocolAdapter implements IProtocolAdapter {
  public readonly name: string = 'adapter';
  public readonly services: ContextServices;
  public readonly config: ProtocolConfig;
  public readonly abiConfigs: AdapterAbiConfigs;

  constructor(services: ContextServices, config: ProtocolConfig) {
    this.services = services;
    this.config = config;

    this.abiConfigs = {
      eventSignatures: {},
    };
  }

  protected supportSignature(signature: string): boolean {
    for (const sig of Object.values(this.abiConfigs.eventSignatures)) {
      if (sig === signature) {
        return true;
      }
    }

    return false;
  }

  protected supportContract(address: string): boolean {
    for (const contract of this.config.configs) {
      if (compareAddress(address, contract.address)) {
        return true;
      }
    }

    return false;
  }

  public async transformEventLogs(options: TransformEventLogOptions): Promise<TransformEventLogResult> {
    return {
      activities: [],
    };
  }
}
