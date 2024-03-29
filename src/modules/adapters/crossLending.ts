import { TimeUnits } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import { getTimestamp } from '../../lib/utils';
import {
  CrossLendingReserveDataState,
  CrossLendingReserveDataStateWithTimeframes,
  CrossLendingReserveDataTimeframe,
} from '../../types/collectors/crossLending';
import {
  GetAdapterDataStateOptions,
  GetAdapterDataTimeframeOptions,
  RunAdapterOptions,
} from '../../types/collectors/options';
import { DataMetrics, MetricConfig, ProtocolConfig } from '../../types/configs';
import { ContextServices, ContextStorages, ICrossLendingProtocolAdapter } from '../../types/namespaces';
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

      const states = await this.getLendingReservesDataState({
        config: config,
        timestamp: timestamp,
      });

      const timeframeLast24Hours = await this.getLendingReservesDataTimeframe({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay,
        toTime: timestamp,
      });

      const timeframeLast48Hours = await this.getLendingReservesDataTimeframe({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay * 2,
        toTime: timestamp - TimeUnits.SecondsPerDay,
      });

      if (states) {
        for (const dataState of states) {
          const stateWithTimeframes: CrossLendingReserveDataStateWithTimeframes = {
            ...dataState,
            timefrom: timestamp - TimeUnits.SecondsPerDay,
            timeto: timestamp,
            volumeDeposited: '0',
            volumeWithdrawn: '0',
            volumeBorrowed: '0',
            volumeRepaid: '0',
            volumeLiquidated: '0',
            addresses: [],
            transactions: [],
            last24Hours: null,
          };

          if (timeframeLast24Hours) {
            const dataLast24Hours = timeframeLast24Hours.filter(
              (item: CrossLendingReserveDataTimeframe) =>
                item.chain === dataState.chain &&
                item.protocol === dataState.protocol &&
                item.address === dataState.address &&
                item.token.address === dataState.token.address,
            )[0];
            if (dataLast24Hours) {
              stateWithTimeframes.volumeDeposited = dataLast24Hours.volumeDeposited;
              stateWithTimeframes.volumeWithdrawn = dataLast24Hours.volumeWithdrawn;
              stateWithTimeframes.volumeBorrowed = dataLast24Hours.volumeBorrowed;
              stateWithTimeframes.volumeRepaid = dataLast24Hours.volumeRepaid;
              stateWithTimeframes.volumeLiquidated = dataLast24Hours.volumeLiquidated;
              stateWithTimeframes.addresses = dataLast24Hours.addresses;
              stateWithTimeframes.transactions = dataLast24Hours.transactions;
            }
          }

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
