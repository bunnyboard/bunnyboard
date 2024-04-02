import { TimeUnits } from '../../../../configs/constants';
import EnvConfig from '../../../../configs/envConfig';
import logger from '../../../../lib/logger';
import {
  calChangesOf_Current_From_Previous,
  calChangesOf_Total_From_Items,
  calPreviousOf_Current_And_Change,
  convertRateToPercentage,
} from '../../../../lib/math';
import { normalizeAddress } from '../../../../lib/utils';
import { IDatabaseService } from '../../../../services/database/domains';
import { DataValue } from '../../../../types/aggregates/common';
import {
  AggCrossLendingDataOverall,
  AggCrossLendingMarketDataOverall,
  AggCrossLendingMarketSnapshot,
  AggCrossLendingReserveDataOverall,
  AggCrossLendingReserveSnapshot,
} from '../../../../types/aggregates/crossLending';
import {
  CrossLendingReserveDataStateWithTimeframes,
  CrossLendingReserveDataTimeframe,
} from '../../../../types/collectors/crossLending';
import { DataMetrics } from '../../../../types/configs';
import BaseDataAggregator from '../../base';
import CrossLendingDataTransformer from './transform';

const DataFields: Array<string> = [
  'totalValueLocked',
  'totalDeposited',
  'totalBorrowed',
  'feesPaidTheoretically',
  'volumeDeposited',
  'volumeWithdrawn',
  'volumeBorrowed',
  'volumeRepaid',
  'volumeLiquidated',
  'volumeTotal',
];

export interface GetCrossLendingReserveOptions {
  chain: string;
  protocol: string;
  contract?: string;
  tokenAddress: string;
}

const OverallDataCachingKey = 'CrossLendingOverallData';

export default class CrossLendingDataAggregator extends BaseDataAggregator {
  public readonly name: string = 'aggregator.crossLending';

  constructor(database: IDatabaseService) {
    super(database);
  }

  private async getDataOverallInternal(): Promise<AggCrossLendingDataOverall> {
    const dataState: AggCrossLendingDataOverall = CrossLendingDataTransformer.getDefaultAggCrossLendingDataOverall();

    // get all cross lending states
    const states = await this.database.query({
      collection: EnvConfig.mongodb.collections.crossLendingReserveStates.name,
      query: {
        metric: DataMetrics.crossLending,
      },
    });

    const reserveSnapshots: Array<AggCrossLendingReserveSnapshot> = [];
    for (const reserveState of states) {
      const stateWithTimeframes = reserveState as CrossLendingReserveDataStateWithTimeframes;
      const reserveSnapshot = CrossLendingDataTransformer.transformCrossLendingReserveSnapshot(
        stateWithTimeframes,
        stateWithTimeframes.last24Hours,
      );

      reserveSnapshots.push(reserveSnapshot);
    }

    const markets = CrossLendingDataTransformer.transformCrossReservesToMarkets(reserveSnapshots);
    for (const market of markets) {
      for (const field of DataFields) {
        ((dataState as any)[field] as DataValue).value += ((market as any)[field] as DataValue).value;
      }

      dataState.markets.push(market);
    }

    for (const field of DataFields) {
      ((dataState as any)[field] as DataValue).changedDay = calChangesOf_Total_From_Items(
        markets.map((market) => {
          const item = market as any;
          return {
            value: item[field].value,
            change: item[field].changedDay ? item[field].changedDay : 0,
          };
        }),
      );
    }

    // process snapshots and build up day data list
    const collection = await this.database.getCollection(
      EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name,
    );
    const queryCursor = collection.find({ timestamp: { $gt: 0 } });

    const snapshots: Array<AggCrossLendingReserveSnapshot> = [];
    while (await queryCursor.hasNext()) {
      const document: any = await queryCursor.next();
      if (document) {
        snapshots.push(CrossLendingDataTransformer.transformCrossLendingReserveSnapshot(document, null));
      }
    }

    dataState.dayData = CrossLendingDataTransformer.transformCrossReservesToDayData(snapshots);

    // we do calculate utilization rate value and change
    const totalDepositedPrevious = calPreviousOf_Current_And_Change(
      dataState.totalDeposited.value,
      dataState.totalDeposited.changedDay ? dataState.totalDeposited.changedDay : 0,
    );
    const totalBorrowedPrevious = calPreviousOf_Current_And_Change(
      dataState.totalBorrowed.value,
      dataState.totalBorrowed.changedDay ? dataState.totalBorrowed.changedDay : 0,
    );
    const uRatePrevious =
      totalDepositedPrevious > 0 ? convertRateToPercentage(totalBorrowedPrevious / totalDepositedPrevious) : 0;
    const uRateCurrent = dataState.totalDeposited.value
      ? convertRateToPercentage(dataState.totalBorrowed.value / dataState.totalDeposited.value)
      : 0;

    dataState.rateUtilization = {
      value: uRateCurrent,
      changedDay: uRatePrevious ? calChangesOf_Current_From_Previous(uRateCurrent, uRatePrevious) : undefined,
    };

    await queryCursor.close();

    return dataState;
  }

