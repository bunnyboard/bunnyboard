import { TimeUnits } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import { getTimestamp } from '../../lib/utils';
import { DexDataState, DexDataStateWithTimeframes, DexDataTimeframe } from '../../types/collectors/dex';
import {
  GetAdapterDataStateOptions,
  GetAdapterDataTimeframeOptions,
  RunAdapterOptions,
} from '../../types/collectors/options';
import { DataMetrics, MetricConfig, ProtocolConfig } from '../../types/configs';
import { ContextServices, ContextStorages, IDexProtocolAdapter } from '../../types/namespaces';
import ProtocolAdapter from './adapter';

export default class DexProtocolAdapter extends ProtocolAdapter implements IDexProtocolAdapter {
  public readonly name: string = 'adapter.dex';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getDexDataState(options: GetAdapterDataStateOptions): Promise<DexDataState | null> {
    return null;
  }

  public async getDexDataTimeframe(options: GetAdapterDataTimeframeOptions): Promise<DexDataTimeframe | null> {
    return null;
  }

  public async collectDataState(options: RunAdapterOptions): Promise<void> {
    const config = options.metricConfig;
    if (config.metric === DataMetrics.dex) {
      const timestamp = getTimestamp();

      const dataState = await this.getDexDataState({
        config: config,
        timestamp: timestamp,
      });

      const timeframeLast24Hours = await this.getDexDataTimeframe({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay,
        toTime: timestamp,
      });

      const timeframeLast48Hours = await this.getDexDataTimeframe({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay * 2,
        toTime: timestamp - TimeUnits.SecondsPerDay,
      });

      if (dataState) {
        const stateWithTimeframes: DexDataStateWithTimeframes = {
          ...dataState,
          timefrom: timestamp - TimeUnits.SecondsPerDay,
          timeto: timestamp,
          feesTradingUsd: '0',
          feesTradingCumulativeUsd: '0',
          volumeTradingUsd: '0',
          volumeTradingCumulativeUsd: '0',
          numberOfTransactions: 0,
          numberOfTransactionsCumulative: 0,
          traders: [],
          last24Hours: null,
        };

        if (timeframeLast24Hours) {
          stateWithTimeframes.feesTradingUsd = timeframeLast24Hours.feesTradingUsd;
          stateWithTimeframes.feesTradingCumulativeUsd = timeframeLast24Hours.feesTradingCumulativeUsd;
          stateWithTimeframes.volumeTradingUsd = timeframeLast24Hours.volumeTradingUsd;
          stateWithTimeframes.volumeTradingCumulativeUsd = timeframeLast24Hours.volumeTradingCumulativeUsd;
          stateWithTimeframes.numberOfTransactions = timeframeLast24Hours.numberOfTransactions;
          stateWithTimeframes.numberOfTransactionsCumulative = timeframeLast24Hours.numberOfTransactionsCumulative;
          stateWithTimeframes.traders = timeframeLast24Hours.traders;
        }

        if (timeframeLast48Hours) {
          stateWithTimeframes.last24Hours = timeframeLast48Hours;
        }

        await this.storages.database.update({
          collection: EnvConfig.mongodb.collections.dexDataStates.name,
          keys: {
            chain: dataState.chain,
            protocol: dataState.protocol,
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
    return await this.getDexDataTimeframe({
      config: config,
      fromTime: fromTime,
      toTime: toTime,
    });
  }

  protected async processSnapshot(config: MetricConfig, snapshot: any): Promise<void> {
    await this.storages.database.update({
      collection: EnvConfig.mongodb.collections.dexDataSnapshots.name,
      keys: {
        chain: snapshot.chain,
        protocol: snapshot.protocol,
        timestamp: snapshot.timestamp,
      },
      updates: {
        ...snapshot,
      },
      upsert: true,
    });
  }
}
