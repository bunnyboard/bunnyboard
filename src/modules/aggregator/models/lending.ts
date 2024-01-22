import BigNumber from 'bignumber.js';

import EnvConfig from '../../../configs/envConfig';
import { DefaultRecordPerPage } from '../../../configs/policies';
import logger from '../../../lib/logger';
import { countNumberOfUniqueValue, normalizeAddress } from '../../../lib/utils';
import { IDatabaseService } from '../../../services/database/domains';
import { AggDataAggregateNames, AggDataTypes } from '../../../types/aggregates/common';
import { AggCrossLendingOverallState } from '../../../types/aggregates/lending';
import { DataAggregator } from '../../../types/aggregates/namespaces';
import { AggDataQueryOptions, AggDataQueryResult, AggLendingDataQueryFilters } from '../../../types/aggregates/options';
import { DataMetrics } from '../../../types/configs';
import DataTransform from '../transform/data';
import HelperTransform from '../transform/helper';

export default class LendingDataAggregator implements DataAggregator {
  public readonly name: string = 'aggregator.lending';
  public readonly database: IDatabaseService;

  constructor(database: IDatabaseService) {
    this.database = database;
  }

  private async aggregateCrossLendingDataState(): Promise<AggCrossLendingOverallState> {
    const dataState: AggCrossLendingOverallState = {
      totalDeposited: {
        value: 0,
        valueUsd: 0,
      },
      totalBorrowed: {
        value: 0,
        valueUsd: 0,
      },
      numberOfChains: 0,
      numberOfProtocols: 0,
      markets: [],
      dayData: [],
    };

    // get all cross lending states
    const states = await this.database.query({
      collection: EnvConfig.mongodb.collections.lendingMarketStates,
      query: {
        metric: DataMetrics.crossLending,
      },
    });
    for (const item of states) {
      const market = DataTransform.transformToCrossLendingMarketState(item);

      dataState.totalDeposited.valueUsd += market.totalDeposited.valueUsd;
      dataState.totalBorrowed.valueUsd += market.totalBorrowed.valueUsd;

      dataState.markets.push(market);
    }

    dataState.numberOfProtocols = countNumberOfUniqueValue(dataState.markets, 'protocol');
    dataState.numberOfChains = countNumberOfUniqueValue(dataState.markets, 'chain');

    // process snapshots and build charts items
    let snapshots = await this.database.query({
      collection: EnvConfig.mongodb.collections.lendingMarketSnapshots,
      query: {
        metric: DataMetrics.crossLending,
      },
    });

    snapshots = snapshots.map((snapshot) => {
      return {
        ...snapshot,

        totalDepositedUsd: new BigNumber(snapshot.totalDeposited)
          .multipliedBy(new BigNumber(snapshot.tokenPrice))
          .toString(10),
        totalBorrowedUsd: new BigNumber(snapshot.totalBorrowed)
          .multipliedBy(new BigNumber(snapshot.tokenPrice))
          .toString(10),

        volumeDepositedUsd: new BigNumber(snapshot.volumeDeposited)
          .multipliedBy(new BigNumber(snapshot.tokenPrice))
          .toString(10),
        volumeWithdrawnUsd: new BigNumber(snapshot.volumeWithdrawn)
          .multipliedBy(new BigNumber(snapshot.tokenPrice))
          .toString(10),
        volumeBorrowedUsd: new BigNumber(snapshot.volumeBorrowed)
          .multipliedBy(new BigNumber(snapshot.tokenPrice))
          .toString(10),
        volumeRepaidUsd: new BigNumber(snapshot.volumeRepaid)
          .multipliedBy(new BigNumber(snapshot.tokenPrice))
          .toString(10),
      };
    });

    const fields: Array<string> = [
      'totalDeposited',
      'totalBorrowed',
      'volumeDeposited',
      'volumeWithdrawn',
      'volumeBorrowed',
      'volumeRepaid',
    ];
    dataState.dayData = HelperTransform.buildupDayDataValueItems(snapshots, fields);
    dataState.dayData = dataState.dayData.sort(function (a: any, b: any) {
      return a.timestamp > b.timestamp ? 1 : -1;
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
          result.data.push(DataTransform.transformToCrossLendingMarketSnapshot(document, previousSnapshot));
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
