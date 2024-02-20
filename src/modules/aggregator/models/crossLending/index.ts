import { DAY } from '../../../../configs/constants';
import EnvConfig from '../../../../configs/envConfig';
import { calChangesOf_Total_From_Items, calValueOf_Amount_With_Price } from '../../../../lib/math';
import { getTimestamp } from '../../../../lib/utils';
import { IDatabaseService } from '../../../../services/database/domains';
import {
  AggCrossLendingDataOverall,
  AggCrossLendingMarketDataOverall,
  AggCrossLendingMarketSnapshot,
  AggCrossLendingReserveSnapshot,
} from '../../../../types/aggregates/crossLending';
import {
  CrossLendingReserveDataStateWithTimeframes,
  CrossLendingReserveDataTimeframe,
} from '../../../../types/collectors/crossLending';
import { DataMetrics } from '../../../../types/configs';
import BaseDataAggregator from '../../base';
import { groupReserveSnapshotsToDayData } from './helpers';
import CrossLendingDataTransformer from './transform';

export default class CrossLendingDataAggregator extends BaseDataAggregator {
  public readonly name: string = 'aggregator.crossLending';

  constructor(database: IDatabaseService) {
    super(database);
  }

  // get current overall data across all markets
  public async getDataOverall(): Promise<AggCrossLendingDataOverall> {
    const dataState: AggCrossLendingDataOverall = CrossLendingDataTransformer.getDefaultAggCrossLendingDataOverall();

    // get all cross lending states
    const states = await this.database.query({
      collection: EnvConfig.mongodb.collections.crossLendingReserveStates.name,
      query: {
        metric: DataMetrics.crossLending,
      },
    });

    const markets: { [key: string]: AggCrossLendingMarketSnapshot } = {};
    for (const stateItem of states) {
      const stateWithTimeframes = stateItem as CrossLendingReserveDataStateWithTimeframes;

      const marketId = `${stateWithTimeframes.protocol}-${stateWithTimeframes.chain}`;
      if (!markets[marketId]) {
        markets[marketId] = CrossLendingDataTransformer.getDefaultAggCrossLendingMarketSnapshot(
          stateWithTimeframes.protocol,
          stateWithTimeframes.chain,
          stateWithTimeframes.timestamp,
        );
      }

      // sum all market value for overall data
      dataState.totalDeposited.valueUsd += calValueOf_Amount_With_Price(stateItem.totalDeposited, stateItem.tokenPrice);
      dataState.totalBorrowed.valueUsd += calValueOf_Amount_With_Price(stateItem.totalBorrowed, stateItem.tokenPrice);

      // sum all market value for protocol market
      markets[marketId].totalDeposited.valueUsd += calValueOf_Amount_With_Price(
        stateItem.totalDeposited,
        stateItem.tokenPrice,
      );
      markets[marketId].totalBorrowed.valueUsd += calValueOf_Amount_With_Price(
        stateItem.totalBorrowed,
        stateItem.tokenPrice,
      );

      if (stateWithTimeframes.timeframe24Hours) {
        const snapshot = CrossLendingDataTransformer.transformCrossLendingMarketSnapshot(
          stateWithTimeframes.timeframe24Hours,
          stateWithTimeframes.timeframe48Hours,
          stateItem,
        );

        dataState.feesPaidTheoretically.valueUsd += snapshot.feesPaidTheoretically.valueUsd;
        dataState.volumeDeposited.valueUsd += snapshot.volumeDeposited.valueUsd;
        dataState.volumeWithdrawn.valueUsd += snapshot.volumeWithdrawn.valueUsd;
        dataState.volumeBorrowed.valueUsd += snapshot.volumeBorrowed.valueUsd;
        dataState.volumeRepaid.valueUsd += snapshot.volumeRepaid.valueUsd;

        markets[marketId].feesPaidTheoretically.valueUsd += snapshot.feesPaidTheoretically.valueUsd;
        markets[marketId].volumeDeposited.valueUsd += snapshot.volumeDeposited.valueUsd;
        markets[marketId].volumeWithdrawn.valueUsd += snapshot.volumeWithdrawn.valueUsd;
        markets[marketId].volumeBorrowed.valueUsd += snapshot.volumeBorrowed.valueUsd;
        markets[marketId].volumeRepaid.valueUsd += snapshot.volumeRepaid.valueUsd;

        markets[marketId].reserves.push(snapshot);
      }
    }

    dataState.markets = Object.values(markets).map((item) => {
      const market: AggCrossLendingMarketSnapshot = {
        ...item,
      };

      market.totalDeposited.changedValueUsd = calChangesOf_Total_From_Items(
        market.reserves.map((snapshot) => {
          return {
            value: snapshot.totalDeposited.valueUsd,
            change: snapshot.totalDeposited.changedValueUsd ? snapshot.totalDeposited.changedValueUsd : 0,
          };
        }),
      );
      market.totalBorrowed.changedValueUsd = calChangesOf_Total_From_Items(
        market.reserves.map((snapshot) => {
          return {
            value: snapshot.totalBorrowed.valueUsd,
            change: snapshot.totalBorrowed.changedValueUsd ? snapshot.totalBorrowed.changedValueUsd : 0,
          };
        }),
      );

      market.volumeRepaid.changedValueUsd = calChangesOf_Total_From_Items(
        market.reserves.map((snapshot) => {
          return {
            value: snapshot.volumeRepaid.valueUsd,
            change: snapshot.volumeRepaid.changedValueUsd ? snapshot.volumeRepaid.changedValueUsd : 0,
          };
        }),
      );
      market.volumeDeposited.changedValueUsd = calChangesOf_Total_From_Items(
        market.reserves.map((snapshot) => {
          return {
            value: snapshot.volumeDeposited.valueUsd,
            change: snapshot.volumeDeposited.changedValueUsd ? snapshot.volumeDeposited.changedValueUsd : 0,
          };
        }),
      );
      market.volumeWithdrawn.changedValueUsd = calChangesOf_Total_From_Items(
        market.reserves.map((snapshot) => {
          return {
            value: snapshot.volumeWithdrawn.valueUsd,
            change: snapshot.volumeWithdrawn.changedValueUsd ? snapshot.volumeWithdrawn.changedValueUsd : 0,
          };
        }),
      );
      market.volumeBorrowed.changedValueUsd = calChangesOf_Total_From_Items(
        market.reserves.map((snapshot) => {
          return {
            value: snapshot.volumeBorrowed.valueUsd,
            change: snapshot.volumeBorrowed.changedValueUsd ? snapshot.volumeBorrowed.changedValueUsd : 0,
          };
        }),
      );
      market.volumeRepaid.changedValueUsd = calChangesOf_Total_From_Items(
        market.reserves.map((snapshot) => {
          return {
            value: snapshot.volumeRepaid.valueUsd,
            change: snapshot.volumeRepaid.changedValueUsd ? snapshot.volumeRepaid.changedValueUsd : 0,
          };
        }),
      );
      market.feesPaidTheoretically.changedValueUsd = calChangesOf_Total_From_Items(
        market.reserves.map((snapshot) => {
          return {
            value: snapshot.feesPaidTheoretically.valueUsd,
            change: snapshot.feesPaidTheoretically.changedValueUsd ? snapshot.feesPaidTheoretically.changedValueUsd : 0,
          };
        }),
      );

      return market;
    });

    // now we have a problem here, dataState is sum of all market values
    // we must calculate this total value change percentages
    dataState.totalDeposited.changedValueUsd = calChangesOf_Total_From_Items(
      dataState.markets.map((snapshot) => {
        return {
          value: snapshot.totalDeposited.valueUsd,
          change: snapshot.totalDeposited.changedValueUsd ? snapshot.totalDeposited.changedValueUsd : 0,
        };
      }),
    );
    dataState.totalBorrowed.changedValueUsd = calChangesOf_Total_From_Items(
      dataState.markets.map((snapshot) => {
        return {
          value: snapshot.totalBorrowed.valueUsd,
          change: snapshot.totalBorrowed.changedValueUsd ? snapshot.totalBorrowed.changedValueUsd : 0,
        };
      }),
    );

    dataState.feesPaidTheoretically.changedValueUsd = calChangesOf_Total_From_Items(
      dataState.markets.map((snapshot) => {
        return {
          value: snapshot.feesPaidTheoretically.valueUsd,
          change: snapshot.feesPaidTheoretically.changedValueUsd ? snapshot.feesPaidTheoretically.changedValueUsd : 0,
        };
      }),
    );
    dataState.volumeDeposited.changedValueUsd = calChangesOf_Total_From_Items(
      dataState.markets.map((snapshot) => {
        return {
          value: snapshot.volumeDeposited.valueUsd,
          change: snapshot.volumeDeposited.changedValueUsd ? snapshot.volumeDeposited.changedValueUsd : 0,
        };
      }),
    );
    dataState.volumeWithdrawn.changedValueUsd = calChangesOf_Total_From_Items(
      dataState.markets.map((snapshot) => {
        return {
          value: snapshot.volumeWithdrawn.valueUsd,
          change: snapshot.volumeWithdrawn.changedValueUsd ? snapshot.volumeWithdrawn.changedValueUsd : 0,
        };
      }),
    );
    dataState.volumeBorrowed.changedValueUsd = calChangesOf_Total_From_Items(
      dataState.markets.map((snapshot) => {
        return {
          value: snapshot.volumeBorrowed.valueUsd,
          change: snapshot.volumeBorrowed.changedValueUsd ? snapshot.volumeBorrowed.changedValueUsd : 0,
        };
      }),
    );
    dataState.volumeRepaid.changedValueUsd = calChangesOf_Total_From_Items(
      dataState.markets.map((snapshot) => {
        return {
          value: snapshot.volumeRepaid.valueUsd,
          change: snapshot.volumeRepaid.changedValueUsd ? snapshot.volumeRepaid.changedValueUsd : 0,
        };
      }),
    );

    // process snapshots and build up day data list
    const snapshots = await this.database.query({
      collection: EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name,
      query: {
        metric: DataMetrics.crossLending,
      },
    });
    dataState.dayData = groupReserveSnapshotsToDayData(snapshots as Array<CrossLendingReserveDataTimeframe>);

    return dataState;
  }

