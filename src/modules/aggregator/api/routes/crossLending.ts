import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import { getTodayUTCTimestamp } from '../../../../lib/utils';
import { IDatabaseService } from '../../../../services/database/domains';
import CrossLendingDataAggregator from '../../models/crossLending';
import { writeResponse } from '../middleware';

export function getRouter(database: IDatabaseService): Router {
  const router = Router({ mergeParams: true });

  // get overall data across all markets
  router.get('/overall', async (request: Request, response: Response) => {
    const aggregator = new CrossLendingDataAggregator(database);
    const overallData = await aggregator.getDataOverall();

    await writeResponse(database, request, response, HttpStatusCode.Ok, {
      error: null,
      data: overallData,
    });
  });

  // this query aims to help query a list of cross lending market data
  // at a given timestamp
  // a cross lending market includes a given protocol and chain
  router.get('/markets', async (request: Request, response: Response) => {
    let { timestamp = 0 } = request.query;

    timestamp = timestamp ? Number(timestamp) : getTodayUTCTimestamp();
    if (timestamp === 0) {
      await writeResponse(database, request, response, HttpStatusCode.BadRequest, {
        error: 'invalid given timestamp',
        data: [],
      });
    } else {
      const aggregator = new CrossLendingDataAggregator(database);

      const markets = await aggregator.getMarkets(timestamp);
      await writeResponse(database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: markets,
      });
    }
  });

  // this query aims to help query all data of a given cross lending market
  // a cross lending market includes a given protocol and chain
  router.get('/market/:protocol/:chain', async (request: Request, response: Response) => {
    const { protocol, chain } = request.params;

    const aggregator = new CrossLendingDataAggregator(database);
    const market = await aggregator.getMarket(protocol, chain);

    await writeResponse(database, request, response, HttpStatusCode.Ok, {
      error: null,
      data: market,
    });
  });

  return router;
}
