import {
  AdapterAbiConfigs,
  GetAdapterDataStateOptions,
  GetAdapterDataStateResult,
  GetAdapterDataTimeframeOptions,
  GetAdapterDataTimeframeResult,
  GetAdapterEventLogsOptions,
  TransformEventLogOptions,
  TransformEventLogResult,
} from '../../types/collectors/options';
import { ProtocolConfig } from '../../types/configs';
import { ContextServices, IProtocolAdapter } from '../../types/namespaces';

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
      eventAbis: {},
    };
  }

  public async getDataState(options: GetAdapterDataStateOptions): Promise<GetAdapterDataStateResult> {
    return {
      crossLending: null,
      cdpLending: null,
    };
  }

  public async getDataTimeframe(options: GetAdapterDataTimeframeOptions): Promise<GetAdapterDataTimeframeResult> {
    return {
      crossLending: null,
      cdpLending: null,
    };
  }

  public async getEventLogs(options: GetAdapterEventLogsOptions): Promise<Array<any>> {
    return [];
  }

  public async transformEventLogs(options: TransformEventLogOptions): Promise<TransformEventLogResult> {
    return {
      activities: [],
    };
  }
}
