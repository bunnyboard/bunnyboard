import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import { generateDataHashMD5 } from '../../../../lib/crypto';
import { ContextStorages } from '../../../../types/namespaces';
import TokenBoardDataAggregator from '../../models/tokenBoard';
import { writeResponse } from '../middleware';

export function getRouter(storages: ContextStorages): Router {
  const router = Router({ mergeParams: true });

  // get all available tokens
  router.get('/erc20/tokenlist', async (request: Request, response: Response) => {
    const cacheKey = generateDataHashMD5('tokenboard-erc20-tokenlist');
    const cacheData = await storages.memcache.getCachingData(cacheKey);

    if (cacheData) {
      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: cacheData,
      });
    } else {
      const aggregator = new TokenBoardDataAggregator(storages.database);
      const tokens = await aggregator.getTokenBoardErc20List();

      await storages.memcache.setCachingData(cacheKey, tokens);

      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: tokens,
      });
    }
  });

  // get overall data across all markets
  router.get('/erc20/:chain/:address/overall', async (request: Request, response: Response) => {
    const chain = request.params.chain.toLowerCase();
    const address = request.params.address.toLowerCase();

    const cacheKey = generateDataHashMD5(`tokenboard-erc20-${chain}-${address}-overall`);
    const cacheData = await storages.memcache.getCachingData(cacheKey);

    if (cacheData) {
      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: cacheData,
      });
    } else {
      const aggregator = new TokenBoardDataAggregator(storages.database);
      const tokenErc20OverallData = await aggregator.getTokenBoardErc20DataOverall(chain, address);

      await storages.memcache.setCachingData(cacheKey, tokenErc20OverallData);

      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: tokenErc20OverallData,
      });
    }
  });

  return router;
}
