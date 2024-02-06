import EnvConfig from '../../../configs/envConfig';
import { groupAndSumObjectList } from '../../../lib/helper';
import logger from '../../../lib/logger';
import { calChangesOf_Total_From_Items, calValueOf_Amount_With_Price } from '../../../lib/math';
import { IDatabaseService } from '../../../services/database/domains';
import { AggDataAggregateNames } from '../../../types/aggregates/common';
import { AggCrossLendingOverallState } from '../../../types/aggregates/lending';
import { CrossLendingMarketDataStateWithTimeframes } from '../../../types/collectors/lending';
import { DataMetrics } from '../../../types/configs';
import AggregatorTransformModel from '../transform/data';
import AggregatorTransformHelper from '../transform/helper';
import BaseDataAggregator from './base';

export default class CrossLendingDataAggregator extends BaseDataAggregator {
  public readonly name: string = 'aggregator.crossLending';

  constructor(database: IDatabaseService) {
    super(database);
  }

  private async aggregateCrossLendingDataState(): Promise<AggCrossLendingOverallState> {
    const dataState: AggCrossLendingOverallState = AggregatorTransformHelper.getDefaultAggCrossLendingOverallState();

    // get all cross lending states
    const states = await this.database.query({
      collection: EnvConfig.mongodb.collections.lendingMarketStates,
      query: {
        metric: DataMetrics.crossLending,
      },
    });

    for (const stateItem of states) {
      const stateWithTimeframes = stateItem as CrossLendingMarketDataStateWithTimeframes;

      // sum all market value for overall data
      dataState.totalDeposited.valueUsd += calValueOf_Amount_With_Price(stateItem.totalDeposited, stateItem.tokenPrice);
      dataState.totalBorrowed.valueUsd += calValueOf_Amount_With_Price(stateItem.totalBorrowed, stateItem.tokenPrice);

      if (stateWithTimeframes.timeframe24Hours) {
        const snapshot = AggregatorTransformModel.transformCrossLendingMarketSnapshot(
          stateWithTimeframes.timeframe24Hours,
          stateWithTimeframes.timeframe48Hours,
          stateItem,
        );

        dataState.volumeFeesPaid.valueUsd += snapshot.volumeFeesPaid.valueUsd;
        dataState.volumeDeposited.valueUsd += snapshot.volumeDeposited.valueUsd;
        dataState.volumeWithdrawn.valueUsd += snapshot.volumeWithdrawn.valueUsd;
        dataState.volumeBorrowed.valueUsd += snapshot.volumeBorrowed.valueUsd;
        dataState.volumeRepaid.valueUsd += snapshot.volumeRepaid.valueUsd;

        dataState.markets.push(snapshot);
      }
    }

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

    dataState.volumeFeesPaid.changedValueUsd = calChangesOf_Total_From_Items(
      dataState.markets.map((snapshot) => {
        return {
          value: snapshot.volumeFeesPaid.valueUsd,
          change: snapshot.volumeFeesPaid.changedValueUsd ? snapshot.volumeFeesPaid.changedValueUsd : 0,
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
      collection: EnvConfig.mongodb.collections.lendingMarketSnapshots,
      query: {
        metric: DataMetrics.crossLending,
      },
    });
    dataState.dayData = groupAndSumObjectList(
      snapshots.map((snapshot) => {
        return {
          timestamp: snapshot.timestamp,
          totalDeposited: calValueOf_Amount_With_Price(snapshot.totalDeposited, snapshot.tokenPrice),
          totalBorrowed: calValueOf_Amount_With_Price(snapshot.totalBorrowed, snapshot.tokenPrice),
          volumeFeesPaid: calValueOf_Amount_With_Price(snapshot.volumeFeesPaid, snapshot.tokenPrice),
          volumeDeposited: calValueOf_Amount_With_Price(snapshot.volumeDeposited, snapshot.tokenPrice),
          volumeWithdrawn: calValueOf_Amount_With_Price(snapshot.volumeWithdrawn, snapshot.tokenPrice),
          volumeBorrowed: calValueOf_Amount_With_Price(snapshot.volumeBorrowed, snapshot.tokenPrice),
          volumeRepaid: calValueOf_Amount_With_Price(snapshot.volumeRepaid, snapshot.tokenPrice),
        };
      }),
      'timestamp',
    ).map((item) => {
      return {
        timestamp: item.timestamp,
        totalDeposited: {
          value: 0,
          valueUsd: item.totalDeposited,
        },
        totalBorrowed: {
          value: 0,
          valueUsd: item.totalBorrowed,
        },
        volumeFeesPaid: {
          value: 0,
          valueUsd: item.volumeFeesPaid,
        },
        volumeDeposited: {
          value: 0,
          valueUsd: item.volumeDeposited,
        },
        volumeWithdrawn: {
          value: 0,
          valueUsd: item.volumeWithdrawn,
        },
        volumeBorrowed: {
          value: 0,
          valueUsd: item.volumeBorrowed,
        },
        volumeRepaid: {
          value: 0,
          valueUsd: item.volumeRepaid,
        },
      };
    });

    return dataState;
  }

  public async runUpdate(): Promise<void> {
    const crossLendingDataState = await this.aggregateCrossLendingDataState();

    await this.database.update({
      collection: EnvConfig.mongodb.collections.aggregates,
      keys: {
        name: AggDataAggregateNames.crossLendingDataState,
      },
      updates: {
        name: AggDataAggregateNames.crossLendingDataState,
        ...crossLendingDataState,
      },
      upsert: true,
    });

    logger.info(`aggregated and updated data`, {
      service: this.name,
      name: AggDataAggregateNames.crossLendingDataState,
    });
  }
}
