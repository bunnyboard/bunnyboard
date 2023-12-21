import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import EnvConfig from '../../../configs/envConfig';
import { ContextServices } from '../../../types/namespaces';
import { writeResponse } from '../middleware';

export function getRouter(services: ContextServices): Router {
  const router = Router({ mergeParams: true });

  // query all available masterchef contracts and its pools
  router.get('/pool/latest', async (request: Request, response: Response) => {
    // first, we get unique masterchef
    const collection = await services.database.getCollection(EnvConfig.mongodb.collections.masterchefPoolSnapshots);

    const groupUniques = await collection
      .aggregate([
        { $group: { _id: { protocol: '$protocol', chain: '$chain', address: '$address', poolId: '$poolId' } } },
      ])
      .toArray();

    // chain:masterchefContractAddress
    const masterchefs: { [key: string]: any } = {};

    for (const uniqueId of groupUniques) {
      const latestSnapshot = await services.database.find({
        collection: EnvConfig.mongodb.collections.masterchefPoolSnapshots,
        query: {
          chain: uniqueId._id.chain,
          protocol: uniqueId._id.protocol,
          address: uniqueId._id.address,
          poolId: uniqueId._id.poolId,
        },
        options: {
          limit: 1,
          skip: 0,
          order: { timestamp: -1 },
        },
      });
      if (latestSnapshot) {
        const chefId = `${latestSnapshot.chain}:${latestSnapshot.address}`;
        if (!masterchefs[chefId]) {
          masterchefs[chefId] = {
            chain: latestSnapshot.chain,
            address: latestSnapshot.address,
            pools: [],
          };
        }

        delete latestSnapshot._id;
        masterchefs[chefId].pools.push(latestSnapshot);
      }
    }

    await writeResponse(services, request, response, HttpStatusCode.Ok, {
      error: null,
      result: Object.values(masterchefs),
    });
  });

  return router;
}
