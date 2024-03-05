import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import { generateDataHashMD5 } from '../../../../lib/crypto';
import { ContextStorages } from '../../../../types/namespaces';
import CdpLendingDataAggregator from '../../models/cdpLending';
import { writeResponse } from '../middleware';

export function getRouter(storages: ContextStorages): Router {
  const router = Router({ mergeParams: true });

  // get overall data across all markets
  router.get('/overall', async (request: Request, response: Response) => {
    const cacheKey = generateDataHashMD5(`crossLending-overall`);
    const cacheData = await storages.memcache.getCachingData(cacheKey);

    if (cacheData) {
      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: cacheData,
      });
    } else {
      const aggregator = new CdpLendingDataAggregator(storages.database);
      const overallData = await aggregator.getDataOverall();

      await storages.memcache.setCachingData(cacheKey, overallData);

      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: overallData,
      });
    }
  });

  return router;
}
