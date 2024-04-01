import cors from 'cors';
import express from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import logger from '../lib/logger';
import { sleep } from '../lib/utils';
import getRouter from '../modules/aggregator/api/api';
import * as statusRouter from '../modules/aggregator/api/status';
import DataAggregatorWorker from '../modules/aggregator/worker';
import { BasicCommand } from './basic';

const WorkerInterval = 600; // 10 minutes

export class ServerCommand extends BasicCommand {
  public readonly name: string = 'server';
  public readonly describe: string = 'Run the restful api server';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const storages = await super.getStorages();

    const router = getRouter(storages);

    const service = argv.service;
    if (service === 'api') {
      const port = argv.port || process.env.PORT || '8080';

      const app = express();

      app.use(cors());
      app.use(express.json());

      // data endpoints
      app.use('/board', router);

      // system status endpoints
      app.use('/status', statusRouter.getRouter(storages));

      app.use('/', express.static(path.join('.', 'public')));

      const swaggerDocument = YAML.load('./docs/api/api-data-board.yml');
      app.use('/apiDocs/dataBoard', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

      app.listen(port, () => {
        logger.info('started the restful api server', {
          service: 'api',
          address: `0.0.0.0:${port}`,
        });
      });
    } else if (service === 'worker') {
      // run data worker
      const worker = new DataAggregatorWorker(storages.database);

      do {
        await worker.runUpdate();

        if (!argv.exit) {
          await sleep(Number(WorkerInterval));
        }
      } while (!argv.exit);

      process.exit(0);
    } else {
      console.log(`service '${service}' is not supported`);
    }
  }

  public setOptions(yargs: any) {
    return yargs.option({
      service: {
        type: 'string',
        default: 'api',
        describe:
          'Select a service to run api or worker. Run data api server with `api` options. Run data worker with `worker` options.',
      },
      port: {
        type: 'number',
        default: 0,
        describe: 'The port number to listen',
      },
      exit: {
        type: 'boolean',
        default: false,
        describe: 'Using this option to run service worker one time only, do not loop.',
      },
    });
  }
}
