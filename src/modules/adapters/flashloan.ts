import { TimeUnits } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import { getTimestamp } from '../../lib/utils';
import { DataMetrics, MetricConfig, ProtocolConfig } from '../../types/configs';
import { FlashloanDataStateWithTimeframes, FlashloanDataTimeframe } from '../../types/domains/flashloan';
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
    if (config.metric === DataMetrics.flashloan) {
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
          collection: EnvConfig.mongodb.collections.flashloanDataStates.name,
          keys: {
            chain: timeframeLast24Hours.chain,
            protocol: timeframeLast24Hours.protocol,
            address: timeframeLast24Hours.address,
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
    return await this.getFlashloanDataTimeframe({
      config: config,
      fromTime: fromTime,
      toTime: toTime,
    });
  }

  protected async processSnapshot(config: MetricConfig, snapshot: FlashloanDataTimeframe): Promise<void> {
    await this.storages.database.update({
      collection: EnvConfig.mongodb.collections.flashloanDataSnapshots.name,
      keys: {
        chain: snapshot.chain,
        protocol: snapshot.protocol,
        address: snapshot.address,
        timestamp: snapshot.timestamp,
      },
      updates: {
        ...snapshot,
      },
      upsert: true,
    });
  }

  public async runTest(options: RunAdapterOptions): Promise<void> {
    const currentTime = getTimestamp();
    const last24Hours = currentTime - 24 * 60 * 60;
    console.log(
      JSON.stringify(
        await this.getFlashloanDataTimeframe({
          config: options.metricConfig,
          fromTime: last24Hours,
          toTime: currentTime,
          latestState: true,
        }),
      ),
    );
  }
}
