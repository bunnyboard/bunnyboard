import { ProtocolConfigs } from '../../configs';
import logger from '../../lib/logger';
import { RunCollectorOptions } from '../../types/collectors/options';
import { MetricConfig } from '../../types/configs';
import { ContextServices, ContextStorages, ICollector, IProtocolAdapter } from '../../types/namespaces';
import getProtocolAdapters from '../adapters';
import SnapshotCollector from './snapshot';
import StateCollector from './state';

export default class Collector implements ICollector {
  public readonly name: string = 'collector';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  private readonly _stateCollector: StateCollector;
  private readonly _snapshotCollector: SnapshotCollector;

  protected readonly adapters: { [key: string]: IProtocolAdapter };

  constructor(storages: ContextStorages, services: ContextServices) {
    this.services = services;
    this.storages = storages;

    // get all supported adapters
    this.adapters = getProtocolAdapters(services);

    this._stateCollector = new StateCollector(storages, services, this.adapters);
    this._snapshotCollector = new SnapshotCollector(storages, services, this.adapters);
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
    const configs = this.getAllConfigs(options);
    const { service } = options;

    logger.info('start to run data collector', {
      service: this.name,
      chain: options.chain ? options.chain : 'none',
      protocol: options.protocol ? options.protocol : 'none',
      type: options.service ? options.service : 'all',
    });

    if (!service || service === 'state') {
      await this._stateCollector.collect(options, configs);
    }

    if (!service || service === 'snapshot') {
      await this._snapshotCollector.collect(options, configs);
    }
  }
}
