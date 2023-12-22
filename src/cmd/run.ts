import envConfig from '../configs/envConfig';
import { sleep } from '../lib/utils';
import ProtocolCollector from '../modules/collector/collector';
import { ContextServices } from '../types/namespaces';
import { BasicCommand } from './basic';

export class RunCommand extends BasicCommand {
  public readonly name: string = 'run';
  public readonly describe: string = 'Run a adapter, mainly for testing';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const services: ContextServices = await super.getServices();
    await services.database.connect(envConfig.mongodb.connectionUri, envConfig.mongodb.databaseName);
    const collector = new ProtocolCollector(services);

    do {
      await collector.run({
        chain: argv.chain !== '' ? argv.chain : undefined,
        protocol: argv.protocol !== '' ? argv.protocol : undefined,
      });

      if (argv.exit) {
        process.exit(0);
      } else {
        await sleep(argv.sleep ? Number(argv.sleep) : 300);
      }
    } while (!argv.exit);
  }

  public setOptions(yargs: any) {
    return yargs.option({
      protocol: {
        type: 'string',
        default: '',
        describe: 'Run adapter with given protocol.',
      },
    });
  }
}
