import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import { DefaultQueryDataLimit } from '../../../configs';
import EnvConfig from '../../../configs/envConfig';
import { normalizeAddress } from '../../../lib/utils';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { writeResponse } from '../middleware';

export function getRouter(storages: ContextStorages, services: ContextServices): Router {
  const router = Router({ mergeParams: true });

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

  // query lending activities
  router.post('/activity/query', async (request: Request, response: Response) => {
    const { params, filters } = request.body;

    const query: any = {};
    if (params) {
      const { chain, protocol, address, token, user, action } = params;
      if (chain) {
        query.chain = chain;
      }
      if (protocol) {
        query.protocol = protocol;
      }
      if (address) {
        query.address = address;
      }
      if (token) {
        query['token.address'] = token;
      }
      if (user) {
        query.user = user;
      }
      if (action) {
        query.action = action;
      }
    }

    const options: any = {};
    options.limit = DefaultQueryDataLimit;

    // return 100 activities per page
    if (filters) {
      if (filters.page) {
        options.skip = DefaultQueryDataLimit * Number(filters.page);
      }
      if (filters.order) {
        options.order = { timestamp: filters.order === 'oldest' ? 1 : -1 };
      }
    }

    const documents: Array<any> = await storages.database.query({
      collection: EnvConfig.mongodb.collections.lendingMarketActivities,
      query: query,
      options: options,
    });
    const activities: Array<any> = [];
    for (const document of documents) {
      delete document._id;
      activities.push(document);
    }

    await writeResponse(storages, request, response, HttpStatusCode.Ok, {
      error: null,
      params: query,
      filters: filters,
      result: activities,
    });
  });

  return router;
}
