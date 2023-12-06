import cors from 'cors';
import express from 'express';
import path from 'path';

import envConfig from '../configs/envConfig';
import logger from '../lib/logger';
import getRouter from '../modules/api/api';
import { ContextServices } from '../types/namespaces';
import { BasicCommand } from './basic';

export class ServerCommand extends BasicCommand {
  public readonly name: string = 'server';
  public readonly describe: string = 'Run the restful api server';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    // connect database
    const services: ContextServices = await super.getServices();
    await services.database.connect(envConfig.mongodb.connectionUri, envConfig.mongodb.databaseName);

    const router = getRouter(services);

    const port = argv.port || process.env.PORT || '8080';

    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use('/magicbunny', router);

    app.use('/', express.static(path.join('.', 'public')));

    app.listen(port, () => {
      logger.info('started the restful api server', {
        service: 'api',
        address: `0.0.0.0:${port}`,
      });
    });
  }

  public setOptions(yargs: any) {
    return yargs.option({
      port: {
        type: 'number',
        default: 0,
        describe: 'The port number to listen',
      },
    });
  }
}
