import { HttpStatusCode } from 'axios';
import { Request, Response, Router } from 'express';

import EnvConfig from '../../../../configs/envConfig';
import { IDatabaseService } from '../../../../services/database/domains';
import { writeResponse } from '../middleware';

export function getRouter(database: IDatabaseService): Router {
  const router = Router({ mergeParams: true });

  router.get('/query/:name', async (request: Request, response: Response) => {
    const { name } = request.params;

    const document = await database.find({
      collection: EnvConfig.mongodb.collections.aggregates,
      query: {
        name: name,
      },
    });

    if (document) {
      delete document._id;
      await writeResponse(database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: document,
      });
    } else {
      await writeResponse(database, request, response, HttpStatusCode.Ok, {
        error: null,
        data: null,
      });
    }
  });

  return router;
}
