import EnvConfig from '../../../configs/envConfig';
import { groupAndSumObjectList } from '../../../lib/helper';
import logger from '../../../lib/logger';
import { calChangesOf_Total_From_Items, calValueOf_Amount_With_Price, convertToNumber } from '../../../lib/math';
import { IDatabaseService } from '../../../services/database/domains';
import { AggDataAggregateNames } from '../../../types/aggregates/common';
import { AggPerpetualOverallState } from '../../../types/aggregates/perpetual';
import {
  PerpetualMarketDataStateWithTimeframes,
  PerpetualMarketDataTimeframe,
} from '../../../types/collectors/perpetutal';
import { DataMetrics } from '../../../types/configs';
import AggregatorTransformModel from '../transform/data';
import AggregatorTransformHelper from '../transform/helper';
import BaseDataAggregator from './base';

export default class PerpetualDataAggregator extends BaseDataAggregator {
  public readonly name: string = 'aggregator.perpetual';

  constructor(database: IDatabaseService) {
    super(database);
  }

  private async aggregatePerpetualDataState(): Promise<AggPerpetualOverallState> {
    const dataState: AggPerpetualOverallState = AggregatorTransformHelper.getDefaultAggPerpetualOverallState();

    // get all cross lending states
    const states = await this.database.query({
      collection: EnvConfig.mongodb.collections.perpetualMarketStates,
      query: {
        metric: DataMetrics.perpetual,
      },
    });

    for (const stateItem of states) {
      const stateWithTimeframes = stateItem as PerpetualMarketDataStateWithTimeframes;

      // sum all market value for overall data
      dataState.totalDeposited.valueUsd += calValueOf_Amount_With_Price(
        stateWithTimeframes.totalDeposited,
        stateWithTimeframes.tokenPrice,
      );
      dataState.totalOpenInterestShort.valueUsd += convertToNumber(stateWithTimeframes.totalOpenInterestShortUsd);
      dataState.totalOpenInterestShort.valueUsd += convertToNumber(stateWithTimeframes.totalOpenInterestShortUsd);

      if (stateWithTimeframes.timeframe24Hours) {
        const snapshot = AggregatorTransformModel.transformPerpetualMarketSnapshot(
          stateWithTimeframes.timeframe24Hours,
          stateWithTimeframes.timeframe48Hours,
          stateItem,
        );

        dataState.volumeFeesPaid.valueUsd += snapshot.volumeFeesPaid.valueUsd;
        dataState.volumeLong.valueUsd += snapshot.volumeLong.valueUsd;
        dataState.volumeShort.valueUsd += snapshot.volumeShort.valueUsd;
        dataState.volumeLiquidated.valueUsd += snapshot.volumeLiquidated.valueUsd;

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
    dataState.totalOpenInterestLong.changedValueUsd = calChangesOf_Total_From_Items(
      dataState.markets.map((snapshot) => {
        return {
          value: snapshot.totalOpenInterestLong.valueUsd,
          change: snapshot.totalOpenInterestLong.changedValueUsd ? snapshot.totalOpenInterestLong.changedValueUsd : 0,
        };
      }),
    );
    dataState.totalOpenInterestShort.changedValueUsd = calChangesOf_Total_From_Items(
      dataState.markets.map((snapshot) => {
        return {
          value: snapshot.totalOpenInterestShort.valueUsd,
          change: snapshot.totalOpenInterestShort.changedValueUsd ? snapshot.totalOpenInterestShort.changedValueUsd : 0,
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
    dataState.volumeLong.changedValueUsd = calChangesOf_Total_From_Items(
      dataState.markets.map((snapshot) => {
        return {
          value: snapshot.volumeLong.valueUsd,
          change: snapshot.volumeLong.changedValueUsd ? snapshot.volumeLong.changedValueUsd : 0,
        };
      }),
    );
    dataState.volumeShort.changedValueUsd = calChangesOf_Total_From_Items(
      dataState.markets.map((snapshot) => {
        return {
          value: snapshot.volumeShort.valueUsd,
          change: snapshot.volumeShort.changedValueUsd ? snapshot.volumeShort.changedValueUsd : 0,
        };
      }),
    );
    dataState.volumeLiquidated.changedValueUsd = calChangesOf_Total_From_Items(
      dataState.markets.map((snapshot) => {
        return {
          value: snapshot.volumeLiquidated.valueUsd,
          change: snapshot.volumeLiquidated.changedValueUsd ? snapshot.volumeLiquidated.changedValueUsd : 0,
        };
      }),
    );

    // process snapshots and build up day data list
    const snapshots = await this.database.query({
      collection: EnvConfig.mongodb.collections.perpetualMarketSnapshots,
      query: {
        metric: DataMetrics.perpetual,
      },
    });

    dataState.dayData = groupAndSumObjectList(
      snapshots.map((snapshot: PerpetualMarketDataTimeframe) => {
        return {
          timestamp: snapshot.timestamp,
          totalDeposited: calValueOf_Amount_With_Price(snapshot.totalDeposited, snapshot.tokenPrice),
          totalOpenInterestLong: convertToNumber(snapshot.totalOpenInterestLongUsd),
          totalOpenInterestShort: convertToNumber(snapshot.totalOpenInterestShortUsd),
          volumeFeesPaid: convertToNumber(snapshot.volumeFeesPaidUsd),
          volumeShort: convertToNumber(snapshot.volumeShortUsd),
          volumeLong: convertToNumber(snapshot.volumeLongUsd),
          volumeLiquidated: convertToNumber(snapshot.volumeLiquidatedUsd),
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
        totalOpenInterestLong: {
          value: 0,
          valueUsd: item.totalOpenInterestLong,
        },
        totalOpenInterestShort: {
          value: 0,
          valueUsd: item.totalOpenInterestShort,
        },
        volumeFeesPaid: {
          value: 0,
          valueUsd: item.volumeFeesPaid,
        },
        volumeShort: {
          value: 0,
          valueUsd: item.volumeShort,
        },
        volumeLong: {
          value: 0,
          valueUsd: item.volumeLong,
        },
        volumeLiquidated: {
          value: 0,
          valueUsd: item.volumeLiquidated,
        },
      };
    });

    return dataState;
  }

  public async runUpdate(): Promise<void> {
    const perpetualDataState = await this.aggregatePerpetualDataState();

    await this.database.update({
      collection: EnvConfig.mongodb.collections.aggregates,
      keys: {
        name: AggDataAggregateNames.perpetualDataState,
      },
      updates: {
        name: AggDataAggregateNames.perpetualDataState,
        ...perpetualDataState,
      },
      upsert: true,
    });

    logger.info(`aggregated and updated data`, {
      service: this.name,
      name: AggDataAggregateNames.perpetualDataState,
    });
  }
}
