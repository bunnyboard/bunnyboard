import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import { DefaultQueryDataLimit } from '../../../configs';
import EnvConfig from '../../../configs/envConfig';
import { normalizeAddress } from '../../../lib/utils';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { writeResponse } from '../middleware';

export function getRouter(storages: ContextStorages, services: ContextServices): Router {
  const router = Router({ mergeParams: true });

  // query all masterchef pool latest states
  router.get('/pool/states', async (request: Request, response: Response) => {
    const documents: Array<any> = await storages.database.query({
      collection: EnvConfig.mongodb.collections.masterchefPoolStates,
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

  // query all snapshots of a given masterchef pool
  router.get('/pool/chain/:chain/address/:address/poolId/:poolId', async (request: Request, response: Response) => {
    const { chain, address, poolId } = request.params;
    const { page, order } = request.query;

    const documents: Array<any> = await storages.database.query({
      collection: EnvConfig.mongodb.collections.masterchefPoolSnapshots,
      query: {
        chain,
        address: normalizeAddress(address),
        poolId: Number(poolId),
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
        poolId: Number(poolId),
      },
      result: snapshots,
    });
  });

  // query masterchef activities
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
      collection: EnvConfig.mongodb.collections.masterchefPoolActivities,
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
