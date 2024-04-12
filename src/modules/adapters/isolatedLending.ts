import { TimeUnits } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import { getTimestamp } from '../../lib/utils';
import { DataMetrics, MetricConfig, ProtocolConfig } from '../../types/configs';
import {
  IsolatedLendingAssetDataState,
  IsolatedLendingAssetDataStateWithTimeframes,
  IsolatedLendingAssetDataTimeframe,
} from '../../types/domains/isolatedLending';
import { ContextServices, ContextStorages, IIsolatedLendingProtocolAdapter } from '../../types/namespaces';
import { GetAdapterDataStateOptions, GetAdapterDataTimeframeOptions, RunAdapterOptions } from '../../types/options';
import ProtocolAdapter from './adapter';

export default class IsolatedLendingProtocolAdapter extends ProtocolAdapter implements IIsolatedLendingProtocolAdapter {
  public readonly name: string = 'adapter.isolatedLending';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getLendingAssetDataState(
    options: GetAdapterDataStateOptions,
  ): Promise<IsolatedLendingAssetDataState | null> {
    return null;
  }

  public async getLendingAssetDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<IsolatedLendingAssetDataTimeframe | null> {
    return null;
  }

  public async collectDataState(options: RunAdapterOptions): Promise<void> {
    const config = options.metricConfig;
    if (config.metric === DataMetrics.cdpLending) {
      const timestamp = getTimestamp();

      const dataState = await this.getLendingAssetDataState({
        config: config,
        timestamp: timestamp,
      });

      const timeframeLast24Hours = await this.getLendingAssetDataTimeframe({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay,
        toTime: timestamp,
      });

      const timeframeLast48Hours = await this.getLendingAssetDataTimeframe({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay * 2,
        toTime: timestamp - TimeUnits.SecondsPerDay,
      });

      if (dataState) {
        const stateWithTimeframes: IsolatedLendingAssetDataStateWithTimeframes = {
          ...dataState,
          timefrom: timestamp - TimeUnits.SecondsPerDay,
          timeto: timestamp,
          volumeDeposited: '0',
          volumeWithdrawn: '0',
          volumeBorrowed: '0',
          volumeRepaid: '0',
          addresses: [],
          transactions: [],
          collaterals: [],
          last24Hours: null,
        };

        if (timeframeLast24Hours) {
          stateWithTimeframes.volumeDeposited = timeframeLast24Hours.volumeDeposited;
          stateWithTimeframes.volumeWithdrawn = timeframeLast24Hours.volumeWithdrawn;
          stateWithTimeframes.volumeBorrowed = timeframeLast24Hours.volumeBorrowed;
          stateWithTimeframes.volumeRepaid = timeframeLast24Hours.volumeRepaid;
          stateWithTimeframes.addresses = timeframeLast24Hours.addresses;
          stateWithTimeframes.transactions = timeframeLast24Hours.transactions;
          stateWithTimeframes.collaterals = timeframeLast24Hours.collaterals;
        }

        if (timeframeLast48Hours) {
          stateWithTimeframes.last24Hours = timeframeLast48Hours;
        }

        await this.storages.database.update({
          collection: EnvConfig.mongodb.collections.isolatedLendingAssetStates.name,
          keys: {
            chain: dataState.chain,
            protocol: dataState.protocol,
            address: dataState.address, // market contract address
          },
          updates: {
            ...stateWithTimeframes,
          },
          upsert: true,
        });
      }
    }
  }

  protected async getSnapshot(config: MetricConfig, fromTime: number, toTime: number): Promise<any> {
    return await this.getLendingAssetDataTimeframe({
      config: config,
      fromTime: fromTime,
      toTime: toTime,
    });
  }

  protected async processSnapshot(config: MetricConfig, snapshot: any): Promise<void> {
    await this.storages.database.update({
      collection: EnvConfig.mongodb.collections.isolatedLendingAssetSnapshots.name,
      keys: {
        chain: snapshot.chain,
        protocol: snapshot.protocol,
        address: snapshot.address, // market contract address
        timestamp: snapshot.timestamp,
      },
      updates: {
        ...snapshot,
      },
      upsert: true,
    });
  }
}
