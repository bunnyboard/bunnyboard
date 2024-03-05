import { TimeUnits } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { getTimestamp } from '../../lib/utils';
import { CdpLendingAssetDataStateWithTimeframes } from '../../types/collectors/cdpLending';
import { CrossLendingReserveDataStateWithTimeframes } from '../../types/collectors/crossLending';
import { RunCollectorOptions } from '../../types/collectors/options';
import { MetricConfig } from '../../types/configs';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';

export default class StateCollector {
  public readonly name: string = 'collector.state';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  protected readonly adapters: { [key: string]: IProtocolAdapter };

  constructor(storages: ContextStorages, services: ContextServices, adapters: { [key: string]: IProtocolAdapter }) {
    this.services = services;
    this.storages = storages;
    this.adapters = adapters;
  }

  public async collect(options: RunCollectorOptions, configs: Array<MetricConfig>): Promise<void> {
    const timestamp = getTimestamp();
    for (const config of configs) {
      const startExeTime = Math.floor(new Date().getTime() / 1000);

      const state = await this.adapters[config.protocol].getDataState({
        config: config,
        timestamp: timestamp,
      });

      const timeframeLast24Hours = await this.adapters[config.protocol].getDataTimeframe({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay,
        toTime: timestamp,
      });

      const timeframeLast48Hours = await this.adapters[config.protocol].getDataTimeframe({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay * 2,
        toTime: timestamp - TimeUnits.SecondsPerDay,
      });

      if (state.crossLending) {
        for (const dateState of state.crossLending) {
          let stateWithTimeframes: CrossLendingReserveDataStateWithTimeframes = {
            ...dateState,
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

          if (timeframeLast24Hours.crossLending) {
            const dataLast24Hours = timeframeLast24Hours.crossLending.filter(
              (item) =>
                item.chain === dateState.chain &&
                item.protocol === dateState.protocol &&
                item.address === dateState.address &&
                item.token.address === dateState.token.address,
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

          if (timeframeLast48Hours.crossLending) {
            const dataLast48Hours = timeframeLast48Hours.crossLending.filter(
              (item) =>
                item.chain === dateState.chain &&
                item.protocol === dateState.protocol &&
                item.address === dateState.address &&
                item.token.address === dateState.token.address,
            )[0];
            if (dataLast48Hours) {
              stateWithTimeframes.last24Hours = dataLast48Hours;
            }
          }

          await this.storages.database.update({
            collection: EnvConfig.mongodb.collections.crossLendingReserveStates.name,
            keys: {
              chain: dateState.chain,
              metric: dateState.metric,
              protocol: dateState.protocol,
              address: dateState.address,
              'token.address': dateState.token.address,
            },
            updates: {
              ...stateWithTimeframes,
            },
            upsert: true,
          });
        }
      } else if (state.cdpLending) {
        for (const dateState of state.cdpLending) {
          let stateWithTimeframes: CdpLendingAssetDataStateWithTimeframes = {
            ...dateState,

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

          if (timeframeLast24Hours.cdpLending) {
            const dataLast24Hours = timeframeLast24Hours.cdpLending.filter(
              (item) =>
                item.chain === dateState.chain &&
                item.protocol === dateState.protocol &&
                item.token.address === dateState.token.address,
            )[0];
            if (dataLast24Hours) {
              stateWithTimeframes.totalBorrowed = dataLast24Hours.totalBorrowed;
              stateWithTimeframes.volumeBorrowed = dataLast24Hours.volumeBorrowed;
              stateWithTimeframes.volumeRepaid = dataLast24Hours.volumeRepaid;

              stateWithTimeframes.addresses = dataLast24Hours.addresses;
              stateWithTimeframes.transactions = dataLast24Hours.transactions;
              stateWithTimeframes.collaterals = dataLast24Hours.collaterals;

              // can be undefined
              stateWithTimeframes.totalDeposited = dataLast24Hours.totalDeposited;
              stateWithTimeframes.volumeDeposited = dataLast24Hours.volumeDeposited;
              stateWithTimeframes.volumeWithdrawn = dataLast24Hours.volumeWithdrawn;
            }
          }

          if (timeframeLast48Hours.cdpLending) {
            const dataLast48Hours = timeframeLast48Hours.cdpLending.filter(
              (item) =>
                item.chain === dateState.chain &&
                item.protocol === dateState.protocol &&
                item.token.address === dateState.token.address,
            )[0];
            if (dataLast48Hours) {
              stateWithTimeframes.last24Hours = dataLast48Hours;
            }
          }

          await this.storages.database.update({
            collection: EnvConfig.mongodb.collections.cdpLendingAssetStates.name,
            keys: {
              chain: dateState.chain,
              metric: dateState.metric,
              protocol: dateState.protocol,
              'token.address': dateState.token.address,
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
