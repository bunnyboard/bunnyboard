import { ProtocolConfigs } from '../../configs';
import logger from '../../lib/logger';
import { sleep } from '../../lib/utils';
import { DataMetric, DataMetrics, MetricConfig } from '../../types/configs';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';
import { getProtocolAdapters } from '../adapters';

export interface RunProtocolCollectorOptions {
  metric?: Array<DataMetric>;

  // if chain was given, run collector with given chain
  chains?: Array<string>;

  // if the protocol was given, run collector with given protocol
  // and the chain option is just use for filter configs
  protocols?: Array<string>;

  // force sync from given from timestamp
  fromTime?: number;
  force?: boolean;
}

export default class Collector {
  public readonly name: string = 'collector';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  protected readonly adapters: { [key: string]: IProtocolAdapter };

  constructor(storages: ContextStorages, services: ContextServices) {
    this.services = services;
    this.storages = storages;

    // get all supported adapters
    this.adapters = getProtocolAdapters(services, storages);
  }

  private getAllConfigs(options: RunProtocolCollectorOptions): Array<MetricConfig> {
    const { metric, chains, protocols } = options;

    let configs: Array<MetricConfig> = [];
    for (const [, protocolConfig] of Object.entries(ProtocolConfigs)) {
      configs = configs.concat(protocolConfig.configs);
    }

    return configs
      .filter((config) => metric === undefined || metric.indexOf(config.metric) !== -1)
      .filter((config) => protocols === undefined || protocols.indexOf(config.protocol) !== -1)
      .filter((config) => chains === undefined || chains.indexOf(config.chain) !== -1);
  }

  private getAdapter(config: MetricConfig): IProtocolAdapter | null {
    let adapter = null;
    switch (config.metric) {
      case DataMetrics.crossLending:
      case DataMetrics.cdpLending:
      case DataMetrics.isolatedLending:
      case DataMetrics.flashloan:
      case DataMetrics.ecosystem: {
        adapter = this.adapters[config.protocol];
        break;
      }
    }

    return adapter;
  }

  public async run(options: RunProtocolCollectorOptions): Promise<void> {
    const configs = this.getAllConfigs(options);

    logger.info('start to run collector', {
      service: this.name,
      chain: options.chains ? options.chains.toString() : 'none',
      protocols: options.protocols ? options.protocols.toString() : 'none',
      metric: options.metric ? options.metric : 'none',
      configs: configs.length,
    });

    if (configs.length === 0) {
      process.exit(0);
    }

    for (const config of configs) {
      const adapter = this.getAdapter(config);
      if (adapter) {
        await adapter.run({
          metricConfig: config,
          fromTime: options.fromTime,
          force: options.force,
        });

        // sleep 60 seconds before run the next config
        await sleep(60);
      } else {
        logger.warn('can not find adapter for config', {
          service: this.name,
          metric: config.metric,
          protocol: config.protocol,
          chain: config.chain,
        });
      }
    }
  }
}
