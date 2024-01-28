import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import EnvConfig from '../../../../configs/envConfig';
import { DefaultRecordPerPage } from '../../../../configs/policies';
import { normalizeAddress } from '../../../../lib/utils';
import { IDatabaseService } from '../../../../services/database/domains';
import { AggDataQueryResult } from '../../../../types/aggregates/options';
import { writeResponse } from '../middleware';

export function getRouter(database: IDatabaseService): Router {
  const router = Router({ mergeParams: true });

  router.post('/query/', async (request: Request, response: Response) => {
    const query: any = {};
    if (request.body.chain) {
      query.chain = request.body.chain;
    }
    if (request.body.protocol) {
      query.protocol = request.body.protocol;
    }
    if (request.body.action) {
      query.action = request.body.action;
    }
    if (request.body.token) {
      query['token.address'] = normalizeAddress(request.body.token);
    }
    if (request.body.timeframe) {
      query.timestamp = {
        $gte: Number(request.body.timeframe.from),
        $lte: Number(request.body.timeframe.to),
      };
    }

    const pagingOrder =
      request.body.paging && request.body.paging.order === 'oldest' ? request.body.paging.order : 'latest';
    const queryPage = request.body.paging ? request.body.paging.page : 0;
    const queryOrder = { timestamp: pagingOrder === 'oldest' ? 1 : -1 };

    const totalPage = Math.floor(
      (await database.countDocuments({
        collection: EnvConfig.mongodb.collections.activities,
        query: query,
      })) /
        DefaultRecordPerPage +
        1,
    );

    const result: AggDataQueryResult = {
      totalPage: totalPage,
      returnPage: queryPage,
      returnOrder: pagingOrder,
      data: [],
    };

    const documents: Array<any> = await database.query({
      collection: EnvConfig.mongodb.collections.activities,
      query: query,
      options: {
        limit: DefaultRecordPerPage,
        skip: queryPage * DefaultRecordPerPage,
        order: queryOrder,
      },
    });

    for (const document of documents) {
      delete document._id;

      result.data.push(document);
    }

    await writeResponse(database, request, response, HttpStatusCode.Ok, {
      error: null,
      data: result,
    });
  });

  return router;
}
