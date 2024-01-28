import EnvConfig from '../../../configs/envConfig';
import { DefaultRecordPerPage } from '../../../configs/policies';
import { groupAndSumObjectList } from '../../../lib/helper';
import logger from '../../../lib/logger';
import { calChangesOf_Total_From_Items, calValueOf_Amount_With_Price } from '../../../lib/math';
import { normalizeAddress } from '../../../lib/utils';
import { IDatabaseService } from '../../../services/database/domains';
import { AggDataAggregateNames, AggDataTypes } from '../../../types/aggregates/common';
import { AggCdpLendingOverallState } from '../../../types/aggregates/lending';
import { AggDataQueryOptions, AggDataQueryResult, AggLendingDataQueryFilters } from '../../../types/aggregates/options';
import { CdpLendingMarketDataStateWithTimeframes } from '../../../types/collectors/lending';
import { DataMetrics } from '../../../types/configs';
import { DataAggregator } from '../../../types/namespaces';
import AggregatorTransformModel from '../transform/data';
import AggregatorTransformHelper from '../transform/helper';

export default class CdpLendingDataAggregator implements DataAggregator {
  public readonly name: string = 'aggregator.cdpLending';
  public readonly database: IDatabaseService;

  constructor(database: IDatabaseService) {
    this.database = database;
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

      if (type === AggDataTypes.snapshot && metric === DataMetrics.cdpLending) {
        for (const document of documents) {
          // we find the previous snapshot data if any
          const previousSnapshot = await this.database.find({
            collection: EnvConfig.mongodb.collections.lendingMarketSnapshots,
            query: {
              chain: document.chain,
              protocol: document.protocol,
              metric: document.metric,
              'token.address': document.token.address,
              timestamp: Number(document.timestamp) - 24 * 60 * 60,
            },
          });
          result.data.push(
            AggregatorTransformModel.transformCdpLendingMarketSnapshot(document, previousSnapshot, null),
          );
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
