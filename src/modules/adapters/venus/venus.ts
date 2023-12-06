import { ProtocolConfig } from '../../../types/configs';
import { LendingCdpSnapshot, LendingMarketSnapshot } from '../../../types/domains';
import { ContextServices, IProtocolAdapter } from '../../../types/namespaces';
import { GetLendingMarketSnapshotOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import { CompoundEventInterfaces } from '../compound/abis';
import CompoundAdapter from '../compound/compound';
import {
  VenusCoreEventAbiMappings,
  VenusCoreEventSignatures,
  VenusIsolatedEventAbiMappings,
  VenusIsolatedEventSignatures,
} from './abis';

class VenusIsolatedAdapter extends CompoundAdapter {
  public readonly name: string = 'adapter.venusIsolated';

  protected readonly eventSignatures: CompoundEventInterfaces;
  protected readonly eventAbiMappings: { [key: string]: Array<any> };

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.eventSignatures = VenusIsolatedEventSignatures;
    this.eventAbiMappings = VenusIsolatedEventAbiMappings;
  }
}

class VenusCoreAdapter extends CompoundAdapter {
  public readonly name: string = 'adapter.venusCore';

  protected readonly eventSignatures: CompoundEventInterfaces;
  protected readonly eventAbiMappings: { [key: string]: Array<any> };

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.eventSignatures = VenusCoreEventSignatures;
    this.eventAbiMappings = VenusCoreEventAbiMappings;
  }
}

export default class VenusAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.venus';

  private corePoolAdapter: IProtocolAdapter;
  private isolatedPoolAdapter: IProtocolAdapter;

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.corePoolAdapter = new VenusCoreAdapter(services, config);
    this.isolatedPoolAdapter = new VenusIsolatedAdapter(services, config);
  }

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot | LendingCdpSnapshot> | null> {
    if (options.config.version === 'compound') {
      return await this.corePoolAdapter.getLendingMarketSnapshots(options);
    } else if (options.config.version === 'venusIsolated') {
      return await this.isolatedPoolAdapter.getLendingMarketSnapshots(options);
    }

    return null;
  }
}
