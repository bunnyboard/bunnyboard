import { ProtocolConfigs } from '../../configs';
import { TimeUnits } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { getDateString, getTimestamp, getTodayUTCTimestamp } from '../../lib/utils';
import { RunCollectorOptions } from '../../types/collectors/options';
import { DataMetrics, MetricConfig } from '../../types/configs';
import { ContextServices, ContextStorages, IDataCollector, IProtocolAdapter } from '../../types/namespaces';
import { getProtocolAdapters } from '../adapters';
import TokenBoardErc20Adapter from '../adapters/tokenboard/erc20';
import DataCollectorProcessor from './processor';

export interface ProcessDataStateOptions {
  timestamp: number;
  state: any;
  timeframeLast24Hours: any;
  timeframeLast48Hours: any;
}

export interface ProcessDataSnapshotOptions {
  data: any;
}

export default class DataCollector implements IDataCollector {
  public readonly name: string = 'collector';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  protected readonly adapters: { [key: string]: IProtocolAdapter };
  protected readonly processor: DataCollectorProcessor;

  constructor(storages: ContextStorages, services: ContextServices) {
    this.services = services;
    this.storages = storages;
    this.processor = new DataCollectorProcessor(storages, services);

    // get all supported adapters
    this.adapters = getProtocolAdapters(services);
  }

  private getAllConfigs(options: RunCollectorOptions): Array<MetricConfig> {
    const { metric, chain, protocol } = options;

    let configs: Array<MetricConfig> = [];
    for (const [, protocolConfig] of Object.entries(ProtocolConfigs)) {
      configs = configs.concat(protocolConfig.configs);
    }

    return configs
      .filter((config) => metric === undefined || metric === config.metric)
      .filter((config) => protocol === undefined || protocol === config.protocol)
      .filter((config) => chain === undefined || chain === config.chain);
  }

  private getAdapter(config: MetricConfig): IProtocolAdapter | null {
    let adapter = null;
    switch (config.metric) {
      case DataMetrics.tokenBoardErc20: {
        adapter = new TokenBoardErc20Adapter(this.services);
        break;
      }
      case DataMetrics.crossLending:
      case DataMetrics.cdpLending:
      case DataMetrics.dex: {
        adapter = this.adapters[config.protocol];
        break;
      }
    }

    return adapter;
  }

  public async run(options: RunCollectorOptions): Promise<void> {
    const configs = this.getAllConfigs(options);
    const { service } = options;

    logger.info('start to run data collector', {
      service: this.name,
      metric: options.metric ? options.metric : 'none',
      chain: options.chain ? options.chain : 'none',
      protocol: options.protocol ? options.protocol : 'none',
      type: options.service ? options.service : 'none',
      configs: configs.length,
    });

    if (!service || service === 'state') {
      await this.collectStateData(options, configs);
    }

    if (!service || service === 'snapshot') {
      await this.collectSnapshotData(options, configs);
    }
  }

  public async collectStateData(options: RunCollectorOptions, configs: Array<MetricConfig>): Promise<void> {
    const timestamp = getTimestamp();

    for (const config of configs) {
      const startExeTime = Math.floor(new Date().getTime() / 1000);

      const adapter = this.getAdapter(config);
      if (adapter) {
        const state = await adapter.getDataState({
          config: config,
          timestamp: timestamp,
        });

        const timeframeLast24Hours = await adapter.getDataTimeframe({
          config: config,
          fromTime: timestamp - TimeUnits.SecondsPerDay,
          toTime: timestamp,
        });

        const timeframeLast48Hours = await adapter.getDataTimeframe({
          config: config,
          fromTime: timestamp - TimeUnits.SecondsPerDay * 2,
          toTime: timestamp - TimeUnits.SecondsPerDay,
        });

        await this.processor.processDataState(config, {
          timestamp: timestamp,
          state: state,
          timeframeLast24Hours: timeframeLast24Hours,
          timeframeLast48Hours: timeframeLast48Hours,
        });

        const endExeTime = Math.floor(new Date().getTime() / 1000);
        const elapsed = endExeTime - startExeTime;

        logger.info('updated state data', {
          service: this.name,
          chain: config.chain,
          protocol: config.protocol,
          metric: config.metric,
          address: config.address,
          elapses: `${elapsed}s`,
        });
      }
    }
  }

  public async collectSnapshotData(options: RunCollectorOptions, configs: Array<MetricConfig>): Promise<void> {
    for (const config of configs) {
      const adapter = this.getAdapter(config);
      if (adapter) {
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

          if (adapter) {
            const result = await adapter.getDataTimeframe({
              config: config,
              fromTime: runTime,
              toTime: runTime + TimeUnits.SecondsPerDay - 1,
            });

            await this.processor.processDataSnapshots(config, {
              data: result,
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
