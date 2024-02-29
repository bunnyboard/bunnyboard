import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import { generateDataHashMD5 } from '../../../../lib/crypto';
import { ContextStorages } from '../../../../types/namespaces';
import CrossLendingDataAggregator from '../../models/crossLending';
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
      const aggregator = new CrossLendingDataAggregator(storages.database);
      const overallData = await aggregator.getDataOverall();

      await storages.memcache.setCachingData(cacheKey, overallData);

      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: overallData,
      });
    }
  });

  // this query aims to help query a list of cross lending market data
  // at a given timestamp
  // a cross lending market includes a given protocol and chain
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
      const aggregator = new CrossLendingDataAggregator(storages.database);
      const markets = await aggregator.getMarkets(timestamp);

      await storages.memcache.setCachingData(cacheKey, markets);

      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: markets,
      });
    }
  });

  // this query aims to help query all data of a given cross lending market
  // a cross lending market includes a given protocol and chain
  router.get('/market/:protocol/:chain', async (request: Request, response: Response) => {
    const { protocol, chain } = request.params;

    const cacheKey = generateDataHashMD5(`crossLending-market-${protocol}-${chain}`);
    const cacheData = await storages.memcache.getCachingData(cacheKey);
    if (cacheData) {
      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: cacheData,
      });
    } else {
      const aggregator = new CrossLendingDataAggregator(storages.database);
      const market = await aggregator.getMarket(protocol, chain);

      await storages.memcache.setCachingData(cacheKey, market);

      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: market,
      });
    }
  });

  // this query aims to help query all snapshots of a given market add timestamp
  router.get('/reserves', async (request: Request, response: Response) => {
    const { protocol, chain, timestamp } = request.query;

    const cacheKey = generateDataHashMD5(`crossLending-reserves-${protocol}-${chain}-${timestamp}`);
    const cacheData = await storages.memcache.getCachingData(cacheKey);
    if (cacheData) {
      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: cacheData,
      });
    } else {
      const aggregator = new CrossLendingDataAggregator(storages.database);
      const reserves = await aggregator.getReserves(
        chain ? chain.toString() : null,
        protocol ? protocol.toString() : null,
        timestamp ? Number(timestamp) : 0,
      );

      await storages.memcache.setCachingData(cacheKey, reserves);

      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: reserves,
      });
    }
  });

  // this query aims to help query overall data of a given reserve
  router.get('/reserve/:protocol/:chain/:tokenAddress', async (request: Request, response: Response) => {
    const { protocol, chain, tokenAddress } = request.params;
    const { contract } = request.query;

    const cacheKey = generateDataHashMD5(`crossLending-reserves-${protocol}-${chain}-${contract}-${tokenAddress}`);
    const cacheData = await storages.memcache.getCachingData(cacheKey);
    if (cacheData) {
      await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: cacheData,
      });
    } else {
      const aggregator = new CrossLendingDataAggregator(storages.database);
      const reserve = await aggregator.getReserve({
        chain,
        protocol,
        tokenAddress,
        contract: contract ? contract.toString() : undefined,
      });

      if (reserve) {
        await storages.memcache.setCachingData(cacheKey, reserve);
        await writeResponse(storages.database, request, response, HttpStatusCode.Ok, {
          error: null,
          data: reserve,
        });
      } else {
        await writeResponse(storages.database, request, response, HttpStatusCode.NotFound, {
          error: 'reserve not found',
          data: null,
        });
      }
    }
  });

  return router;
}
