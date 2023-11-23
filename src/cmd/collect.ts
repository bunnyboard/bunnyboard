import EnvConfig from '../configs/envConfig';
import { sleep } from '../lib/utils';
import LendingCollector from '../modules/collector/lending';
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
    const lendingCollector = new LendingCollector(services);

    while (true) {
      await lendingCollector.run({
        chain: argv.chain === '' ? undefined : argv.chain,
        protocol: argv.protocol === '' ? undefined : argv.protocol,
      });

      if (argv.exit) {
        process.exit(0);
      }

      await sleep(argv.sleep ? Number(argv.sleep) : 300);
    }
  }

  public setOptions(yargs: any) {
    return yargs.option({
      metric: {
        type: 'string',
        default: 'lending',
        describe: 'The metric to collect, support: lending.',
      },
      chain: {
        type: 'string',
        default: '',
        describe: `Run collector on given chain, support: ${Object.keys(EnvConfig.blockchains).toString()}.`,
      },
      protocol: {
        type: 'string',
        default: '',
        describe: 'Run collector with given protocol.',
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
