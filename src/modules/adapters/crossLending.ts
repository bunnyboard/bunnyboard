import { TimeUnits } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import { getTimestamp } from '../../lib/utils';
import { DataMetrics, MetricConfig, ProtocolConfig } from '../../types/configs';
import {
  CrossLendingReserveDataState,
  CrossLendingReserveDataStateWithTimeframes,
  CrossLendingReserveDataTimeframe,
} from '../../types/domains/crossLending';
import { ContextServices, ContextStorages, ICrossLendingProtocolAdapter } from '../../types/namespaces';
import { GetAdapterDataStateOptions, GetAdapterDataTimeframeOptions, RunAdapterOptions } from '../../types/options';
import ProtocolAdapter from './adapter';

export default class CrossLendingProtocolAdapter extends ProtocolAdapter implements ICrossLendingProtocolAdapter {
  public readonly name: string = 'adapter.crossLending';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getLendingReservesDataState(
    options: GetAdapterDataStateOptions,
  ): Promise<Array<CrossLendingReserveDataState> | null> {
    return null;
  }

  public async getLendingReservesDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<Array<CrossLendingReserveDataTimeframe> | null> {
    return null;
  }

  public async collectDataState(options: RunAdapterOptions): Promise<void> {
    const config = options.metricConfig;
    if (config.metric === DataMetrics.crossLending) {
      const timestamp = getTimestamp();

      const timeframeLast24Hours = await this.getLendingReservesDataTimeframe({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay,
        toTime: timestamp,
        latestState: true,
      });

      const timeframeLast48Hours = await this.getLendingReservesDataTimeframe({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay * 2,
        toTime: timestamp - TimeUnits.SecondsPerDay,
      });

      if (timeframeLast24Hours) {
        for (const dataState of timeframeLast24Hours) {
          const stateWithTimeframes: CrossLendingReserveDataStateWithTimeframes = {
            ...dataState,
            last24Hours: null,
          };

          if (timeframeLast48Hours) {
            const dataLast48Hours = timeframeLast48Hours.filter(
              (item: CrossLendingReserveDataTimeframe) =>
                item.chain === dataState.chain &&
                item.protocol === dataState.protocol &&
                item.address === dataState.address &&
                item.token.address === dataState.token.address,
            )[0];
            if (dataLast48Hours) {
              stateWithTimeframes.last24Hours = dataLast48Hours;
            }
          }

          await this.storages.database.update({
            collection: EnvConfig.mongodb.collections.crossLendingReserveStates.name,
            keys: {
              chain: dataState.chain,
              protocol: dataState.protocol,
              address: dataState.address,
              'token.address': dataState.token.address,
            },
            updates: {
              ...stateWithTimeframes,
            },
            upsert: true,
          });
        }
      }
    }
  }

  protected async getSnapshot(config: MetricConfig, fromTime: number, toTime: number): Promise<any> {
    return await this.getLendingReservesDataTimeframe({
      config: config,
      fromTime: fromTime,
      toTime: toTime,
    });
  }

  protected async processSnapshot(config: MetricConfig, snapshots: any): Promise<void> {
    for (const snapshot of snapshots) {
      await this.storages.database.update({
        collection: EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name,
        keys: {
          chain: snapshot.chain,
          protocol: snapshot.protocol,
          address: snapshot.address,
          'token.address': snapshot.token.address,
          timestamp: snapshot.timestamp,
        },
        updates: {
          ...snapshot,
        },
        upsert: true,
      });
    }
  }
}
