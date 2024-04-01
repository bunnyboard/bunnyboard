import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import EnvConfig from '../../../configs/envConfig';
import { getTimestamp } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { ContextStorages } from '../../../types/namespaces';

interface SystemStatusResponse {
  database: string;
  blockchains: {
    [key: string]: {
      getLatestBlockNumber: string;
      getBlockNumberAtTimestamp: string;
    };
  };
}

export function getRouter(storages: ContextStorages): Router {
  const router = Router({ mergeParams: true });

  // get overall status of data system
  router.get('/', async (request: Request, response: Response) => {
    const status: SystemStatusResponse = {
      database: 'unknown',
      blockchains: {},
    };

    let httpStatus = HttpStatusCode.Ok;

    // check database status
    const database = await storages.database.getDatabase();
    if (database) {
      const result = await database.command({ ping: 1 });
      if (result.ok === 1) {
        status.database = 'ok';
      } else {
        httpStatus = HttpStatusCode.InternalServerError;
        status.database = 'can not ping to database';
      }
    } else {
      httpStatus = HttpStatusCode.InternalServerError;
      status.database = 'can not connect to database';
    }

    // check blockchain connections
    const blockchain = new BlockchainService();
    for (const chain of Object.keys(EnvConfig.blockchains)) {
      status.blockchains[chain] = {
        getLatestBlockNumber: 'ok',
        getBlockNumberAtTimestamp: 'ok',
      };

      const client = blockchain.getPublicClient(chain);
      try {
        const latestBlock = await client.getBlockNumber();
        if (Number(latestBlock) <= 0) {
          httpStatus = HttpStatusCode.InternalServerError;
          status.blockchains[chain].getLatestBlockNumber = `get latest block number got ${Number(latestBlock)}`;
        }
      } catch (e: any) {
        httpStatus = HttpStatusCode.InternalServerError;
        status.blockchains[chain].getLatestBlockNumber = e.message;
      }

      const timestamp = getTimestamp();
      const blockNumber = await blockchain.getBlockNumberAtTimestamp(chain, timestamp);
      if (!blockNumber) {
        httpStatus = HttpStatusCode.InternalServerError;
        status.blockchains[chain].getBlockNumberAtTimestamp =
          `get block number at timestamp ${timestamp} got ${blockNumber}`;
      }
    }

    response.status(httpStatus).json(status);
  });

  return router;
}
