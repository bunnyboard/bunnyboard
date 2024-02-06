import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import { normalizeAddress } from '../../../../lib/utils';
import { IDatabaseService } from '../../../../services/database/domains';
import { DataMetrics } from '../../../../types/configs';
import { DataAggregator } from '../../../../types/namespaces';
import CdpLendingDataAggregator from '../../models/cdpLending';
import CrossLendingDataAggregator from '../../models/crossLending';
import PerpetualDataAggregator from '../../models/perpetual';
import { writeResponse } from '../middleware';

export function getRouter(database: IDatabaseService): Router {
  const router = Router({ mergeParams: true });

  router.post('/query', async (request: Request, response: Response) => {
    let aggregator: DataAggregator | null = null;

    switch (request.body.metric) {
      case DataMetrics.crossLending: {
        aggregator = new CrossLendingDataAggregator(database);
        break;
      }
      case DataMetrics.cdpLending: {
        aggregator = new CdpLendingDataAggregator(database);
        break;
      }
      case DataMetrics.perpetual: {
        aggregator = new PerpetualDataAggregator(database);
        break;
      }
    }

    if (aggregator) {
      const result = await aggregator.query({
        type: request.params.name,
        metric: request.body.metric,

        filters: {
          chain: request.body.chain,
          protocol: request.body.protocol,
          token: normalizeAddress(request.body.token),
          timestamp: Number(request.body.timestamp),
        },

        paging: {
          page:
            request.body.paging && (request.body.paging as any).page ? Number((request.body.paging as any).page) : 0,
          order:
            request.body.paging && (request.body.paging as any).order ? (request.body.paging as any).order : 'latest',
        },
      });

      await writeResponse(database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: result,
      });
    } else {
      await writeResponse(database, request, response, HttpStatusCode.NotFound, {
        error: 'not found',
      });
    }
  });

  return router;
}
