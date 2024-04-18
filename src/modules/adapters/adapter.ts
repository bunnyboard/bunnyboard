import { TimeUnits } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { getDateString, getTodayUTCTimestamp } from '../../lib/utils';
import { MetricConfig, ProtocolConfig } from '../../types/configs';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';
import { AdapterAbiConfigs, RunAdapterOptions } from '../../types/options';

export interface AdapterGetEventLogsOptions {
  metricConfig: MetricConfig;
  fromBlock: number;
  toBlock: number;
}

export default class ProtocolAdapter implements IProtocolAdapter {
  public readonly name: string = 'adapter';

  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  public readonly protocolConfig: ProtocolConfig;

  public readonly abiConfigs: AdapterAbiConfigs;

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    this.services = services;
    this.storages = storages;

    this.protocolConfig = protocolConfig;

    this.abiConfigs = {
      eventSignatures: {},
      eventAbis: {},
    };
  }

  public async run(options: RunAdapterOptions): Promise<void> {
    logger.info('start to run adapter', {
      service: this.name,
      metric: options.metricConfig.metric,
      protocol: options.metricConfig.protocol,
      address: options.metricConfig.address,
      fromTime: options.fromTime ? options.fromTime : 'none',
      force: options.force ? options.force : false,
    });

    const startExeTime = Math.floor(new Date().getTime() / 1000);

    await this.collectDataState(options);

    const endExeTime = Math.floor(new Date().getTime() / 1000);
    const elapsed = endExeTime - startExeTime;

    logger.info('updated adapter data state', {
      service: this.name,
      chain: options.metricConfig.chain,
      protocol: options.metricConfig.protocol,
      metric: options.metricConfig.metric,
      address: options.metricConfig.address,
      elapses: `${elapsed}s`,
    });

    await this.collectSnapshots(options);
  }

  protected async getEventLogs(options: AdapterGetEventLogsOptions): Promise<Array<any>> {
    return [];
  }

  protected async getSnapshot(config: MetricConfig, fromTime: number, toTime: number): Promise<any> {
    return null;
  }

  protected async processSnapshot(config: MetricConfig, snapshot: any): Promise<void> {}

  protected async collectDataState(options: RunAdapterOptions): Promise<void> {}

  protected async collectSnapshots(options: RunAdapterOptions): Promise<void> {
    const config = options.metricConfig;

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
    logger.info('start to get adapter data snapshots', {
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

      const snapshot = await this.getSnapshot(config, runTime, runTime + TimeUnits.SecondsPerDay - 1);

      if (snapshot) {
        await this.processSnapshot(config, snapshot);
      }

      if (!options.force) {
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
      }

      const endExeTime = Math.floor(new Date().getTime() / 1000);
      const elapsed = endExeTime - startExeTime;

      logger.info('updated adapter data snapshot', {
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
