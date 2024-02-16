import { DefaultQueryRecordPerPage } from '../../../configs';
import EnvConfig from '../../../configs/envConfig';
import { normalizeAddress } from '../../../lib/utils';
import { IDatabaseService } from '../../../services/database/domains';
import { AggDataQueryFilters, AggDataQueryOptions, AggDataQueryResult } from '../../../types/aggregates/options';
import { DataMetrics } from '../../../types/configs';
import { DataAggregator } from '../../../types/namespaces';
import AggregatorTransformModel from '../transform/data';

export default class BaseDataAggregator implements DataAggregator {
  public readonly name: string = 'aggregator.baseData';
  public readonly database: IDatabaseService;

  constructor(database: IDatabaseService) {
    this.database = database;
  }

  public async runUpdate(): Promise<void> {}

  public async query(options: AggDataQueryOptions): Promise<AggDataQueryResult | null> {
    const { metric, paging } = options;
    const filters = options.filters as AggDataQueryFilters;

    const query: any = {
      metric: metric,
    };
    if (filters.chain) {
      query.chain = filters.chain;
    }
    if (filters.protocol) {
      query.protocol = filters.protocol;
    }
    if (filters.timestamp) {
      query.timestamp = Number(filters.timestamp);
    }
    if (filters.token) {
      query['token.address'] = normalizeAddress(filters.token);
    }

    let collectionName = null;
    switch (metric) {
      case DataMetrics.crossLending:
      case DataMetrics.cdpLending: {
        collectionName = EnvConfig.mongodb.collections.lendingMarketSnapshots;
        break;
      }
      case DataMetrics.perpetual: {
        collectionName = EnvConfig.mongodb.collections.perpetualMarketSnapshots;
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
          DefaultQueryRecordPerPage +
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
          limit: DefaultQueryRecordPerPage,
          skip: queryPage * DefaultQueryRecordPerPage,
          order: queryOrder,
        },
      });

      if (metric === DataMetrics.crossLending) {
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
          result.data.push(
            AggregatorTransformModel.transformCrossLendingMarketSnapshot(document, previousSnapshot, document),
          );
        }
      } else if (metric === DataMetrics.cdpLending) {
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
            AggregatorTransformModel.transformCdpLendingMarketSnapshot(document, previousSnapshot, document),
          );
        }
      } else if (metric === DataMetrics.perpetual) {
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
          result.data.push(
            AggregatorTransformModel.transformPerpetualMarketSnapshot(document, previousSnapshot, document),
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
