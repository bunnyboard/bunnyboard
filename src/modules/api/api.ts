import { Router } from 'express';

import { ContextServices } from '../../types/namespaces';
import { middleware } from './middleware';
import * as lendingRouter from './routes/lending';
import * as masterchefRouter from './routes/masterchef';

export function getRouter(services: ContextServices): Router {
  const router = Router({ mergeParams: true });

  router.use('/', middleware);

  // public
  router.use('/lending', lendingRouter.getRouter(services));
  router.use('/masterchef', masterchefRouter.getRouter(services));

  return router;
}

export default getRouter;
