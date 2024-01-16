import { ProtocolConfigs } from '../../configs';
import { DAY } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { getDateString, getTimestamp, getTodayUTCTimestamp } from '../../lib/utils';
import { DataMetrics, MetricConfig } from '../../types/configs';
import { ContextServices, ContextStorages, ICollector, IProtocolAdapter } from '../../types/namespaces';
import { RunCollectorOptions } from '../../types/options';
import getProtocolAdapters from '../adapters';

export default class Collector implements ICollector {
  public readonly name: string = 'collector';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  protected readonly adapters: { [key: string]: IProtocolAdapter };

  constructor(storages: ContextStorages, services: ContextServices) {
    this.services = services;
    this.storages = storages;

    // get all supported adapters
    this.adapters = getProtocolAdapters(services);
  }

  private getAllConfigs(options: RunCollectorOptions): Array<MetricConfig> {
    const configs: Array<MetricConfig> = [];

    const protocolConfigs = Object.values(ProtocolConfigs).filter(
      (item) => options.protocol === undefined || options.protocol === item.protocol,
    );
    for (const protocolConfig of protocolConfigs) {
      for (const config of protocolConfig.configs) {
        if (options.chain === undefined || options.chain === config.chain) {
          configs.push(config);
        }
      }
    }

    return configs;
  }

  public async run(options: RunCollectorOptions): Promise<void> {
    await this.collectStates(options);
    await this.collectSnapshots(options);
  }

  protected async collectStates(options: RunCollectorOptions): Promise<void> {
    const configs = this.getAllConfigs(options);
    const timestamp = getTimestamp();
    for (const config of configs) {
      const result = await this.adapters[config.protocol].getStateData({
        config: config,
        timestamp: timestamp,
      });
      for (const data of result.data) {
        let collectionName: string | null = null;
        if (data.metric === DataMetrics.lending) {
          collectionName = EnvConfig.mongodb.collections.lendingMarketStates;
        }

        if (collectionName) {
          await this.storages.database.update({
            collection: collectionName,
            keys: {
              chain: data.chain,
              protocol: data.protocol,
              address: data.address,
              'token.address': data.token.address,
            },
            updates: {
              ...data,
            },
            upsert: true,
          });

          logger.info('updated latest data states', {
            service: this.name,
            metric: data.metric,
            chain: data.chain,
            protocol: data.protocol,
            token: data.token.symbol,
          });
        }
      }
    }
  }

  protected async collectSnapshots(options: RunCollectorOptions): Promise<void> {
    const configs = this.getAllConfigs(options);

    for (const config of configs) {
      const stateKey = `state-snapshot-${config.protocol}-${config.chain}-${config.metric}-${config.address}`;
      let runTime = options.fromTime ? options.fromTime : config.birthday;
      if (!options.force) {
        const latestState = await this.storages.database.find({
          collection: EnvConfig.mongodb.collections.states,
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

        if (this.adapters[config.protocol]) {
          const { data } = await this.adapters[config.protocol].getSnapshotData(
            {
              config: config,
              timestamp: runTime,
            },
            this.storages,
          );
          for (const snapshot of data) {
            await this.storages.database.update({
              collection: EnvConfig.mongodb.collections.lendingMarketSnapshots,
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

        const endExeTime = Math.floor(new Date().getTime() / 1000);
        const elapsed = endExeTime - startExeTime;

        logger.info('updated snapshot data', {
          service: this.name,
          chain: config.chain,
          protocol: config.protocol,
          metric: config.metric,
          address: config.address,
          date: getDateString(runTime),
          elapses: `${elapsed}s`,
        });

        runTime += DAY;
      }
    }
  }
}
