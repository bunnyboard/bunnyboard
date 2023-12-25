import { ProtocolConfig } from '../../types/configs';
import { LendingActivityEvent, LendingMarketSnapshot } from '../../types/domains/lending';
import { MasterchefActivityEvent, MasterchefPoolSnapshot } from '../../types/domains/masterchef';
import { ContextServices, IProtocolAdapter } from '../../types/namespaces';
import {
  AdapterAbiConfigs,
  GetChainMetricSnapshotOptions,
  GetLendingMarketSnapshotOptions,
  GetMasterchefSnapshotOptions,
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

  public async getLendingMarketActivities(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingActivityEvent>> {
    return [];
  }

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot> | null> {
    return [];
  }

  public async getMasterchefActivities(options: GetMasterchefSnapshotOptions): Promise<Array<MasterchefActivityEvent>> {
    return [];
  }

  public async getMasterchefSnapshots(
    options: GetMasterchefSnapshotOptions,
  ): Promise<Array<MasterchefPoolSnapshot> | null> {
    return [];
  }
}
