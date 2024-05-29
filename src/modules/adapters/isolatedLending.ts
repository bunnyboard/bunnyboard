import { TimeUnits } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import { compareAddress, getTimestamp } from '../../lib/utils';
import { DataMetrics, IsolatedLendingMarketConfig, MetricConfig, ProtocolConfig, Token } from '../../types/configs';
import {
  IsolatedLendingPoolDataStateWithTimeframes,
  IsolatedLendingPoolDataTimeframe,
} from '../../types/domains/isolatedLending';
import { ContextServices, ContextStorages, IIsolatedLendingProtocolAdapter } from '../../types/namespaces';
import { GetAdapterDataTimeframeOptions, RunAdapterOptions } from '../../types/options';
import ProtocolAdapter from './adapter';

export interface IsolatedAdapterInitialDataState {
  beginBlock: number;
  endBlock: number;
  stateTime: number;
  stateBlock: number;
  assetState: IsolatedLendingPoolDataTimeframe;
}

export default class IsolatedLendingProtocolAdapter extends ProtocolAdapter implements IIsolatedLendingProtocolAdapter {
  public readonly name: string = 'adapter.isolatedLending';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getLendingPoolData(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<Array<IsolatedLendingPoolDataTimeframe> | null> {
    return null;
  }

  protected async initialLendingAssetData(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<IsolatedAdapterInitialDataState> {
    const marketConfig = options.config as IsolatedLendingMarketConfig;

    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    const stateTime = options.latestState ? options.toTime : options.fromTime;
    const stateBlock = options.latestState ? endBlock : beginBlock;

    const debtToken = marketConfig.debtToken as Token;
    const debtTokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: debtToken.chain,
      address: debtToken.address,
      timestamp: stateTime,
    });

    return {
      beginBlock,
      endBlock,
      stateTime,
      stateBlock,
      assetState: {
        chain: options.config.chain,
        protocol: options.config.protocol,
        metric: options.config.metric,
        timestamp: stateTime,
        timefrom: options.fromTime,
        timeto: options.toTime,

        address: marketConfig.address,

        token: debtToken,
        tokenPrice: debtTokenPrice ? debtTokenPrice : '0',

        totalBorrowed: '0',
        totalDeposited: '0',

        volumeDeposited: '0',
        volumeWithdrawn: '0',
        volumeRepaid: '0',
        volumeBorrowed: '0',

        rateSupply: '0',
        rateBorrow: '0',

        addresses: [],
        transactions: [],

        collaterals: [],
      } as IsolatedLendingPoolDataTimeframe,
    };
  }

  public async collectDataState(options: RunAdapterOptions): Promise<void> {
    const config = options.metricConfig;
    if (config.metric === DataMetrics.isolatedLending) {
      const timestamp = getTimestamp();

      const dataStates = await this.getLendingPoolData({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay,
        toTime: timestamp,
        latestState: true,
      });

      const dataLast24Hours = await this.getLendingPoolData({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay * 2,
        toTime: timestamp - TimeUnits.SecondsPerDay,
        latestState: true,
      });

      if (dataStates && dataLast24Hours) {
        for (const dataState of dataStates) {
          const last24Hours = dataLast24Hours.filter(
            (item) => item.chain === dataState.chain && compareAddress(item.address, dataState.address),
          )[0];

          const stateWithTimeframes: IsolatedLendingPoolDataStateWithTimeframes = {
            ...dataState,
            last24Hours: last24Hours ? last24Hours : null,
          };

          await this.storages.database.update({
            collection: EnvConfig.mongodb.collections.isolatedLendingPoolStates.name,
            keys: {
              chain: dataState.chain,
              protocol: dataState.protocol,
              address: dataState.address, // market address
            },
            updates: {
              ...stateWithTimeframes,
            },
            upsert: true,
          });
        }
      }
    }
  }

  protected async getSnapshot(config: MetricConfig, fromTime: number, toTime: number): Promise<any> {
    return await this.getLendingPoolData({
      config: config,
      fromTime: fromTime,
      toTime: toTime,
    });
  }

  protected async processSnapshot(config: MetricConfig, snapshots: any): Promise<void> {
    for (const snapshot of snapshots) {
      await this.storages.database.update({
        collection: EnvConfig.mongodb.collections.isolatedLendingPoolSnapshots.name,
        keys: {
          chain: snapshot.chain,
          protocol: snapshot.protocol,
          address: snapshot.address, // market contract address
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
