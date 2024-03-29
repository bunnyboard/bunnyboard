import { ProtocolConfigs } from '../../configs';
import logger from '../../lib/logger';
import { DataMetric, DataMetrics, MetricConfig } from '../../types/configs';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';
import { getProtocolAdapters } from '../adapters';

export interface RunProtocolCollectorOptions {
  metric?: DataMetric;

  // if chain was given, run collector with given chain
  chain?: string;

  // if the protocol was given, run collector with given protocol
  // and the chain option is just use for filter configs
  protocol?: string;

  // force sync from given from timestamp
  fromTime?: number;
  force?: boolean;
}

export default class ProtocolCollector {
  public readonly name: string = 'collector.protocol';
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
      case DataMetrics.crossLending:
      case DataMetrics.cdpLending:
      case DataMetrics.dex: {
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
      chain: options.chain ? options.chain : 'none',
      protocol: options.protocol ? options.protocol : 'none',
      metric: options.metric ? options.metric : 'none',
      configs: configs.length,
    });

    for (const config of configs) {
      const adapter = this.getAdapter(config);
      if (adapter) {
        await adapter.run({
          metricConfig: config,
          fromTime: options.fromTime,
          force: options.force,
        });
      }
    }
  }
}
