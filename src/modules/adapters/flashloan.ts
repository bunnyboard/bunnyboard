import { TimeUnits } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import { getTimestamp } from '../../lib/utils';
import { DataMetrics, MetricConfig, ProtocolConfig } from '../../types/configs';
import { FlashloanDataStateWithTimeframes, FlashloanDataTimeframe } from '../../types/domains/flashloan';
import { StakingPoolDataStateWithTimeframes, StakingPoolDataTimeframe } from '../../types/domains/staking';
import { ContextServices, ContextStorages, IFlashloanProtocolAdapter } from '../../types/namespaces';
import { GetAdapterDataTimeframeOptions, RunAdapterOptions } from '../../types/options';
import ProtocolAdapter from './adapter';

export default class FlashloanProtocolAdapter extends ProtocolAdapter implements IFlashloanProtocolAdapter {
  public readonly name: string = 'adapter.flashloan';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getFlashloanDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<FlashloanDataTimeframe | null> {
    return null;
  }

  public async collectDataState(options: RunAdapterOptions): Promise<void> {
    const config = options.metricConfig;
    if (config.metric === DataMetrics.staking) {
      const timestamp = getTimestamp();

      const timeframeLast24Hours = await this.getFlashloanDataTimeframe({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay,
        toTime: timestamp,
      });

      const timeframeLast48Hours = await this.getFlashloanDataTimeframe({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay * 2,
        toTime: timestamp - TimeUnits.SecondsPerDay,
      });

      if (timeframeLast24Hours) {
        const dataWithTimeframes: FlashloanDataStateWithTimeframes = {
          ...timeframeLast24Hours,
          last24Hours: timeframeLast48Hours,
        };

        await this.storages.database.update({
          collection: EnvConfig.mongodb.collections.stakingPoolDataStates.name,
          keys: {
            chain: dataItem.chain,
            protocol: dataItem.protocol,
            address: dataItem.address,
            poolId: dataItem.poolId,
          },
          updates: {
            ...dataWithTimeframes,
          },
          upsert: true,
        });
      }
    }
  }

  protected async getSnapshot(config: MetricConfig, fromTime: number, toTime: number): Promise<any> {
    return await this.getStakingDataTimeframe({
      config: config,
      fromTime: fromTime,
      toTime: toTime,
    });
  }

  protected async processSnapshot(config: MetricConfig, snapshots: Array<StakingPoolDataTimeframe>): Promise<void> {
    for (const snapshot of snapshots) {
      await this.storages.database.update({
        collection: EnvConfig.mongodb.collections.stakingPoolDataSnapshots.name,
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
