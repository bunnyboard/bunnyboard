import { Router } from 'express';

import { IDatabaseService } from '../../../services/database/domains';
import { middleware } from './middleware';
import * as aggregateRouter from './routes/aggregate';
import * as snapshotRouter from './routes/snapshot';

export function getRouter(database: IDatabaseService): Router {
  const router = Router({ mergeParams: true });

  router.use('/', middleware);

  // get raw data were collected by collectors
  router.use('/rawdata/snapshot', snapshotRouter.getRouter(database));

  // get data were aggregated by data worker
  router.use('/aggregate', aggregateRouter.getRouter(database));

  return router;
}

export default getRouter;
