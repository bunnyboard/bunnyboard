import { TimeUnits } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import {
  CdpLendingAssetDataState,
  CdpLendingAssetDataStateWithTimeframes,
  CdpLendingAssetDataTimeframe,
} from '../../types/collectors/cdpLending';
import {
  CrossLendingReserveDataStateWithTimeframes,
  CrossLendingReserveDataTimeframe,
} from '../../types/collectors/crossLending';
import { DexDataStateWithTimeframes } from '../../types/collectors/dex';
import { TokenBoardErc20DataStateWithTimeframes } from '../../types/collectors/tokenBoard';
import { DataMetrics, MetricConfig } from '../../types/configs';
import { ContextServices, ContextStorages } from '../../types/namespaces';
import { ProcessDataSnapshotOptions, ProcessDataStateOptions } from './collector';

export default class DataCollectorProcessor {
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  constructor(storages: ContextStorages, services: ContextServices) {
    this.services = services;
    this.storages = storages;
  }

  public async processDataState(config: MetricConfig, options: ProcessDataStateOptions): Promise<void> {
    switch (config.metric) {
      case DataMetrics.crossLending: {
        await this.processCrossLendingDataState(config, options);
        break;
      }
      case DataMetrics.cdpLending: {
        await this.processCdpLendingDataState(config, options);
        break;
      }
      case DataMetrics.dex: {
        await this.processDexDataState(config, options);
        break;
      }
      case DataMetrics.tokenBoardErc20: {
        await this.processTokenBoardDataState(config, options);
        break;
      }
    }
  }

  public async processDataSnapshots(config: MetricConfig, options: ProcessDataSnapshotOptions): Promise<void> {
    switch (config.metric) {
      case DataMetrics.crossLending: {
        await this.processCrossLendingDataSnapshots(config, options);
        break;
      }
      case DataMetrics.cdpLending: {
        await this.processCdpLendingDataSnapshots(config, options);
        break;
      }
      case DataMetrics.dex: {
        await this.processDexDataSnapshots(config, options);
        break;
      }
      case DataMetrics.tokenBoardErc20: {
        await this.processTokenBoardDataSnapshots(config, options);
        break;
      }
    }
  }

