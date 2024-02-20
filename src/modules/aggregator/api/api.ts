import { Router } from 'express';

import { IDatabaseService } from '../../../services/database/domains';
import { middleware } from './middleware';
import * as crossLendingDataRouter from './routes/crossLending';

export function getRouter(database: IDatabaseService): Router {
  const router = Router({ mergeParams: true });

  router.use('/', middleware);

  // get data from data aggregators
  router.use('/crossLending', crossLendingDataRouter.getRouter(database));

  return router;
}

export default getRouter;
