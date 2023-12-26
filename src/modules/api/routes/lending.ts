import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import { DefaultQueryDataLimit } from '../../../configs';
import EnvConfig from '../../../configs/envConfig';
import { normalizeAddress } from '../../../lib/utils';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { writeResponse } from '../middleware';

export function getRouter(storages: ContextStorages, services: ContextServices): Router {
  const router = Router({ mergeParams: true });

  // query a list of available lending markets
  router.get('/market/list', async (request: Request, response: Response) => {
    // first, we get unique market ids
    const collection = await storages.database.getCollection(EnvConfig.mongodb.collections.lendingMarketSnapshots);

    const groupUniques = await collection
      .aggregate([
        {
          $group: {
            _id: { protocol: '$protocol', chain: '$chain', address: '$address', token: '$token', type: '$type' },
          },
        },
      ])
      .toArray();

    const markets: Array<any> = [];
    for (const uniqueId of groupUniques) {
      markets.push({
        chain: uniqueId._id.chain,
        protocol: uniqueId._id.protocol,
        address: uniqueId._id.address,
        token: uniqueId._id.token,
        type: uniqueId._id.type,
      });
    }

    await writeResponse(storages, request, response, HttpStatusCode.Ok, {
      error: null,
      result: markets,
    });
  });

  // query all lending market latest states
  router.get('/market/states', async (request: Request, response: Response) => {
    const documents: Array<any> = await storages.database.query({
      collection: EnvConfig.mongodb.collections.lendingMarketStates,
      query: {},
    });
    const states: Array<any> = [];
    for (const document of documents) {
      delete document._id;
      states.push(document);
    }

    await writeResponse(storages, request, response, HttpStatusCode.Ok, {
      error: null,
      result: states,
    });
  });

  // get all snapshots of a market
  router.get('/market/chain/:chain/address/:address/token/:token', async (request: Request, response: Response) => {
    const { chain, address, token } = request.params;
    const { page, order } = request.query;

    const documents: Array<any> = await storages.database.query({
      collection: EnvConfig.mongodb.collections.lendingMarketSnapshots,
      query: {
        chain,
        address: normalizeAddress(address),
        'token.address': normalizeAddress(token),
      },
      options: {
        limit: DefaultQueryDataLimit,
        skip: Number(page) * DefaultQueryDataLimit,
        order: { timestamp: order && order === 'oldest' ? 1 : -1 },
      },
    });
    const snapshots: Array<any> = [];
    for (const document of documents) {
      delete document._id;
      snapshots.push(document);
    }

    await writeResponse(storages, request, response, HttpStatusCode.Ok, {
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
