import { ProtocolConfigs } from '../../configs';
import logger from '../../lib/logger';
import { MetricConfig } from '../../types/configs';
import { ContextServices, ContextStorages } from '../../types/namespaces';
import TokenBoardAdapter from '../adapters/tokenBoard/tokenBoard';
import { RunProtocolCollectorOptions } from './protocol';

export default class TokenBoardCollector {
  public readonly name: string = 'collector.tokenBoard';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  constructor(storages: ContextStorages, services: ContextServices) {
    this.services = services;
    this.storages = storages;
  }

  private getAllConfigs(options: RunProtocolCollectorOptions): Array<MetricConfig> {
    const { chain, protocol } = options;

    return ProtocolConfigs.tokenBoard.configs
      .filter((config) => protocol === undefined || protocol === config.protocol)
      .filter((config) => chain === undefined || chain === config.chain);
  }

  public async run(options: RunProtocolCollectorOptions): Promise<void> {
    const configs = this.getAllConfigs(options);

    logger.info('start to run collector', {
      service: this.name,
      configs: configs.length,
    });

    for (const config of configs) {
      const adapter = new TokenBoardAdapter(this.services, this.storages, ProtocolConfigs.tokenBoard);
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
