import { DAY } from '../../../../configs/constants';
import EnvConfig from '../../../../configs/envConfig';
import { calChangesOf_Total_From_Items } from '../../../../lib/math';
import { IDatabaseService } from '../../../../services/database/domains';
import { DataValueItem } from '../../../../types/aggregates/common';
import {
  AggCrossLendingDataOverall,
  AggCrossLendingMarketDataOverall,
  AggCrossLendingMarketSnapshot,
  AggCrossLendingReserveSnapshot,
} from '../../../../types/aggregates/crossLending';
import { CrossLendingReserveDataStateWithTimeframes } from '../../../../types/collectors/crossLending';
import { DataMetrics } from '../../../../types/configs';
import BaseDataAggregator from '../../base';
import CrossLendingDataTransformer from './transform';

export default class CrossLendingDataAggregator extends BaseDataAggregator {
  public readonly name: string = 'aggregator.crossLending';

  constructor(database: IDatabaseService) {
    super(database);
  }

  private async getDataOverallInternal(): Promise<AggCrossLendingDataOverall> {
    const dataState: AggCrossLendingDataOverall = CrossLendingDataTransformer.getDefaultAggCrossLendingDataOverall();

    const fields: Array<string> = [
      'totalDeposited',
      'totalBorrowed',
      'feesPaidTheoretically',
      'volumeDeposited',
      'volumeWithdrawn',
      'volumeBorrowed',
      'volumeRepaid',
    ];

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
      for (const field of fields) {
        ((dataState as any)[field] as DataValueItem).valueUsd += ((market as any)[field] as DataValueItem).valueUsd;
      }

      dataState.markets.push(market);
    }

    for (const field of fields) {
      ((dataState as any)[field] as DataValueItem).changedValueUsd = calChangesOf_Total_From_Items(
        markets.map((market) => {
          const item = market as any;
          return {
            value: item[field].valueUsd,
            change: item[field].changedValueUsd ? item[field].changedValueUsd : 0,
          };
        }),
      );
    }

    // process snapshots and build up day data list
    const snapshots = await this.database.query({
      collection: EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name,
      query: {
        timestamp: { $gt: 0 },
      },
    });
    dataState.dayData = CrossLendingDataTransformer.transformCrossReservesToDayData(
      snapshots.map((snapshot) => CrossLendingDataTransformer.transformCrossLendingReserveSnapshot(snapshot, null)),
    );

    return dataState;
  }

  // get current overall data across all markets
  public async getDataOverall(): Promise<AggCrossLendingDataOverall> {
    return await this.getDataOverallInternal();
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
              timestamp: snapshot.timestamp - DAY,
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
    if (timestamp) {
      query.timestamp = timestamp;
    }

    const snapshots = await this.database.query({
      collection: EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name,
      query: query,
    });

    const reserveSnapshots: Array<AggCrossLendingReserveSnapshot> = [];
    for (const snapshot of snapshots) {
      const previousSnapshot = await this.database.find({
        collection: EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name,
        query: {
          chain: snapshot.chain,
          protocol: snapshot.protocol,
          address: snapshot.address,
          'token.address': snapshot.token.address,
          timestamp: snapshot.timestamp - DAY,
        },
      });
      reserveSnapshots.push(
        CrossLendingDataTransformer.transformCrossLendingReserveSnapshot(snapshot, previousSnapshot),
      );
    }

    return reserveSnapshots;
  }
}
