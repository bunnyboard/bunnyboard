import { ChainBoardConfigs } from '../../configs';
import logger from '../../lib/logger';
import { sleep } from '../../lib/utils';
import { ChainBoardConfig } from '../../types/configs';
import { ContextServices, ContextStorages } from '../../types/namespaces';
import EvmChainAdapter from '../adapters/ethereum/evm';

export interface RunChainBoardCollectorOptions {
  // if chain was given, run collector with given chain
  chains?: Array<string>;

  // force sync from given from timestamp
  fromTime?: number;
  force?: boolean;
}

export default class ChainBoardCollector {
  public readonly name: string = 'collector.chainBoard';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  constructor(services: ContextServices, storages: ContextStorages) {
    this.services = services;
    this.storages = storages;
  }

  private getAllConfigs(options: RunChainBoardCollectorOptions): Array<ChainBoardConfig> {
    const { chains } = options;
    return ChainBoardConfigs.filter((config) => chains === undefined || chains.indexOf(config.chain) !== -1);
  }

  public async run(options: RunChainBoardCollectorOptions): Promise<void> {
    const configs = this.getAllConfigs(options);

    logger.info('start to run chain board collector', {
      service: this.name,
      chain: options.chains ? options.chains.toString() : 'none',
      configs: configs.length,
    });

    const adapter = new EvmChainAdapter(this.services, this.storages);

    for (const config of configs) {
      await adapter.run({
        chainConfig: config,
        fromTime: options.fromTime,
        force: options.force,
      });

      // sleep 60 seconds before run the next config
      await sleep(60);
    }
  }
}
