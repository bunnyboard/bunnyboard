import { TimeUnits } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import { getTimestamp } from '../../lib/utils';
import { DataMetrics, MetricConfig, ProtocolConfig } from '../../types/configs';
import { StakingPoolDataStateWithTimeframes, StakingPoolDataTimeframe } from '../../types/domains/staking';
import { ContextServices, ContextStorages, IStakingProtocolAdapter } from '../../types/namespaces';
import { GetAdapterDataTimeframeOptions, RunAdapterOptions } from '../../types/options';
import ProtocolAdapter from './adapter';

export default class StakingProtocolAdapter extends ProtocolAdapter implements IStakingProtocolAdapter {
  public readonly name: string = 'adapter.staking';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getStakingDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<Array<StakingPoolDataTimeframe> | null> {
    return null;
  }

  public async collectDataState(options: RunAdapterOptions): Promise<void> {
    const config = options.metricConfig;
    if (config.metric === DataMetrics.staking) {
      const timestamp = getTimestamp();

      const timeframeLast24Hours = await this.getStakingDataTimeframe({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay,
        toTime: timestamp,
      });

      const timeframeLast48Hours = await this.getStakingDataTimeframe({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay * 2,
        toTime: timestamp - TimeUnits.SecondsPerDay,
      });

      if (timeframeLast24Hours) {
        for (const dataItem of timeframeLast24Hours) {
          const dataWithTimeframes: StakingPoolDataStateWithTimeframes = {
            ...dataItem,
            last24Hours: timeframeLast48Hours
              ? timeframeLast48Hours.filter(
                  (item: StakingPoolDataTimeframe) =>
                    item.chain === dataItem.chain &&
                    item.protocol === dataItem.protocol &&
                    item.address === dataItem.address &&
                    item.poolId === dataItem.poolId,
                )[0]
              : null,
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
