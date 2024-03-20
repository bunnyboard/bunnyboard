import { TimeUnits } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { getDateString, getTodayUTCTimestamp } from '../../lib/utils';
import { RunCollectorOptions } from '../../types/collectors/options';
import { MetricConfig } from '../../types/configs';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';

export default class SnapshotCollector {
  public readonly name: string = 'collector.snapshot';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  protected readonly adapters: { [key: string]: IProtocolAdapter };

  constructor(storages: ContextStorages, services: ContextServices, adapters: { [key: string]: IProtocolAdapter }) {
    this.services = services;
    this.storages = storages;
    this.adapters = adapters;
  }

  public async collect(options: RunCollectorOptions, configs: Array<MetricConfig>): Promise<void> {
    for (const config of configs) {
      const stateKey = `state-snapshot-${config.protocol}-${config.chain}-${config.metric}-${config.address}`;
      let runTime = options.fromTime ? options.fromTime : config.birthday;
      if (!options.force) {
        const latestState = await this.storages.database.find({
          collection: EnvConfig.mongodb.collections.cachingStates.name,
          query: {
            name: stateKey,
          },
        });
        if (latestState) {
          runTime = latestState.timestamp > runTime ? latestState.timestamp : runTime;
        }
      }

      const today = getTodayUTCTimestamp();
      logger.info('start to get snapshots data', {
        service: this.name,
        chain: config.chain,
        protocol: config.protocol,
        metric: config.metric,
        address: config.address,
        fromDate: getDateString(runTime),
        toDate: getDateString(today),
      });

      while (runTime <= today) {
        const startExeTime = Math.floor(new Date().getTime() / 1000);

        const adapter = this.adapters[config.protocol];

        if (adapter) {
          const { crossLending, cdpLending } = await adapter.getDataTimeframe({
            storages: this.storages,
            config: config,
            fromTime: runTime,
            toTime: runTime + TimeUnits.SecondsPerDay - 1,
          });

          if (crossLending) {
            for (const snapshot of crossLending) {
              await this.storages.database.update({
                collection: EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name,
                keys: {
                  chain: snapshot.chain,
                  metric: snapshot.metric,
                  protocol: snapshot.protocol,
                  address: snapshot.address,
                  'token.address': snapshot.token.address,
                  timestamp: snapshot.timestamp,
                },
                updates: {
                  ...snapshot,
                },
                upsert: true,
              });
            }
          }

          if (cdpLending) {
            for (const snapshot of cdpLending) {
              await this.storages.database.update({
                collection: EnvConfig.mongodb.collections.cdpLendingAssetSnapshots.name,
                keys: {
                  chain: snapshot.chain,
                  metric: snapshot.metric,
                  protocol: snapshot.protocol,
                  'token.address': snapshot.token.address,
                  timestamp: snapshot.timestamp,
                },
                updates: {
                  ...snapshot,
                },
                upsert: true,
              });
            }
          }
        }

        await this.storages.database.update({
          collection: EnvConfig.mongodb.collections.cachingStates.name,
          keys: {
            name: stateKey,
          },
          updates: {
            name: stateKey,
            timestamp: runTime,
          },
          upsert: true,
        });

        const endExeTime = Math.floor(new Date().getTime() / 1000);
        const elapsed = endExeTime - startExeTime;

        logger.info('updated snapshot data', {
          service: this.name,
          chain: config.chain,
          protocol: config.protocol,
          metric: config.metric,
          address: config.address,
          date: getDateString(runTime),
          time: runTime,
          elapses: `${elapsed}s`,
        });

        runTime += TimeUnits.SecondsPerDay;
      }
    }
  }
}
