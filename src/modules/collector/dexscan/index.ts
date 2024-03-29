import { DexscanConfigs } from '../../../configs/boards/dexscan';
import logger from '../../../lib/logger';
import { DexConfig, DexVersions } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { RunProtocolCollectorOptions } from '../protocol';
import UniswapSubgraphScanner from './scanner/uniswapSubgraph';

export default class DexscanCollector {
  public readonly name: string = 'collector.dexscan';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  constructor(storages: ContextStorages, services: ContextServices) {
    this.services = services;
    this.storages = storages;
  }

  public async run(options: RunProtocolCollectorOptions): Promise<void> {
    const configs: Array<DexConfig> = DexscanConfigs.filter(
      (config) => options.chain === undefined || options.chain === config.chain,
    ).filter((config) => options.protocol === undefined || options.protocol === config.protocol);

    logger.info('start to scan dex data', {
      service: this.name,
      configs: configs.length,
    });

    for (const config of configs) {
      switch (config.version) {
        case DexVersions.univ2:
        case DexVersions.univ3: {
          await UniswapSubgraphScanner.scanLiquidityTokens({
            dexConfig: config,
            storages: this.storages,
            services: this.services,
          });
        }
      }
    }
  }
}