  // get current overall data across all markets
  public async getDataOverall(): Promise<AggCrossLendingDataOverall | null> {
    const overallData = await this.database.find({
      collection: EnvConfig.mongodb.collections.cachingData.name,
      query: {
        name: OverallDataCachingKey,
      },
    });
    if (overallData) {
      return overallData.data as AggCrossLendingDataOverall;
    } else {
      return null;
    }
  }

  // we save data in form of every single reserve (protocol-chain-token)
  // this function group reserves into a market (protocol-chain)
  public async getMarkets(timestamp: number): Promise<Array<AggCrossLendingMarketSnapshot>> {
    let snapshots: Array<any>;
    if (timestamp === 0) {
      // get latest state data
      snapshots = await this.database.query({
        collection: EnvConfig.mongodb.collections.crossLendingReserveStates.name,
        query: {},
      });
    } else {
      snapshots = await this.database.query({
        collection: EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name,
        query: {
          timestamp: timestamp,
        },
      });
    }

    const aggSnapshots: Array<AggCrossLendingReserveSnapshot> = [];
    for (const snapshot of snapshots) {
      const previousSnapshot = snapshot.last24Hours
        ? snapshot.last24Hours
        : await this.database.find({
            collection: EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name,
            query: {
              chain: snapshot.chain,
              protocol: snapshot.protocol,
              address: snapshot.address,
              'token.address': snapshot.token.address,
              timestamp: snapshot.timestamp - TimeUnits.SecondsPerDay,
            },
          });
      aggSnapshots.push(
        CrossLendingDataTransformer.transformCrossLendingReserveSnapshot(
          snapshot,
          previousSnapshot ? previousSnapshot : null,
        ),
      );
    }

    return CrossLendingDataTransformer.transformCrossReservesToMarkets(aggSnapshots);
  }

  // this function aims to return all data for given market (protocol-chain)
  public async getMarket(protocol: string, chain: string): Promise<AggCrossLendingMarketDataOverall> {
    // process states
    const reserveStates = await this.database.query({
      collection: EnvConfig.mongodb.collections.crossLendingReserveStates.name,
      query: {
        chain: chain,
        protocol: protocol,
      },
    });

    const reserveSnapshots: Array<AggCrossLendingReserveSnapshot> = [];
    for (const reserveState of reserveStates) {
      const reserveStateWithTimeframes = reserveState as CrossLendingReserveDataStateWithTimeframes;
      reserveSnapshots.push(
        CrossLendingDataTransformer.transformCrossLendingReserveSnapshot(
          reserveState,
          reserveStateWithTimeframes.last24Hours,
        ),
      );
    }

    const markets = CrossLendingDataTransformer.transformCrossReservesToMarkets(reserveSnapshots);
    const marketData: AggCrossLendingMarketDataOverall = {
      ...markets[0],
      dayData: [],
    };

    // process snapshots
    const snapshots = await this.database.query({
      collection: EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name,
      query: {
        chain: chain,
        protocol: protocol,
      },
    });

    marketData.dayData = CrossLendingDataTransformer.transformCrossReservesToDayData(
      snapshots.map((snapshot) => CrossLendingDataTransformer.transformCrossLendingReserveSnapshot(snapshot, null)),
    );

    return marketData;
  }

