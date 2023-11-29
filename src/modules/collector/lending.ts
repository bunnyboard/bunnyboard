import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { getTodayUTCTimestamp } from '../../lib/utils';
import { LendingMarketConfig } from '../../types/configs';
import { CollectorType, ContextServices } from '../../types/namespaces';
import { RunCollectorOptions } from '../../types/options';
import getProtocolAdapters from '../adapters';
import Collector from './collector';

export default class LendingCollector extends Collector {
  public readonly name: string = 'collector.lending';
  public readonly type: CollectorType = 'lending';
  public readonly markets: Array<LendingMarketConfig> = [];

  constructor(services: ContextServices, markets: Array<LendingMarketConfig>) {
    super(services);

    this.markets = markets;
  }

  public async run(options: RunCollectorOptions): Promise<void> {
    const adapters = getProtocolAdapters(this.services);

    logger.info('start to update lending market snapshots', {
      service: this.name,
      total: this.markets.length,
    });

    for (const market of this.markets) {
      let startTimestamp = market.birthday;
      if (options.timestamp) {
        startTimestamp = options.timestamp;
      } else {
        const lastTimestamp = await this.getLastSnapshotTimestamp({
          config: market,
        });
        if (lastTimestamp > startTimestamp) {
          startTimestamp = lastTimestamp;
        }
      }

      const todayTimestamp = getTodayUTCTimestamp();
      while (startTimestamp <= todayTimestamp) {
        const snapshots = await adapters[market.protocol].getLendingMarketSnapshots({
          config: market,
          timestamp: startTimestamp,
        });

        if (snapshots) {
          for (const snapshot of snapshots) {
            console.log(snapshot)
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