  // we save data in form of every single reserve (protocol-chain-token)
  // this function group reserves into a market (protocol-chain)
  public async getMarkets(timestamp: number): Promise<Array<AggCrossLendingMarketSnapshot>> {
    const snapshots: Array<any> = await this.database.query({
      collection: EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name,
      query: {
        timestamp: timestamp,
      },
    });

    const aggSnapshots: Array<AggCrossLendingReserveSnapshot> = [];
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
      aggSnapshots.push(
        CrossLendingDataTransformer.transformCrossLendingMarketSnapshot(
          snapshot,
          previousSnapshot ? previousSnapshot : null,
          snapshot,
        ),
      );
    }

    return CrossLendingDataTransformer.transformCrossReservesToMarkets(aggSnapshots);
  }

  // this function aims to return all data for given market (protocol-chain)
  public async getMarket(protocol: string, chain: string): Promise<AggCrossLendingMarketDataOverall> {
    const marketData: AggCrossLendingMarketDataOverall = {
      ...CrossLendingDataTransformer.getDefaultAggCrossLendingMarketSnapshot(protocol, chain, getTimestamp()),
      dayData: [],
    };

    // get states
    const reserveStates = await this.database.query({
      collection: EnvConfig.mongodb.collections.crossLendingReserveStates.name,
      query: {
        chain: chain,
        protocol: protocol,
      },
    });

    const marketUsers: { [key: string]: boolean } = {};
    const marketTransactions: { [key: string]: boolean } = {};
    for (const reserveState of reserveStates) {
      const reserveStateWithTimeframes = reserveState as CrossLendingReserveDataStateWithTimeframes;
      const reserveSnapshot = CrossLendingDataTransformer.transformCrossLendingMarketSnapshot(
        reserveStateWithTimeframes.timeframe24Hours,
        reserveStateWithTimeframes.timeframe48Hours,
        reserveStateWithTimeframes,
      );

      marketData.totalDeposited.valueUsd += reserveSnapshot.totalDeposited.valueUsd;
      marketData.totalBorrowed.valueUsd += reserveSnapshot.totalBorrowed.valueUsd;
      marketData.volumeDeposited.valueUsd += reserveSnapshot.volumeDeposited.valueUsd;
      marketData.volumeWithdrawn.valueUsd += reserveSnapshot.volumeWithdrawn.valueUsd;
      marketData.volumeBorrowed.valueUsd += reserveSnapshot.volumeBorrowed.valueUsd;
      marketData.volumeRepaid.valueUsd += reserveSnapshot.volumeRepaid.valueUsd;
      marketData.feesPaidTheoretically.valueUsd += reserveSnapshot.feesPaidTheoretically.valueUsd;

      if (reserveStateWithTimeframes.timeframe24Hours) {
        for (const address of reserveStateWithTimeframes.timeframe24Hours.addresses) {
          if (!marketUsers[address]) {
            marketUsers[address] = true;
          }
        }
        for (const transaction of reserveStateWithTimeframes.timeframe24Hours.transactions) {
          if (!marketTransactions[transaction]) {
            marketTransactions[transaction] = true;
          }
        }
      }

      marketData.reserves.push(reserveSnapshot);
    }

    marketData.numberOfUsers = Object.keys(marketUsers).length;
    marketData.numberOfTransactions = Object.keys(marketTransactions).length;

    // process snapshots
    const reserveSnapshots = await this.database.query({
      collection: EnvConfig.mongodb.collections.crossLendingReserveSnapshots.name,
      query: {
        chain: chain,
        protocol: protocol,
      },
    });

    marketData.dayData = groupReserveSnapshotsToDayData(reserveSnapshots as Array<CrossLendingReserveDataTimeframe>);

    return marketData;
  }
}
