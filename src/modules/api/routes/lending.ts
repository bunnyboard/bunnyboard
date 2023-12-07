import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import EnvConfig from '../../../configs/envConfig';
import { getTodayUTCTimestamp } from '../../../lib/utils';
import { ContextServices } from '../../../types/namespaces';
import { writeResponse } from '../middleware';

export function getRouter(services: ContextServices): Router {
  const router = Router({ mergeParams: true });

  // query latest market snapshots at exact today UTC timestamp
  router.get('/market/latest', async (request: Request, response: Response) => {
    const todayTimestamp = getTodayUTCTimestamp();

    const documents = await services.database.query({
      collection: EnvConfig.mongodb.collections.lendingMarketSnapshots,
      query: {
        timestamp: { $eq: todayTimestamp },
      },
    });

    const markets: Array<any> = [];
    for (const document of documents) {
      delete document._id;
      markets.push(document);
    }

    await writeResponse(services, request, response, HttpStatusCode.Ok, {
      error: null,
      markets: markets,
    });
  });

  return router;
}
