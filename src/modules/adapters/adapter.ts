import {
  AdapterAbiConfigs,
  GetAdapterDataStateOptions,
  GetAdapterDataTimeframeOptions,
} from '../../types/collectors/options';
import { MetricConfig } from '../../types/configs';
import { ContextServices, IProtocolAdapter } from '../../types/namespaces';

export default class ProtocolAdapter implements IProtocolAdapter {
  public readonly name: string = 'adapter';
  public readonly services: ContextServices;
  public readonly abiConfigs: AdapterAbiConfigs;

  constructor(services: ContextServices) {
    this.services = services;

    this.abiConfigs = {
      eventSignatures: {},
      eventAbis: {},
    };
  }

  public async getDataState(options: GetAdapterDataStateOptions): Promise<any> {
    return null;
  }

  public async getDataTimeframe(options: GetAdapterDataTimeframeOptions): Promise<any> {
    return null;
  }

  public async getEventLogs(config: MetricConfig, fromBlock: number, toBlock: number): Promise<Array<any>> {
    return [];
  }
}
