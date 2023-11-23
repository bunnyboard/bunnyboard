import EnvConfig from '../../configs/envConfig';
import { normalizeAddress } from '../../lib/utils';
import { LendingMarketConfig } from '../../types/configs';
import { CollectorType, ContextServices, ICollector } from '../../types/namespaces';
import { RunCollectorOptions } from '../../types/options';

export interface GetLastSnapshotTimestampOptions {
  config: LendingMarketConfig;
}

export default class Collector implements ICollector {
  public readonly name: string = 'collector';
  public readonly type: CollectorType = 'none';
  public readonly services: ContextServices;

  constructor(services: ContextServices) {
    this.services = services;
  }

  protected async getLastSnapshotTimestamp(options: GetLastSnapshotTimestampOptions): Promise<number> {
    let config = options.config;
    if (this.type === 'lending') {
      config = config as LendingMarketConfig;
    }

    const collection =
      this.type === 'lending'
        ? EnvConfig.mongodb.collections.lendingMarketSnapshots
        : EnvConfig.mongodb.collections.lendingMarketSnapshots;

    const latestSnapshot = await this.services.database.find({
      collection: collection,
      query: {
        chain: options.config.chain,
        protocol: options.config.protocol,
        address: normalizeAddress(config.address),
      },
      options: {
        limit: 1,
        skip: 0,
        order: { timestamp: -1 },
      },
    });

    if (latestSnapshot) {
      return Number(latestSnapshot.timestamp);
    }

    return 0;
  }

  public async run(options: RunCollectorOptions): Promise<void> {}
}
