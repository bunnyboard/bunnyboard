import EnvConfig from '../../../configs/envConfig';
import { groupAndSumObjectList } from '../../../lib/helper';
import logger from '../../../lib/logger';
import { calChangesOf_Total_From_Items, calValueOf_Amount_With_Price } from '../../../lib/math';
import { IDatabaseService } from '../../../services/database/domains';
import { AggDataAggregateNames } from '../../../types/aggregates/common';
import { AggCdpLendingOverallState } from '../../../types/aggregates/lending';
import { CdpLendingMarketDataStateWithTimeframes } from '../../../types/collectors/lending';
import { DataMetrics } from '../../../types/configs';
import AggregatorTransformModel from '../transform/data';
import AggregatorTransformHelper from '../transform/helper';
import BaseDataAggregator from './base';

export default class CdpLendingDataAggregator extends BaseDataAggregator {
  public readonly name: string = 'aggregator.cdpLending';

  constructor(database: IDatabaseService) {
    super(database);
  }

  private async aggregateCdpLendingDataState(): Promise<AggCdpLendingOverallState> {
    const dataState: AggCdpLendingOverallState = AggregatorTransformHelper.getDefaultAggCdpLendingOverallState();

    // get all cdp lending states
    const states = await this.database.query({
      collection: EnvConfig.mongodb.collections.lendingMarketStates,
      query: {
        metric: DataMetrics.cdpLending,
      },
    });

    for (const stateItem of states) {
      const stateWithTimeframes = stateItem as CdpLendingMarketDataStateWithTimeframes;

      // sum all market value for overall data
      dataState.totalDebts.valueUsd += calValueOf_Amount_With_Price(
        stateWithTimeframes.totalDebts,
        stateItem.tokenPrice,
      );

      if (stateWithTimeframes.timeframe24Hours) {
        const snapshot = AggregatorTransformModel.transformCdpLendingMarketSnapshot(
          stateWithTimeframes.timeframe24Hours,
          stateWithTimeframes.timeframe48Hours,
          stateItem,
        );

        dataState.volumeFeesPaid.valueUsd += snapshot.volumeFeesPaid.valueUsd;
        dataState.volumeBorrowed.valueUsd += snapshot.volumeBorrowed.valueUsd;
        dataState.volumeRepaid.valueUsd += snapshot.volumeRepaid.valueUsd;

        dataState.totalCollateralDeposited.valueUsd += snapshot.totalCollateralDeposited.valueUsd;
        dataState.volumeCollateralDeposited.valueUsd += snapshot.volumeCollateralDeposited.valueUsd;
        dataState.volumeCollateralWithdrawn.valueUsd += snapshot.volumeCollateralWithdrawn.valueUsd;
        dataState.volumeCollateralLiquidated.valueUsd += snapshot.volumeCollateralLiquidated.valueUsd;

        dataState.markets.push(snapshot);
      }
    }

    // now we have a problem here, dataState is sum of all market values
    // we must calculate this total value change percentages
    dataState.totalDebts.changedValueUsd = calChangesOf_Total_From_Items(
      dataState.markets.map((snapshot) => {
        return {
          value: snapshot.totalDebts.valueUsd,
          change: snapshot.totalDebts.changedValueUsd ? snapshot.totalDebts.changedValueUsd : 0,
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

    dataState.totalCollateralDeposited.changedValueUsd = calChangesOf_Total_From_Items(
      dataState.markets.map((snapshot) => {
        return {
          value: snapshot.totalCollateralDeposited.valueUsd,
          change: snapshot.totalCollateralDeposited.changedValueUsd
            ? snapshot.totalCollateralDeposited.changedValueUsd
            : 0,
        };
      }),
    );
    dataState.volumeCollateralDeposited.changedValueUsd = calChangesOf_Total_From_Items(
      dataState.markets.map((snapshot) => {
        return {
          value: snapshot.volumeCollateralDeposited.valueUsd,
          change: snapshot.volumeCollateralDeposited.changedValueUsd
            ? snapshot.volumeCollateralDeposited.changedValueUsd
            : 0,
        };
      }),
    );
    dataState.volumeCollateralWithdrawn.changedValueUsd = calChangesOf_Total_From_Items(
      dataState.markets.map((snapshot) => {
        return {
          value: snapshot.volumeCollateralWithdrawn.valueUsd,
          change: snapshot.volumeCollateralWithdrawn.changedValueUsd
            ? snapshot.volumeCollateralWithdrawn.changedValueUsd
            : 0,
        };
      }),
    );
    dataState.volumeCollateralLiquidated.changedValueUsd = calChangesOf_Total_From_Items(
      dataState.markets.map((snapshot) => {
        return {
          value: snapshot.volumeCollateralLiquidated.valueUsd,
          change: snapshot.volumeCollateralLiquidated.changedValueUsd
            ? snapshot.volumeCollateralLiquidated.changedValueUsd
            : 0,
        };
      }),
    );

    // process snapshots and build up day data list
    const snapshots = await this.database.query({
      collection: EnvConfig.mongodb.collections.lendingMarketSnapshots,
      query: {
        metric: DataMetrics.cdpLending,
      },
    });
    const transformedSnapshots = snapshots.map((snapshot) =>
      AggregatorTransformModel.transformCdpLendingMarketSnapshot(snapshot, snapshot, snapshot),
    );

    dataState.dayData = groupAndSumObjectList(
      transformedSnapshots.map((snapshot) => {
        return {
          timestamp: snapshot.timestamp,
          totalDebts: snapshot.totalDebts.valueUsd,
          volumeBorrowed: snapshot.volumeBorrowed.valueUsd,
          volumeRepaid: snapshot.volumeRepaid.valueUsd,
          volumeFeesPaid: snapshot.volumeFeesPaid.valueUsd,

          totalCollateralDeposited: snapshot.totalCollateralDeposited.valueUsd,
          volumeCollateralDeposited: snapshot.volumeCollateralDeposited.valueUsd,
          volumeCollateralWithdrawn: snapshot.volumeCollateralWithdrawn.valueUsd,
          volumeCollateralLiquidated: snapshot.volumeCollateralLiquidated.valueUsd,
        };
      }),
      'timestamp',
    ).map((item) => {
      return {
        timestamp: item.timestamp,
        totalDebts: {
          value: 0,
          valueUsd: item.totalDebts,
        },
        volumeBorrowed: {
          value: 0,
          valueUsd: item.volumeBorrowed,
        },
        volumeRepaid: {
          value: 0,
          valueUsd: item.volumeRepaid,
        },
        volumeFeesPaid: {
          value: 0,
          valueUsd: item.volumeFeesPaid,
        },
        totalCollateralDeposited: {
          value: 0,
          valueUsd: item.totalCollateralDeposited,
        },
        volumeCollateralDeposited: {
          value: 0,
          valueUsd: item.volumeCollateralDeposited,
        },
        volumeCollateralWithdrawn: {
          value: 0,
          valueUsd: item.volumeCollateralWithdrawn,
        },
        volumeCollateralLiquidated: {
          value: 0,
          valueUsd: item.volumeCollateralLiquidated,
        },
      };
    });

    return dataState;
  }

  public async runUpdate(): Promise<void> {
    const CdpLendingDataState = await this.aggregateCdpLendingDataState();

    await this.database.update({
      collection: EnvConfig.mongodb.collections.aggregates,
      keys: {
        name: AggDataAggregateNames.cdpLendingDataState,
      },
      updates: {
        name: AggDataAggregateNames.cdpLendingDataState,
        ...CdpLendingDataState,
      },
      upsert: true,
    });

    logger.info(`aggregated and updated data`, {
      service: this.name,
      name: AggDataAggregateNames.cdpLendingDataState,
    });
  }
}