  // this function help to query reserve snapshots
  public async getReserves(
    chain: string | undefined | null,
    protocol: string | undefined | null,
    timestamp: number | undefined | null,
  ): Promise<Array<AggCrossLendingReserveSnapshot>> {
    const query: any = {};
    if (protocol) {
      query.protocol = protocol;
    }
    if (chain) {
      query.chain = chain;
    }

    let snapshots: Array<any> = [];
    if (timestamp === 0) {
      await this.database.query({
        collection: EnvConfig.mongodb.collections.crossLendingReserveStates.name,
        query: query,
      });
    } else {
      query.timestamp = timestamp;
      snapshots = await this.database.query({
        collection: EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name,
        query: query,
      });
    }

    const reserveSnapshots: Array<AggCrossLendingReserveSnapshot> = [];
    for (const snapshot of snapshots) {
      const previousSnapshot = snapshot.last24Hours
        ? snapshot.last24Hours
        : await this.database.find({
            collection: EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name,
            query: {
              chain: snapshot.chain,
              protocol: snapshot.protocol,
              address: snapshot.address,
              'token.address': snapshot.token.address,
              timestamp: snapshot.timestamp - TimeUnits.SecondsPerDay,
            },
          });
      reserveSnapshots.push(
        CrossLendingDataTransformer.transformCrossLendingReserveSnapshot(snapshot, previousSnapshot),
      );
    }

    return reserveSnapshots;
  }

  public async getReserve(options: GetCrossLendingReserveOptions): Promise<AggCrossLendingReserveDataOverall | null> {
    const query: any = {
      chain: options.chain,
      protocol: options.protocol,
      'token.address': normalizeAddress(options.tokenAddress),
    };

    if (options.contract) {
      query.address = normalizeAddress(options.contract);
    }

    const reserveStates = await this.database.query({
      collection: EnvConfig.mongodb.collections.crossLendingReserveStates.name,
      query: query,
    });

    const firstReserveFound = reserveStates[0];
    if (firstReserveFound) {
      const reserveSnapshot = CrossLendingDataTransformer.transformCrossLendingReserveSnapshot(
        firstReserveFound as CrossLendingReserveDataTimeframe,
        firstReserveFound.last24Hours,
      );

      // process snapshots
      const snapshots = await this.database.query({
        collection: EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name,
        query: query,
      });

      return {
        ...reserveSnapshot,
        dayData: snapshots.map((item) => {
          const snapshot = CrossLendingDataTransformer.transformCrossLendingReserveSnapshot(item, null);
          return {
            timestamp: snapshot.timestamp,
            totalValueLocked: snapshot.totalValueLocked.value,
            totalDeposited: snapshot.totalDeposited.value,
            totalBorrowed: snapshot.totalBorrowed.value,
            volumeDeposited: snapshot.volumeDeposited.value,
            volumeWithdrawn: snapshot.volumeWithdrawn.value,
            volumeBorrowed: snapshot.volumeBorrowed.value,
            volumeRepaid: snapshot.volumeRepaid.value,
            volumeLiquidated: snapshot.volumeLiquidated.value,
            volumeTotal: snapshot.volumeTotal.value,
            feesPaidTheoretically: snapshot.feesPaidTheoretically.value,
            rateSupply: snapshot.rateSupply.value,
            rateBorrow: snapshot.rateBorrow.value,
            rateUtilization:
              snapshot.totalDeposited.value > 0
                ? (snapshot.totalBorrowed.value / snapshot.totalDeposited.value) * 100
                : 0,
            rateBorrowStable: snapshot.rateBorrowStable ? snapshot.rateBorrowStable.value : undefined,
          };
        }),
      };
    }

    // reserve not found
    return null;
  }

  public async runUpdate(): Promise<void> {
    logger.info('start to update aggregator data', {
      service: this.name,
      name: OverallDataCachingKey,
    });
    const overallData = await this.getDataOverallInternal();
    await this.database.update({
      collection: EnvConfig.mongodb.collections.cachingData.name,
      keys: {
        name: OverallDataCachingKey,
      },
      updates: {
        name: OverallDataCachingKey,
        data: overallData,
      },
      upsert: true,
    });

    logger.info('updated aggregator data', {
      service: this.name,
      name: OverallDataCachingKey,
    });
  }
}
