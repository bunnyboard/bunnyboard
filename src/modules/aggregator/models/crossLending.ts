import EnvConfig from '../../../configs/envConfig';
import { DefaultRecordPerPage } from '../../../configs/policies';
import logger from '../../../lib/logger';
import { calChangesOf_Total_From_Items, calValueOf_Amount_With_Price } from '../../../lib/math';
import { normalizeAddress } from '../../../lib/utils';
import { IDatabaseService } from '../../../services/database/domains';
import { AggDataAggregateNames, AggDataTypes } from '../../../types/aggregates/common';
import { AggCrossLendingOverallState } from '../../../types/aggregates/lending';
import { AggDataQueryOptions, AggDataQueryResult, AggLendingDataQueryFilters } from '../../../types/aggregates/options';
import { CrossLendingMarketDataStateWithTimeframes } from '../../../types/collectors/lending';
import { DataMetrics } from '../../../types/configs';
import { DataAggregator } from '../../../types/namespaces';
import AggregatorTransformModel from '../transform/data';
import AggregatorTransformHelper from '../transform/helper';

export default class CrossLendingDataAggregator implements DataAggregator {
  public readonly name: string = 'aggregator.lending';
  public readonly database: IDatabaseService;

  constructor(database: IDatabaseService) {
    this.database = database;
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

  public async query(options: AggDataQueryOptions): Promise<AggDataQueryResult | null> {
    const { type, metric, paging } = options;
    const filters = options.filters as AggLendingDataQueryFilters;

    const query: any = {
      metric: metric,
    };
    if (filters.chain) {
      query.chain = filters.chain;
    }
    if (filters.protocol) {
      query.protocol = filters.protocol;
    }
    if (filters.action) {
      query.action = filters.action;
    }
    if (filters.timestamp) {
      query.timestamp = Number(filters.timestamp);
    }
    if (filters.token) {
      query['token.address'] = normalizeAddress(filters.token);
    }

    let collectionName = null;
    switch (type) {
      case AggDataTypes.snapshot: {
        collectionName = EnvConfig.mongodb.collections.lendingMarketSnapshots;
        break;
      }
      case AggDataTypes.activity: {
        collectionName = EnvConfig.mongodb.collections.activities;
        break;
      }
    }

    if (collectionName) {
      const queryPage = paging.page;
      const queryOrder = { timestamp: paging.order === 'oldest' ? 1 : -1 };

      const totalPage = Math.floor(
        (await this.database.countDocuments({
          collection: collectionName,
          query: query,
        })) /
          DefaultRecordPerPage +
          1,
      );

      const result: AggDataQueryResult = {
        totalPage: totalPage,
        returnPage: queryPage,
        returnOrder: paging.order,
        data: [],
      };

      const documents: Array<any> = await this.database.query({
        collection: collectionName,
        query: query,
        options: {
          limit: DefaultRecordPerPage,
          skip: queryPage * DefaultRecordPerPage,
          order: queryOrder,
        },
      });

      if (type === AggDataTypes.snapshot && metric === DataMetrics.crossLending) {
        for (const document of documents) {
          // we find the previous snapshot data if any
          const previousSnapshot = await this.database.find({
            collection: EnvConfig.mongodb.collections.lendingMarketSnapshots,
            query: {
              chain: document.chain,
              protocol: document.protocol,
              metric: document.metric,
              address: document.address,
              'token.address': document.token.address,
              timestamp: Number(document.timestamp) - 24 * 60 * 60,
            },
          });
          result.data.push(AggregatorTransformModel.transformCrossLendingMarketSnapshot(document, previousSnapshot));
        }
      } else {
        for (const document of documents) {
          delete document._id;
          result.data.push(document);
        }
      }

      return result;
    }

    return null;
  }
}
