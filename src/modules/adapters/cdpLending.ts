import { TimeUnits } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import { getTimestamp } from '../../lib/utils';
import {
  CdpLendingAssetDataState,
  CdpLendingAssetDataStateWithTimeframes,
  CdpLendingAssetDataTimeframe,
} from '../../types/collectors/cdpLending';
import {
  GetAdapterDataStateOptions,
  GetAdapterDataTimeframeOptions,
  RunAdapterOptions,
} from '../../types/collectors/options';
import { DataMetrics, MetricConfig, ProtocolConfig } from '../../types/configs';
import { ContextServices, ContextStorages, ICdpLendingProtocolAdapter } from '../../types/namespaces';
import ProtocolAdapter from './adapter';

export default class CdpLendingProtocolAdapter extends ProtocolAdapter implements ICdpLendingProtocolAdapter {
  public readonly name: string = 'adapter.cdpLending';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getLendingAssetDataState(options: GetAdapterDataStateOptions): Promise<CdpLendingAssetDataState | null> {
    return null;
  }

  public async getLendingAssetDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<CdpLendingAssetDataTimeframe | null> {
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
        const stateWithTimeframes: CdpLendingAssetDataStateWithTimeframes = {
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
          stateWithTimeframes.totalBorrowed = timeframeLast24Hours.totalBorrowed;
          stateWithTimeframes.volumeBorrowed = timeframeLast24Hours.volumeBorrowed;
          stateWithTimeframes.volumeRepaid = timeframeLast24Hours.volumeRepaid;

          stateWithTimeframes.addresses = timeframeLast24Hours.addresses;
          stateWithTimeframes.transactions = timeframeLast24Hours.transactions;
          stateWithTimeframes.collaterals = timeframeLast24Hours.collaterals;

          // can be undefined
          stateWithTimeframes.totalDeposited = timeframeLast24Hours.totalDeposited;
          stateWithTimeframes.volumeDeposited = timeframeLast24Hours.volumeDeposited;
          stateWithTimeframes.volumeWithdrawn = timeframeLast24Hours.volumeWithdrawn;
        }

        if (timeframeLast48Hours) {
          stateWithTimeframes.last24Hours = timeframeLast48Hours;
        }

        await this.storages.database.update({
          collection: EnvConfig.mongodb.collections.cdpLendingAssetStates.name,
          keys: {
            chain: dataState.chain,
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
      collection: EnvConfig.mongodb.collections.cdpLendingAssetSnapshots.name,
      keys: {
        chain: snapshot.chain,
        protocol: snapshot.protocol,
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