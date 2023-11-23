import { ProtocolConfig } from '../../types/configs';
import { LendingMarketSnapshot } from '../../types/domains';
import { ContextServices, IProtocolAdapter } from '../../types/namespaces';
import { GetLendingMarketSnapshotOptions } from '../../types/options';

export default class ProtocolAdapter implements IProtocolAdapter {
  public readonly name: string = 'adapter';
  public readonly services: ContextServices;
  public readonly config: ProtocolConfig;

  constructor(services: ContextServices, config: ProtocolConfig) {
    this.services = services;
    this.config = config;
  }

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot> | null> {
    return [];
  }
}