  private async processCrossLendingDataState(config: MetricConfig, options: ProcessDataStateOptions): Promise<void> {
    for (const dataState of options.state) {
      const stateWithTimeframes: CrossLendingReserveDataStateWithTimeframes = {
        ...dataState,
        timefrom: options.timestamp - TimeUnits.SecondsPerDay,
        timeto: options.timestamp,
        volumeDeposited: '0',
        volumeWithdrawn: '0',
        volumeBorrowed: '0',
        volumeRepaid: '0',
        volumeLiquidated: '0',
        addresses: [],
        transactions: [],
        last24Hours: null,
      };

      if (options.timeframeLast24Hours) {
        const dataLast24Hours = options.timeframeLast24Hours.filter(
          (item: CrossLendingReserveDataTimeframe) =>
            item.chain === dataState.chain &&
            item.protocol === dataState.protocol &&
            item.address === dataState.address &&
            item.token.address === dataState.token.address,
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

      if (options.timeframeLast48Hours) {
        const dataLast48Hours = options.timeframeLast48Hours.filter(
          (item: CrossLendingReserveDataTimeframe) =>
            item.chain === dataState.chain &&
            item.protocol === dataState.protocol &&
            item.address === dataState.address &&
            item.token.address === dataState.token.address,
        )[0];
        if (dataLast48Hours) {
          stateWithTimeframes.last24Hours = dataLast48Hours;
        }
      }

      await this.storages.database.update({
        collection: EnvConfig.mongodb.collections.crossLendingReserveStates.name,
        keys: {
          chain: dataState.chain,
          metric: dataState.metric,
          protocol: dataState.protocol,
          address: dataState.address,
          'token.address': dataState.token.address,
        },
        updates: {
          ...stateWithTimeframes,
        },
        upsert: true,
      });
    }
  }

  private async processCrossLendingDataSnapshots(
    config: MetricConfig,
    options: ProcessDataSnapshotOptions,
  ): Promise<void> {
    for (const snapshot of options.data) {
      await this.storages.database.update({
        collection: EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name,
        keys: {
          chain: snapshot.chain,
          metric: snapshot.metric,
          protocol: snapshot.protocol,
          address: snapshot.address,
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

  protected async processCdpLendingDataState(config: MetricConfig, options: ProcessDataStateOptions): Promise<void> {
    for (const dataState of options.state) {
      const stateWithTimeframes: CdpLendingAssetDataStateWithTimeframes = {
        ...dataState,

        timefrom: options.timestamp - TimeUnits.SecondsPerDay,
        timeto: options.timestamp,
        volumeDeposited: '0',
        volumeWithdrawn: '0',
        volumeBorrowed: '0',
        volumeRepaid: '0',
        addresses: [],
        transactions: [],
        collaterals: [],
        last24Hours: null,
      };

      if (options.timeframeLast24Hours) {
        const dataLast24Hours = options.timeframeLast24Hours.cdpLending.filter(
          (item: CdpLendingAssetDataState) =>
            item.chain === dataState.chain &&
            item.protocol === dataState.protocol &&
            item.token.address === dataState.token.address,
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

      if (options.timeframeLast48Hours) {
        const dataLast48Hours = options.timeframeLast48Hours.cdpLending.filter(
          (item: CdpLendingAssetDataTimeframe) =>
            item.chain === dataState.chain &&
            item.protocol === dataState.protocol &&
            item.token.address === dataState.token.address,
        )[0];
        if (dataLast48Hours) {
          stateWithTimeframes.last24Hours = dataLast48Hours;
        }
      }

      await this.storages.database.update({
        collection: EnvConfig.mongodb.collections.cdpLendingAssetStates.name,
        keys: {
          chain: dataState.chain,
          metric: dataState.metric,
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

  protected async processCdpLendingDataSnapshots(
    config: MetricConfig,
    options: ProcessDataSnapshotOptions,
  ): Promise<void> {
    for (const snapshot of options.data) {
      await this.storages.database.update({
        collection: EnvConfig.mongodb.collections.cdpLendingAssetSnapshots.name,
        keys: {
          chain: snapshot.chain,
          metric: snapshot.metric,
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

  private async processTokenBoardDataState(config: MetricConfig, options: ProcessDataStateOptions): Promise<void> {
    const dataState = options.state;
    const stateWithTimeframes: TokenBoardErc20DataStateWithTimeframes = {
      ...dataState,
      timefrom: options.timestamp - TimeUnits.SecondsPerDay,
      timeto: options.timestamp,
      volumeTransfer: '0',
      volumeMint: '0',
      volumeBurn: '0',
      dataOnDex: [],
      addressBalances: [],
      last24Hours: null,
    };

    if (options.timeframeLast24Hours) {
      stateWithTimeframes.volumeTransfer = options.timeframeLast24Hours.volumeTransfer;
      stateWithTimeframes.volumeMint = options.timeframeLast24Hours.volumeMint;
      stateWithTimeframes.volumeBurn = options.timeframeLast24Hours.volumeBurn;
      stateWithTimeframes.dataOnDex = options.timeframeLast24Hours.dataOnDex;
      stateWithTimeframes.addressBalances = options.timeframeLast24Hours.addressBalances;
    }

    if (options.timeframeLast48Hours) {
      if (options.timeframeLast48Hours) {
        stateWithTimeframes.last24Hours = options.timeframeLast48Hours;
      }
    }

    await this.storages.database.update({
      collection: EnvConfig.mongodb.collections.tokenBoardErc20States.name,
      keys: {
        chain: dataState.chain,
        address: dataState.address,
      },
      updates: {
        ...stateWithTimeframes,
      },
      upsert: true,
    });
  }

  private async processTokenBoardDataSnapshots(
    config: MetricConfig,
    options: ProcessDataSnapshotOptions,
  ): Promise<void> {
    const snapshot = options.data;
    await this.storages.database.update({
      collection: EnvConfig.mongodb.collections.tokenBoardErc20Snapshots.name,
      keys: {
        chain: snapshot.chain,
        address: snapshot.address,
        timestamp: snapshot.timestamp,
      },
      updates: {
        ...snapshot,
      },
      upsert: true,
    });
  }

  private async processDexDataState(config: MetricConfig, options: ProcessDataStateOptions): Promise<void> {
    const dataState = options.state;
    const stateWithTimeframes: DexDataStateWithTimeframes = {
      ...dataState,
      timefrom: options.timestamp - TimeUnits.SecondsPerDay,
      timeto: options.timestamp,
      volumeTrading: '0',
      volumeTradingCumulative: '0',
      numberOfTransactions: 0,
      numberOfTransactionsCumulative: 0,
      last24Hours: null,
    };

    if (options.timeframeLast24Hours) {
      stateWithTimeframes.volumeTrading = options.timeframeLast24Hours.volumeTrading;
      stateWithTimeframes.volumeTradingCumulative = options.timeframeLast24Hours.volumeTradingCumulative;
      stateWithTimeframes.numberOfTransactions = options.timeframeLast24Hours.numberOfTransactions;
      stateWithTimeframes.numberOfTransactionsCumulative = options.timeframeLast24Hours.numberOfTransactionsCumulative;
    }

    if (options.timeframeLast48Hours) {
      if (options.timeframeLast48Hours) {
        stateWithTimeframes.last24Hours = options.timeframeLast48Hours;
      }
    }

    await this.storages.database.update({
      collection: EnvConfig.mongodb.collections.dexDataStates.name,
      keys: {
        chain: dataState.chain,
        metric: dataState.metric,
        protocol: dataState.protocol,
      },
      updates: {
        ...stateWithTimeframes,
      },
      upsert: true,
    });
  }

  private async processDexDataSnapshots(config: MetricConfig, options: ProcessDataSnapshotOptions): Promise<void> {
    const snapshot = options.data;

    // save dex data
    await this.storages.database.update({
      collection: EnvConfig.mongodb.collections.dexDataSnapshots.name,
      keys: {
        chain: snapshot.chain,
        metric: snapshot.metric,
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
