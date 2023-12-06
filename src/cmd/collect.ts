import { ProtocolConfigs } from '../configs';
import envConfig from '../configs/envConfig';
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
    const protocol = argv.protocol === '' ? null : argv.protocol;

    if (!protocol) {
      process.exit(0);
    }

    const services: ContextServices = await super.getServices();
    const adapters = getProtocolAdapters(services);
    if (!adapters[protocol] || !ProtocolConfigs[protocol]) {
      process.exit(0);
    }

    // connect database only when we got validated configs
    await services.database.connect(envConfig.mongodb.connectionUri, envConfig.mongodb.databaseName);

    do {
      await adapters[protocol].run({});

      if (argv.exit) {
        process.exit(0);
      } else {
        await sleep(argv.sleep ? Number(argv.sleep) : 300);
      }
    } while (!argv.exit);

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
