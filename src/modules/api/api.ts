import { Router } from 'express';

import { ContextServices } from '../../types/namespaces';
import { middleware } from './middleware';
import * as contractRouter from './routes/contract';

export function getRouter(services: ContextServices): Router {
  const router = Router({ mergeParams: true });

  router.use('/', middleware);

  // public
  router.use('/contract', contractRouter.getRouter(services));

  return router;
}

export default getRouter;
