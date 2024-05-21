import { TimeUnits } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import { getTimestamp } from '../../lib/utils';
import { DataMetrics, MetricConfig, ProtocolConfig } from '../../types/configs';
import { CdpLendingAssetDataStateWithTimeframes, CdpLendingAssetDataTimeframe } from '../../types/domains/cdpLending';
import { ContextServices, ContextStorages, ICdpLendingProtocolAdapter } from '../../types/namespaces';
import { GetAdapterDataTimeframeOptions, RunAdapterOptions } from '../../types/options';
import ProtocolAdapter from './adapter';

export default class CdpLendingProtocolAdapter extends ProtocolAdapter implements ICdpLendingProtocolAdapter {
  public readonly name: string = 'adapter.cdpLending';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getLendingAssetData(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<CdpLendingAssetDataTimeframe | null> {
    return null;
  }

  public async collectDataState(options: RunAdapterOptions): Promise<void> {
    const config = options.metricConfig;
    if (config.metric === DataMetrics.cdpLending) {
      const timestamp = getTimestamp();

      const dataState = await this.getLendingAssetData({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay,
        toTime: timestamp,
        latestState: true,
      });

      const dataLast24Hours = await this.getLendingAssetData({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay * 2,
        toTime: timestamp - TimeUnits.SecondsPerDay,
        latestState: true,
      });

      if (dataState) {
        const stateWithTimeframes: CdpLendingAssetDataStateWithTimeframes = {
          ...dataState,
          last24Hours: dataLast24Hours,
        };

        await this.storages.database.update({
          collection: EnvConfig.mongodb.collections.cdpLendingAssetStates.name,
          keys: {
            chain: dataState.chain,
            protocol: dataState.protocol,
            address: dataState.token.address, // debt token address
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
    return await this.getLendingAssetData({
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
        address: snapshot.token.address, // debt token address
        timestamp: snapshot.timestamp,
      },
      updates: {
        ...snapshot,
      },
      upsert: true,
    });
  }
}
