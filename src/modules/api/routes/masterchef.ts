import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import { DefaultQueryDataLimit } from '../../../configs';
import EnvConfig from '../../../configs/envConfig';
import { normalizeAddress } from '../../../lib/utils';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { writeResponse } from '../middleware';

export function getRouter(storages: ContextStorages, services: ContextServices): Router {
  const router = Router({ mergeParams: true });

  // query all available masterchef contracts and its pools
  router.get('/pool/list', async (request: Request, response: Response) => {
    // first, we get unique masterchef
    const collection = await storages.database.getCollection(EnvConfig.mongodb.collections.masterchefPoolSnapshots);

    const groupUniques = await collection
      .aggregate([
        {
          $group: {
            _id: { protocol: '$protocol', chain: '$chain', address: '$address', poolId: '$poolId', token: '$token' },
          },
        },
      ])
      .toArray();

    const pools: Array<any> = [];
    for (const uniqueId of groupUniques) {
      pools.push({
        chain: uniqueId._id.chain,
        protocol: uniqueId._id.protocol,
        address: uniqueId._id.address,
        poolId: uniqueId._id.poolId,
        token: uniqueId._id.token,
      });
    }

    await writeResponse(storages, request, response, HttpStatusCode.Ok, {
      error: null,
      result: pools,
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

  return router;
}
