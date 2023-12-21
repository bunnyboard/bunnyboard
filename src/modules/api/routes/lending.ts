import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import EnvConfig from '../../../configs/envConfig';
import { normalizeAddress } from '../../../lib/utils';
import { ContextServices } from '../../../types/namespaces';
import { writeResponse } from '../middleware';

export function getRouter(services: ContextServices): Router {
  const router = Router({ mergeParams: true });

  // query a list of available lending markets
  router.get('/market/list', async (request: Request, response: Response) => {
    // first, we get unique market ids
    const collection = await services.database.getCollection(EnvConfig.mongodb.collections.lendingMarketSnapshots);

    const groupUniques = await collection
      .aggregate([
        { $group: { _id: { protocol: '$protocol', chain: '$chain', address: '$address', token: '$token' } } },
      ])
      .toArray();

    const markets: Array<any> = [];
    for (const uniqueId of groupUniques) {
      markets.push({
        chain: uniqueId._id.chain,
        protocol: uniqueId._id.protocol,
        address: uniqueId._id.address,
        token: uniqueId._id.token,
      });
    }

    await writeResponse(services, request, response, HttpStatusCode.Ok, {
      error: null,
      result: markets,
    });
  });

  // get all snapshots of a market
  router.get('/market/chain/:chain/address/:address/token/:token', async (request: Request, response: Response) => {
    const { chain, address, token } = request.params;
    const { order } = request.query;

    const documents: Array<any> = await services.database.query({
      collection: EnvConfig.mongodb.collections.lendingMarketSnapshots,
      query: {
        chain,
        address: normalizeAddress(address),
        'token.address': normalizeAddress(token),
      },
      options: {
        limit: 0, // no limit
        skip: 0,
        order: { timestamp: order && order === 'oldest' ? 1 : -1 },
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
