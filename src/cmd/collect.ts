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
    const services: ContextServices = await super.getServices();
    await services.database.connect(envConfig.mongodb.connectionUri, envConfig.mongodb.databaseName);
    const adapters = getProtocolAdapters(services);

    let protocols: Array<string>;
    if (argv.protocol !== '') {
      protocols = argv.protocol.split(',');
    } else {
      protocols = Object.keys(adapters);
    }

    do {
      for (const protocol of protocols) {
        if (adapters[protocol]) {
          await adapters[protocol].run({
            // run all chains
            lendingMarketCollector: {
              chain: argv.protocol !== '' ? undefined : argv.chain,
            },
          });
        }
      }

      if (argv.exit) {
        process.exit(0);
      } else {
        await sleep(argv.sleep ? Number(argv.sleep) : 300);
      }
    } while (!argv.exit);
  }

  public setOptions(yargs: any) {
    return yargs.option({
      // must give protocol ids to run
      protocol: {
        type: 'string',
        default: '',
        describe: 'A list of protocols in format: protocol_1,protocol_2,...protocol_n',
      },
      // chain options will be ignored if protocol option was given
      chain: {
        type: 'string',
        default: 'ethereum',
        describe: 'Collect all protocols data on given chain.',
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
