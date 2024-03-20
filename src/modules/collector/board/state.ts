import { TimeUnits } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import logger from '../../../lib/logger';
import { getTimestamp } from '../../../lib/utils';
import { RunCollectorOptions } from '../../../types/collectors/options';
import { TokenBoardErc20DataStateWithTimeframes } from '../../../types/collectors/tokenboard';
import { DataMetrics, MetricConfig } from '../../../types/configs';
import { ContextServices, ContextStorages, IBoardAdapter } from '../../../types/namespaces';

export default class BoardStateCollector {
  public readonly name: string = 'collector.board.state';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  protected readonly adapters: { [key: string]: IBoardAdapter };

  constructor(storages: ContextStorages, services: ContextServices, adapters: { [key: string]: IBoardAdapter }) {
    this.services = services;
    this.storages = storages;
    this.adapters = adapters;
  }

  public async collect(options: RunCollectorOptions, configs: Array<MetricConfig>): Promise<void> {
    const timestamp = getTimestamp();
    for (const config of configs) {
      const startExeTime = Math.floor(new Date().getTime() / 1000);

      if (config.metric === DataMetrics.tokenBoardErc20) {
        const adapter = this.adapters.tokenboard;

        const dataState = await adapter.getDataState(config, timestamp);

        const timeframeLast24Hours = await adapter.getDataTimeframe(
          config,
          timestamp - TimeUnits.SecondsPerDay,
          timestamp,
        );

        const timeframeLast48Hours = await adapter.getDataTimeframe(
          config,
          timestamp - TimeUnits.SecondsPerDay,
          timestamp,
        );

        if (dataState) {
          const stateWithTimeframes: TokenBoardErc20DataStateWithTimeframes = {
            ...dataState,

            timefrom: timestamp - TimeUnits.SecondsPerDay,
            timeto: timestamp,
            volumeTransfer: '0',
            volumeMint: '0',
            volumeBurn: '0',
            addressBalances: [],
            last24Hours: null,
          };

          if (timeframeLast24Hours) {
            stateWithTimeframes.volumeTransfer = timeframeLast24Hours.volumeTransfer;
            stateWithTimeframes.volumeMint = timeframeLast24Hours.volumeMint;
            stateWithTimeframes.volumeBurn = timeframeLast24Hours.volumeBurn;
            stateWithTimeframes.addressBalances = timeframeLast24Hours.addressBalances;
          }

          if (timeframeLast48Hours) {
            stateWithTimeframes.last24Hours = timeframeLast48Hours;
          }

          await this.storages.database.update({
            collection: EnvConfig.mongodb.collections.tokenBoardErc20States.name,
            keys: {
              chain: dataState.chain,
              metric: dataState.metric,
              address: dataState.address,
            },
            updates: {
              ...stateWithTimeframes,
            },
            upsert: true,
          });
        }
      }

      const endExeTime = Math.floor(new Date().getTime() / 1000);
      const elapsed = endExeTime - startExeTime;

      logger.info('updated state data', {
        service: this.name,
        chain: config.chain,
        protocol: config.protocol,
        metric: config.metric,
        address: config.address,
        elapses: `${elapsed}s`,
      });
    }
  }
}
