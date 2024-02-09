import { DAY } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { getTimestamp } from '../../lib/utils';
import {
  CdpLendingMarketDataStateWithTimeframes,
  CrossLendingMarketDataStateWithTimeframes,
} from '../../types/collectors/lending';
import { RunCollectorOptions } from '../../types/collectors/options';
import { PerpetualMarketDataStateWithTimeframes } from '../../types/collectors/perpetutal';
import { MetricConfig } from '../../types/configs';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';

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

      const timeframeLast24Hours = await this.adapters[config.protocol].getDataTimeframe({
        config: config,
        fromTime: timestamp - DAY,
        toTime: timestamp,
      });

      const timeframeLast48Hours = await this.adapters[config.protocol].getDataTimeframe({
        config: config,
        fromTime: timestamp - DAY * 2,
        toTime: timestamp - DAY,
      });

      if (state.crossLending) {
        for (const dateState of state.crossLending) {
          let stateWithTimeframes: CrossLendingMarketDataStateWithTimeframes = {
            ...dateState,
            timeframe24Hours: null,
            timeframe48Hours: null,
          };

          if (timeframeLast24Hours.crossLending) {
            const dataLast24Hours = timeframeLast24Hours.crossLending.filter(
              (item) =>
                item.chain === dateState.chain &&
                item.protocol === dateState.protocol &&
                item.address === dateState.address &&
                item.token.address === dateState.token.address,
            )[0];
            if (dataLast24Hours) {
              stateWithTimeframes.timeframe24Hours = dataLast24Hours;
            }
          }

          if (timeframeLast48Hours.crossLending) {
            const dataLast48Hours = timeframeLast48Hours.crossLending.filter(
              (item) =>
                item.chain === dateState.chain &&
                item.protocol === dateState.protocol &&
                item.address === dateState.address &&
                item.token.address === dateState.token.address,
            )[0];
            if (dataLast48Hours) {
              stateWithTimeframes.timeframe48Hours = dataLast48Hours;
            }
          }

          await this.storages.database.update({
            collection: EnvConfig.mongodb.collections.lendingMarketStates,
            keys: {
              chain: dateState.chain,
              metric: dateState.metric,
              protocol: dateState.protocol,
              address: dateState.address,
              'token.address': dateState.token.address,
            },
            updates: {
              ...stateWithTimeframes,
            },
            upsert: true,
          });
        }
      }

      if (state.cdpLending) {
        for (const dataState of state.cdpLending) {
          let stateWithTimeframes: CdpLendingMarketDataStateWithTimeframes = {
            ...dataState,
            timeframe24Hours: null,
            timeframe48Hours: null,
          };

          if (timeframeLast24Hours.cdpLending) {
            const dataLast24Hours = timeframeLast24Hours.cdpLending.filter(
              (item) =>
                item.chain === dataState.chain &&
                item.protocol === dataState.protocol &&
                item.token.address === dataState.token.address,
            )[0];
            if (dataLast24Hours) {
              stateWithTimeframes.timeframe24Hours = dataLast24Hours;
            }
          }

          if (timeframeLast48Hours.cdpLending) {
            const dataLast48Hours = timeframeLast48Hours.cdpLending.filter(
              (item) =>
                item.chain === dataState.chain &&
                item.protocol === dataState.protocol &&
                item.token.address === dataState.token.address,
            )[0];
            if (dataLast48Hours) {
              stateWithTimeframes.timeframe48Hours = dataLast48Hours;
            }
          }

          await this.storages.database.update({
            collection: EnvConfig.mongodb.collections.lendingMarketStates,
            keys: {
              chain: dataState.chain,
              metric: dataState.metric,
              protocol: dataState.protocol,
              'token.address': dataState.token.address,
            },
            updates: {
              ...stateWithTimeframes,
            },
            upsert: true,
          });
        }
      }

      if (state.perpetual) {
        for (const dataState of state.perpetual) {
          let stateWithTimeframes: PerpetualMarketDataStateWithTimeframes = {
            ...dataState,
            timeframe24Hours: null,
            timeframe48Hours: null,
          };

          if (timeframeLast24Hours.perpetual) {
            const dataLast24Hours = timeframeLast24Hours.perpetual.filter(
              (item) =>
                item.chain === dataState.chain &&
                item.protocol === dataState.protocol &&
                item.token.address === dataState.token.address,
            )[0];
            if (dataLast24Hours) {
              stateWithTimeframes.timeframe24Hours = dataLast24Hours;
            }
          }

          if (timeframeLast48Hours.perpetual) {
            const dataLast48Hours = timeframeLast48Hours.perpetual.filter(
              (item) =>
                item.chain === dataState.chain &&
                item.protocol === dataState.protocol &&
                item.token.address === dataState.token.address,
            )[0];
            if (dataLast48Hours) {
              stateWithTimeframes.timeframe48Hours = dataLast48Hours;
            }
          }

          await this.storages.database.update({
            collection: EnvConfig.mongodb.collections.perpetualMarketStates,
            keys: {
              chain: dataState.chain,
              metric: dataState.metric,
              protocol: dataState.protocol,
              'token.address': dataState.token.address,
            },
            updates: {
              ...stateWithTimeframes,
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
