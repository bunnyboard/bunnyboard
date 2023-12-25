import { Router } from 'express';

import { ContextServices, ContextStorages } from '../../types/namespaces';
import { middleware } from './middleware';
import * as lendingRouter from './routes/lending';
import * as masterchefRouter from './routes/masterchef';

export function getRouter(storages: ContextStorages, services: ContextServices): Router {
  const router = Router({ mergeParams: true });

  router.use('/', middleware);

  // public
  router.use('/lending', lendingRouter.getRouter(storages, services));
  router.use('/masterchef', masterchefRouter.getRouter(storages, services));

  return router;
}

export default getRouter;
