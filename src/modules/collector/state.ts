import { DAY } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { getTimestamp } from '../../lib/utils';
import { CrossLendingMarketDataTimeframeWithChanges } from '../../types/collectors/lending';
import { RunCollectorOptions } from '../../types/collectors/options';
import { MetricConfig } from '../../types/configs';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';
import CollectorDataTransform from './transform/data';

export default class StateCollector {
  public readonly name: string = 'collector.state';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  protected readonly adapters: { [key: string]: IProtocolAdapter };

  constructor(storages: ContextStorages, services: ContextServices, adapters: { [key: string]: IProtocolAdapter }) {
    this.services = services;
    this.storages = storages;
    this.adapters = adapters;
  }

  public async collect(options: RunCollectorOptions, configs: Array<MetricConfig>): Promise<void> {
    const timestamp = getTimestamp();
    for (const config of configs) {
      const startExeTime = Math.floor(new Date().getTime() / 1000);

      const state = await this.adapters[config.protocol].getDataState({
        config: config,
        timestamp: timestamp,
      });

      const timeframeLast24Hours = await this.adapters[config.protocol].getDataTimeframe(
        {
          config: config,
          fromTime: timestamp - DAY,
          toTime: timestamp,
        },
        this.storages,
      );

      const timeframeLast48Hours = await this.adapters[config.protocol].getDataTimeframe(
        {
          config: config,
          fromTime: timestamp - DAY * 2,
          toTime: timestamp - DAY,
        },
        this.storages,
      );

      if (state.crossLending) {
        for (const data of state.crossLending) {
          let stateWithChanges: CrossLendingMarketDataTimeframeWithChanges =
            CollectorDataTransform.transformCrossLendingStates(data, undefined, undefined);

          if (timeframeLast24Hours.crossLending && timeframeLast48Hours.crossLending) {
            const dataLast24Hours = timeframeLast24Hours.crossLending.filter(
              (item) =>
                item.chain === data.chain &&
                item.protocol === data.protocol &&
                item.address === data.address &&
                item.token.address === data.token.address,
            )[0];
            const dataLast48Hours = timeframeLast48Hours.crossLending.filter(
              (item) =>
                item.chain === data.chain &&
                item.protocol === data.protocol &&
                item.address === data.address &&
                item.token.address === data.token.address,
            )[0];
            if (dataLast24Hours && dataLast48Hours) {
              stateWithChanges = CollectorDataTransform.transformCrossLendingStates(
                data,
                dataLast24Hours,
                dataLast48Hours,
              );
            }
          }

          await this.storages.database.update({
            collection: EnvConfig.mongodb.collections.lendingMarketStates,
            keys: {
              chain: data.chain,
              protocol: data.protocol,
              address: data.address,
              'token.address': data.token.address,
            },
            updates: {
              ...stateWithChanges,
            },
            upsert: true,
          });
        }
      }

      if (state.cdpLending) {
        for (const data of state.cdpLending) {
          await this.storages.database.update({
            collection: EnvConfig.mongodb.collections.lendingMarketStates,
            keys: {
              chain: data.chain,
              protocol: data.protocol,
              'token.address': data.token.address,
            },
            updates: {
              ...data,
            },
            upsert: true,
          });
        }
      }

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
