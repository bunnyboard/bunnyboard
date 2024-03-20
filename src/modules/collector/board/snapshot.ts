import { TimeUnits } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import logger from '../../../lib/logger';
import { getDateString, getTodayUTCTimestamp } from '../../../lib/utils';
import { RunCollectorOptions } from '../../../types/collectors/options';
import { DataMetrics, MetricConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { IBoardAdapter } from '../../../types/namespaces';

export default class BoardSnapshotCollector {
  public readonly name: string = 'collector.board.snapshot';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  protected readonly adapters: { [key: string]: IBoardAdapter };

  constructor(storages: ContextStorages, services: ContextServices, adapters: { [key: string]: IBoardAdapter }) {
    this.services = services;
    this.storages = storages;
    this.adapters = adapters;
  }

  public async collect(options: RunCollectorOptions, configs: Array<MetricConfig>): Promise<void> {
    for (const config of configs) {
      if (config.metric === DataMetrics.tokenBoardErc20) {
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

          const adapter = this.adapters.tokenboard;

          const snapshot = await adapter.getDataTimeframe(config, runTime, runTime + TimeUnits.SecondsPerDay - 1);

          if (snapshot) {
            await this.storages.database.update({
              collection: EnvConfig.mongodb.collections.tokenBoardErc20Snapshots.name,
              keys: {
                chain: snapshot.chain,
                metric: snapshot.metric,
                protocol: snapshot.protocol,
                address: snapshot.address,
                timestamp: snapshot.timestamp,
              },
              updates: {
                ...snapshot,
              },
              upsert: true,
            });

            const operations: Array<any> = [];
            for (const addressBalance of snapshot.addressBalances) {
              operations.push({
                updateOne: {
                  filter: {
                    chain: addressBalance.chain,
                    address: addressBalance.address, // token address
                    holder: addressBalance.holder, // holder address
                  },
                  update: {
                    $set: {
                      ...addressBalance,
                    },
                  },
                  upsert: true,
                },
              });
            }
            await this.storages.database.bulkWrite({
              collection: EnvConfig.mongodb.collections.tokenBoardErc20Balances.name,
              operations: operations,
            });
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
}
