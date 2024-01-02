import { ProtocolConfig } from '../../types/configs';
import { ContextServices, IProtocolAdapter } from '../../types/namespaces';
import {
  AdapterAbiConfigs,
  GetChainMetricSnapshotOptions,
  GetSnapshotOptions,
  GetSnapshotResult,
} from '../../types/options';

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

  public async getChainMetricSnapshots(options: GetChainMetricSnapshotOptions): Promise<Array<any>> {
    return [];
  }

  public async getLendingMarketSnapshots(options: GetSnapshotOptions): Promise<GetSnapshotResult> {
    return {
      activities: [],
      snapshots: [],
    };
  }

  public async getMasterchefSnapshots(options: GetSnapshotOptions): Promise<GetSnapshotResult> {
    return {
      activities: [],
      snapshots: [],
    };
  }
}
