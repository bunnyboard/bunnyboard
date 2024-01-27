import BigNumber from 'bignumber.js';

import EnvConfig from '../../../configs/envConfig';
import { DefaultRecordPerPage } from '../../../configs/policies';
import logger from '../../../lib/logger';
import { calChangesOf_Y_From_X_List } from '../../../lib/math';
import { countNumberOfUniqueValue, normalizeAddress } from '../../../lib/utils';
import { IDatabaseService } from '../../../services/database/domains';
import { AggDataAggregateNames, AggDataTypes } from '../../../types/aggregates/common';
import { AggCdpLendingOverallState, AggCrossLendingOverallState } from '../../../types/aggregates/lending';
import { AggDataQueryOptions, AggDataQueryResult, AggLendingDataQueryFilters } from '../../../types/aggregates/options';
import { DataMetrics } from '../../../types/configs';
import { DataAggregator } from '../../../types/namespaces';
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
      volumeDeposited: {
        value: 0,
        valueUsd: 0,
      },
      volumeWithdrawn: {
        value: 0,
        valueUsd: 0,
      },
      volumeBorrowed: {
        value: 0,
        valueUsd: 0,
      },
      volumeRepaid: {
        value: 0,
        valueUsd: 0,
      },
      volumeFeesPaid: {
        value: 0,
        valueUsd: 0,
      },
      numberOfChains: 0,
      numberOfProtocols: 0,
      markets: [],
      dayData: [],
    };

    const fields: Array<string> = [
      'totalDeposited',
      'totalBorrowed',
      'volumeDeposited',
      'volumeWithdrawn',
      'volumeBorrowed',
      'volumeRepaid',
      'volumeFeesPaid',
    ];

    // get all cross lending states
    const states = await this.database.query({
      collection: EnvConfig.mongodb.collections.lendingMarketStates,
      query: {
        metric: DataMetrics.crossLending,
      },
    });

    const previousValueUsds: any = {};
    for (const item of states) {
      const market = DataTransform.transformToCrossLendingMarketState(item);
      for (const field of fields) {
        (dataState as any)[field].valueUsd += (market as any)[field].valueUsd;

        // calculate previous snapshot data
        // ChangedValueUsd = y/x - 1
        // y / ChangedValueUsd + 1
        const previousTokenPrice = market.tokenPrice.valueUsd / (Number(market.tokenPrice.changedValueUsd) / 100 + 1);
        const previousValue = (market as any)[field].value / (Number((market as any)[field].changedValue) / 100 + 1);
        const previousValueUsd = previousValue * previousTokenPrice;
        (market as any)[field].changedValueUsd =
          (((market as any)[field].valueUsd - previousValueUsd) / previousValueUsd) * 100;

        if (!previousValueUsds[field]) {
          previousValueUsds[field] = 0;
        }
        previousValueUsds[field] += previousValueUsd;
      }

      dataState.markets.push(market);
    }

    dataState.numberOfProtocols = countNumberOfUniqueValue(dataState.markets, 'protocol');
    dataState.numberOfChains = countNumberOfUniqueValue(dataState.markets, 'chain');

    for (const field of fields) {
      if ((dataState as any)[field] && previousValueUsds[field]) {
        (dataState as any)[field].changedValueUsd =
          (((dataState as any)[field].valueUsd - previousValueUsds[field]) / previousValueUsds[field]) * 100;
      }
    }

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
        volumeFeesPaidUsd: new BigNumber(snapshot.volumeFeesPaid)
          .multipliedBy(new BigNumber(snapshot.tokenPrice))
          .toString(10),
      };
    });

    dataState.dayData = HelperTransform.buildupDayDataValueItems(snapshots, fields);
    dataState.dayData = dataState.dayData.sort(function (a: any, b: any) {
      return a.timestamp > b.timestamp ? 1 : -1;
    });

    return dataState;
  }

  private async aggregateCdpLendingDataState(): Promise<AggCdpLendingOverallState> {
    const dataState: AggCdpLendingOverallState = {
      totalDebts: {
        value: 0,
        valueUsd: 0,
      },
      totalCollateralDeposited: {
        value: 0,
        valueUsd: 0,
      },
      volumeBorrowed: {
        value: 0,
        valueUsd: 0,
      },
      volumeRepaid: {
        value: 0,
        valueUsd: 0,
      },
      volumeFeesPaid: {
        value: 0,
        valueUsd: 0,
      },
      markets: [],
      dayData: [],
    };

    // get all cross lending states
    const states = await this.database.query({
      collection: EnvConfig.mongodb.collections.lendingMarketStates,
      query: {
        metric: DataMetrics.cdpLending,
      },
    });

    for (const state of states) {
      const market = DataTransform.transformToCdpLendingMarketState(state);

      dataState.totalDebts.valueUsd += market.totalDebts.valueUsd;
      dataState.totalCollateralDeposited.valueUsd += market.totalCollateralDeposited.valueUsd;
      dataState.volumeBorrowed.valueUsd += market.volumeBorrowed.valueUsd;
      dataState.volumeRepaid.valueUsd += market.volumeRepaid.valueUsd;
      dataState.volumeFeesPaid.valueUsd += market.volumeFeesPaid.valueUsd;

      if (market.totalDeposited) {
        if (!dataState.totalDeposited) {
          dataState.totalDeposited = {
            value: 0,
            valueUsd: 0,
          };
        }
        dataState.totalDeposited.valueUsd += market.totalDeposited.valueUsd;
      }
      if (market.volumeDeposited) {
        if (!dataState.volumeDeposited) {
          dataState.volumeDeposited = {
            value: 0,
            valueUsd: 0,
          };
        }
        dataState.volumeDeposited.valueUsd += market.volumeDeposited.valueUsd;
      }
      if (market.volumeWithdrawn) {
        if (!dataState.volumeWithdrawn) {
          dataState.volumeWithdrawn = {
            value: 0,
            valueUsd: 0,
          };
        }
        dataState.volumeWithdrawn.valueUsd += market.volumeWithdrawn.valueUsd;
      }

      dataState.markets.push(market);
    }

    dataState.totalDebts.changedValueUsd = calChangesOf_Y_From_X_List(
      dataState.markets.map((market) => {
        return {
          value: market.totalDebts.valueUsd,
          change: market.totalDebts.changedValueUsd ? market.totalDebts.changedValueUsd : 0,
        };
      }),
    );
    dataState.totalCollateralDeposited.changedValueUsd = calChangesOf_Y_From_X_List(
      dataState.markets.map((market) => {
        return {
          value: market.totalCollateralDeposited.valueUsd,
          change: market.totalCollateralDeposited.changedValueUsd ? market.totalCollateralDeposited.changedValueUsd : 0,
        };
      }),
    );
    dataState.volumeBorrowed.changedValueUsd = calChangesOf_Y_From_X_List(
      dataState.markets.map((market) => {
        return {
          value: market.volumeBorrowed.valueUsd,
          change: market.volumeBorrowed.changedValueUsd ? market.volumeBorrowed.changedValueUsd : 0,
        };
      }),
    );
    dataState.volumeRepaid.changedValueUsd = calChangesOf_Y_From_X_List(
      dataState.markets.map((market) => {
        return {
          value: market.volumeRepaid.valueUsd,
          change: market.volumeRepaid.changedValueUsd ? market.volumeRepaid.changedValueUsd : 0,
        };
      }),
    );
    dataState.volumeFeesPaid.changedValueUsd = calChangesOf_Y_From_X_List(
      dataState.markets.map((market) => {
        return {
          value: market.volumeFeesPaid.valueUsd,
          change: market.volumeFeesPaid.changedValueUsd ? market.volumeFeesPaid.changedValueUsd : 0,
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

    const cdpLendingDataState = await this.aggregateCdpLendingDataState();

    await this.database.update({
      collection: EnvConfig.mongodb.collections.aggregates,
      keys: {
        name: AggDataAggregateNames.cdpLendingDataState,
      },
      updates: {
        name: AggDataAggregateNames.cdpLendingDataState,
        ...cdpLendingDataState,
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
