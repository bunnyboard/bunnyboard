import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import EnvConfig from '../../../configs/envConfig';
import { normalizeAddress } from '../../../lib/utils';
import { ContextServices } from '../../../types/namespaces';
import { writeResponse } from '../middleware';

export function getRouter(services: ContextServices): Router {
  const router = Router({ mergeParams: true });

  // query all market at latest snapshot
  router.get('/market/latest', async (request: Request, response: Response) => {
    // first, we get unique market ids
    const collection = await services.database.getCollection(EnvConfig.mongodb.collections.lendingMarketSnapshots);

    const marketIds = await collection.distinct('marketId');
    const snapshots: Array<any> = [];
    for (const marketId of marketIds) {
      const latestSnapshot = await services.database.find({
        collection: EnvConfig.mongodb.collections.lendingMarketSnapshots,
        query: {
          marketId: marketId,
        },
        options: {
          limit: 1,
          skip: 0,
          order: { timestamp: -1 },
        },
      });
      if (latestSnapshot) {
        delete latestSnapshot._id;
        snapshots.push(latestSnapshot);
      }
    }

    await writeResponse(services, request, response, HttpStatusCode.Ok, {
      error: null,
      result: snapshots,
    });
  });

  // get all snapshots of a market
  router.get('/market/chain/:chain/address/:address/token/:token', async (request: Request, response: Response) => {
    const { chain, address, token } = request.params;

    const documents: Array<any> = await services.database.query({
      collection: EnvConfig.mongodb.collections.lendingMarketSnapshots,
      query: {
        chain,
        address: normalizeAddress(address),
        'token.address': normalizeAddress(token),
      },
    });
    const snapshots: Array<any> = [];
    for (const document of documents) {
      delete document._id;
      snapshots.push(document);
    }

    await writeResponse(services, request, response, HttpStatusCode.Ok, {
      error: null,
      params: {
        chain: chain,
        address: normalizeAddress(address),
        token: normalizeAddress(token),
      },
      result: snapshots,
    });
  });

  return router;
}
