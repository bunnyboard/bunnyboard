import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import EnvConfig from '../../../configs/envConfig';
import { normalizeAddress } from '../../../lib/utils';
import { ContextServices } from '../../../types/namespaces';
import { writeResponse } from '../middleware';

export function getRouter(services: ContextServices): Router {
  const router = Router({ mergeParams: true });

  router.get('/rawlogs/chain/:chain/address/:address', async (request: Request, response: Response) => {
    const { chain, address } = request.params;
    const documents = await services.database.query({
      collection: EnvConfig.mongodb.collections.contractRawlogs,
      query: {
        chain: chain,
        address: normalizeAddress(address),
      },
      options: {
        skip: 0,
        limit: 100,
        order: { blockNumber: -1 },
      },
    });
    const returnLogs: Array<any> = [];
    for (const document of documents) {
      delete document._id;
      returnLogs.push(document);
    }

    await writeResponse(services, request, response, HttpStatusCode.Ok, {
      error: null,
      logs: returnLogs,
    });
  });

  router.get('/rawlogs/chain/:chain/protocol/:protocol', async (request: Request, response: Response) => {
    const { chain, protocol } = request.params;
    const documents = await services.database.query({
      collection: EnvConfig.mongodb.collections.contractRawlogs,
      query: {
        chain: chain,
        protocol: protocol,
      },
      options: {
        skip: 0,
        limit: 100,
        order: { blockNumber: -1 },
      },
    });
    const returnLogs: Array<any> = [];
    for (const document of documents) {
      delete document._id;
      returnLogs.push(document);
    }

    await writeResponse(services, request, response, HttpStatusCode.Ok, {
      error: null,
      logs: returnLogs,
    });
  });

  return router;
}
