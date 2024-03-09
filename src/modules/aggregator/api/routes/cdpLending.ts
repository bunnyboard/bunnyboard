import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import { generateDataHashMD5 } from '../../../../lib/crypto';
import { normalizeAddress } from '../../../../lib/utils';
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

  // get list markets at given timestamp
  // if the timestamp was not given, return latest state
  router.get('/markets', async (request: Request, response: Response) => {
    const timestamp = request.query.timestamp ? Number(request.query.timestamp) : 0;

    const cacheKey = generateDataHashMD5(`crossLending-markets-${timestamp}`);
    const cacheData = await storages.memcache.getCachingData(cacheKey);

    if (cacheData) {
      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: cacheData,
      });
    } else {
      const aggregator = new CdpLendingDataAggregator(storages.database);
      const markets = await aggregator.getMarkets(timestamp);

      await storages.memcache.setCachingData(cacheKey, markets);

      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: markets,
      });
    }
  });

  // get a market detail
  router.get('/market/:protocol/:chain/:debtTokenAddress', async (request: Request, response: Response) => {
    const { chain, protocol, debtTokenAddress } = request.params;
    const tokenAddress = normalizeAddress(debtTokenAddress);

    const cacheKey = generateDataHashMD5(`crossLending-market-${protocol}-${chain}-${tokenAddress}`);
    const cacheData = await storages.memcache.getCachingData(cacheKey);

    if (cacheData) {
      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: cacheData,
      });
    } else {
      const aggregator = new CdpLendingDataAggregator(storages.database);
      const marketData = await aggregator.getMarket(protocol, chain, tokenAddress);

      await storages.memcache.setCachingData(cacheKey, marketData);

      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: marketData,
      });
    }
  });

  // get list collateral snapshots of given market
  router.get('/market/:protocol/:chain/:debtTokenAddress/collaterals', async (request: Request, response: Response) => {
    const { chain, protocol, debtTokenAddress } = request.params;
    const timestamp = request.query.timestamp ? Number(request.query.timestamp) : 0;
    const tokenAddress = normalizeAddress(debtTokenAddress);

    const cacheKey = generateDataHashMD5(`crossLending-collaterals-${protocol}-${chain}-${tokenAddress}-${timestamp}`);
    const cacheData = await storages.memcache.getCachingData(cacheKey);

    if (cacheData) {
      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: cacheData,
      });
    } else {
      const aggregator = new CdpLendingDataAggregator(storages.database);
      const marketData = await aggregator.getMarketCollaterals(protocol, chain, tokenAddress, timestamp);

      await storages.memcache.setCachingData(cacheKey, marketData);

      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: marketData,
      });
    }
  });

  return router;
}
