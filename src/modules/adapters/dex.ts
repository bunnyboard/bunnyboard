import { TimeUnits } from '../../configs/constants';
import envConfig from '../../configs/envConfig';
import { getTimestamp } from '../../lib/utils';
import { DataMetrics, DexConfig, MetricConfig, ProtocolConfig } from '../../types/configs';
import { DexLiquidityPoolDataTimeframe, DexLiquidityPoolMetadata } from '../../types/domains/dex';
import { ContextServices, ContextStorages, IDexProtocolAdapter } from '../../types/namespaces';
import { GetAdapterDataTimeframeOptions, RunAdapterOptions } from '../../types/options';
import ProtocolAdapter from './adapter';

export default class DexProtocolAdapter extends ProtocolAdapter implements IDexProtocolAdapter {
  public readonly name: string = 'adapter.dex';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getDexLiquidityPoolMetadata(dexConfig: DexConfig): Promise<Array<DexLiquidityPoolMetadata>> {
    return [];
  }

  public async getDexDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<Array<DexLiquidityPoolDataTimeframe> | null> {
    return null;
  }

  public async collectDataState(options: RunAdapterOptions): Promise<void> {
    const config = options.metricConfig;
    if (config.metric === DataMetrics.dex) {
      const timestamp = getTimestamp();

      const last24HoursLiquidityPools = await this.getDexDataTimeframe({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay,
        toTime: timestamp,
        latestState: true,
      });

      if (last24HoursLiquidityPools) {
        for (const dataState of last24HoursLiquidityPools) {
          await this.storages.database.update({
            collection: envConfig.mongodb.collections.dexLiquidityPoolStates.name,
            keys: {
              chain: dataState.chain,
              protocol: dataState.protocol,
              address: dataState.address,
              poolId: dataState.poolId,
            },
            updates: {
              ...dataState,
            },
            upsert: true,
          });
        }
      }
    }
  }

  protected async getSnapshot(config: MetricConfig, fromTime: number, toTime: number): Promise<any> {
    return await this.getDexDataTimeframe({
      config: config,
      fromTime: fromTime,
      toTime: toTime,
    });
  }

  protected async processSnapshot(
    config: MetricConfig,
    snapshots: Array<DexLiquidityPoolDataTimeframe>,
  ): Promise<void> {
    for (const snapshot of snapshots) {
      await this.storages.database.update({
        collection: envConfig.mongodb.collections.dexLiquidityPoolSnapshots.name,
        keys: {
          chain: snapshot.chain,
          protocol: snapshot.protocol,
          address: snapshot.address,
          poolId: snapshot.poolId,
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
