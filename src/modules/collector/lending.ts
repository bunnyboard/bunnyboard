import { ProtocolConfigs } from '../../configs';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { getTodayUTCTimestamp } from '../../lib/utils';
import { ProtocolConfig } from '../../types/configs';
import { CollectorType, ContextServices } from '../../types/namespaces';
import { RunCollectorOptions } from '../../types/options';
import getProtocolAdapters from '../adapters';
import Collector from './collector';

export default class LendingCollector extends Collector {
  public readonly name: string = 'collector.lending';
  public readonly type: CollectorType = 'lending';

  constructor(services: ContextServices) {
    super(services);
  }

  public async run(options: RunCollectorOptions): Promise<void> {
    const adapters = getProtocolAdapters(this.services);

    let configs: Array<ProtocolConfig> = Object.values(ProtocolConfigs);
    if (options.chain) {
      configs = configs.filter((item) => item.chains.indexOf(options.chain as string) !== -1);
    }
    if (options.protocol) {
      configs = configs.filter((item) => item.protocol === options.protocol);
    }

    for (const protocol of configs) {
      if (protocol.lendingMarkets && adapters[protocol.protocol]) {
        logger.info('start to update lending market snapshots', {
          service: this.name,
          protocol: protocol.protocol,
          markets: protocol.lendingMarkets.length,
        });

        for (const lendingMarket of protocol.lendingMarkets) {
          let startTimestamp = lendingMarket.birthday;
          if (options.timestamp) {
            startTimestamp = options.timestamp;
          } else {
            const lastTimestamp = await this.getLastSnapshotTimestamp({
              config: lendingMarket,
            });
            if (lastTimestamp > startTimestamp) {
              startTimestamp = lastTimestamp;
            }
          }

          const todayTimestamp = getTodayUTCTimestamp();
          while (startTimestamp <= todayTimestamp) {
            const snapshots = await adapters[protocol.protocol].getLendingMarketSnapshots({
              config: lendingMarket,
              timestamp: startTimestamp,
            });

            if (snapshots) {
              for (const snapshot of snapshots) {
                await this.services.database.update({
                  collection: EnvConfig.mongodb.collections.lendingMarketSnapshots,
                  keys: {
                    marketId: snapshot.marketId,
                    timestamp: snapshot.timestamp,
                  },
                  updates: {
                    ...snapshot,
                  },
                  upsert: true,
                });
              }
            }

            startTimestamp += 24 * 60 * 60;
          }
        }
      }
    }
  }
}
