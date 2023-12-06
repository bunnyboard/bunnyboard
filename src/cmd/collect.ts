import envConfig from '../configs/envConfig';
import logger from '../lib/logger';
import { sleep } from '../lib/utils';
import getProtocolAdapters from '../modules/adapters';
import { ContextServices } from '../types/namespaces';
import { BasicCommand } from './basic';

export class CollectCommand extends BasicCommand {
  public readonly name: string = 'collect';
  public readonly describe: string = 'Run metrics collector service';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const protocolOptions = argv.protocol === '' ? null : argv.protocol;

    if (!protocolOptions) {
      process.exit(0);
    }

    const protocols: Array<string> = protocolOptions.split(',');

    if (protocols.length > 0) {
      const services: ContextServices = await super.getServices();
      // connect database only when we got validated configs
      await services.database.connect(envConfig.mongodb.connectionUri, envConfig.mongodb.databaseName);

      const adapters = getProtocolAdapters(services);

      logger.info(`start to run adapters`, {
        service: 'command',
        protocols: protocols.toString(),
      });

      do {
        for (const protocol of protocols) {
          if (adapters[protocol]) {
            await adapters[protocol].run({});
          }
        }

        if (argv.exit) {
          process.exit(0);
        } else {
          await sleep(argv.sleep ? Number(argv.sleep) : 300);
        }
      } while (!argv.exit);
    }

    process.exit(0);
  }

  public setOptions(yargs: any) {
    return yargs.option({
      // must give a protocol id to run
      protocol: {
        type: 'string',
        default: '',
        requiresArg: true,
        describe: 'A list of protocols in format: protocol_1,protocol_2,...protocol_n',
      },
      exit: {
        type: 'boolean',
        default: false,
        describe: 'Do not run services as workers.',
      },
      sleep: {
        type: 'number',
        default: 300, // 5 minutes
        describe: 'Given amount of seconds to sleep after every sync round. Default is 5 minutes.',
      },
    });
  }
}
