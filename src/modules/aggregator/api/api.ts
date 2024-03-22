import { Router } from 'express';

import { ContextStorages } from '../../../types/namespaces';
import { middleware } from './middleware';
import * as cdpLendingDataRouter from './routes/cdpLending';
import * as crossLendingDataRouter from './routes/crossLending';
import * as tokenBoardDataRouter from './routes/tokenBoard';

export function getRouter(storages: ContextStorages): Router {
  const router = Router({ mergeParams: true });

  router.use('/', middleware);

  // get data from data aggregators
  router.use('/crossLending', crossLendingDataRouter.getRouter(storages));
  router.use('/cdpLending', cdpLendingDataRouter.getRouter(storages));
  router.use('/tokenBoard', tokenBoardDataRouter.getRouter(storages));

  return router;
}

export default getRouter;
