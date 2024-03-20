import { BoardConfigs } from '../../../configs';
import logger from '../../../lib/logger';
import { RunCollectorOptions } from '../../../types/collectors/options';
import { MetricConfig } from '../../../types/configs';
import { ContextServices, ContextStorages, IBoardAdapter, ICollector } from '../../../types/namespaces';
import { getBoardAdapters } from '../../adapters';
import BoardSnapshotCollector from './snapshot';
import BoardStateCollector from './state';

export default class BoardCollector implements ICollector {
  public readonly name: string = 'collector.board';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  private readonly _stateCollector: BoardStateCollector;
  private readonly _snapshotCollector: BoardSnapshotCollector;

  protected readonly adapters: { [key: string]: IBoardAdapter };

  constructor(storages: ContextStorages, services: ContextServices) {
    this.services = services;
    this.storages = storages;

    // get all supported adapters
    this.adapters = getBoardAdapters(services);

    this._stateCollector = new BoardStateCollector(storages, services, this.adapters);
    this._snapshotCollector = new BoardSnapshotCollector(storages, services, this.adapters);
  }

  private getAllConfigs(options: RunCollectorOptions): Array<MetricConfig> {
    const configs: Array<MetricConfig> = [];

    const boardConfigs = Object.values(BoardConfigs).filter(
      (item) => options.board === undefined || options.board === item.board,
    );
    for (const boardConfig of boardConfigs) {
      for (const config of boardConfig.configs) {
        if (options.protocol === undefined || options.protocol === config.protocol) {
          if (options.chain === undefined || options.chain === config.chain) {
            configs.push(config);
          }
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
