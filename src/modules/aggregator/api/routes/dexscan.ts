import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import { generateDataHashMD5 } from '../../../../lib/crypto';
import { ContextStorages } from '../../../../types/namespaces';
import DexscanDataAggregator from '../../models/dexscan';
import { writeResponse } from '../middleware';

export function getRouter(storages: ContextStorages): Router {
  const router = Router({ mergeParams: true });

  // get all available liquidity for token
  router.get('/liquidity/token/:chain/:address', async (request: Request, response: Response) => {
    const chain = request.params.chain.toLowerCase();
    const address = request.params.address.toLowerCase();

    const cacheKey = generateDataHashMD5(`dexscan-liquidity-token-${chain}-${address}`);
    const cacheData = await storages.memcache.getCachingData(cacheKey);

    if (cacheData) {
      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: cacheData,
      });
    } else {
      const aggregator = new DexscanDataAggregator(storages.database);
      const snapshots = await aggregator.getLiquidityTokenSnapshots(chain, address);

      await storages.memcache.setCachingData(cacheKey, snapshots);

      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: snapshots,
      });
    }
  });

  // get all available liquidity pools for token
  router.get('/liquidity/token/:chain/:address/pools', async (request: Request, response: Response) => {
    const chain = request.params.chain.toLowerCase();
    const address = request.params.address.toLowerCase();

    const cacheKey = generateDataHashMD5(`dexscan-liquidity-token-${chain}-${address}-pools`);
    const cacheData = await storages.memcache.getCachingData(cacheKey);

    if (cacheData) {
      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: cacheData,
      });
    } else {
      const aggregator = new DexscanDataAggregator(storages.database);
      const snapshots = await aggregator.getLiquidityPoolSnapshots(chain, address);

      await storages.memcache.setCachingData(cacheKey, snapshots);

      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: snapshots,
      });
    }
  });

  return router;
}
