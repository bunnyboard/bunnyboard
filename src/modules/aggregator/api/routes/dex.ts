import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import { generateDataHashMD5 } from '../../../../lib/crypto';
import { ContextStorages } from '../../../../types/namespaces';
import DexDataAggregator from '../../models/dex';
import { writeResponse } from '../middleware';

export function getRouter(storages: ContextStorages): Router {
  const router = Router({ mergeParams: true });

  // get overall data across all markets
  router.get('/overall', async (request: Request, response: Response) => {
    const cacheKey = generateDataHashMD5(`dex-overall`);
    const cacheData = await storages.memcache.getCachingData(cacheKey);

    if (cacheData) {
      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: cacheData,
      });
    } else {
      const aggregator = new DexDataAggregator(storages.database);
      const overallData = await aggregator.getDataOverall();

      await storages.memcache.setCachingData(cacheKey, overallData);

      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: overallData,
      });
    }
  });

  // get snapshot data
  router.get('/snapshot/:protocol/:chain', async (request: Request, response: Response) => {
    const chain = request.params.chain.toLowerCase();
    const protocol = request.params.protocol.toLowerCase();
    const timestamp = request.query.timestamp ? Number(request.query.timestamp) : 0;

    const cacheKey = generateDataHashMD5(`dex-snapshot-${protocol}-${chain}-${timestamp}`);
    const cacheData = await storages.memcache.getCachingData(cacheKey);

    if (cacheData) {
      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: cacheData,
      });
    } else {
      const aggregator = new DexDataAggregator(storages.database);
      const snapshot = await aggregator.getDexDataSnapshot(chain, protocol, timestamp);

      await storages.memcache.setCachingData(cacheKey, snapshot);

      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: snapshot,
      });
    }
  });

  return router;
}
