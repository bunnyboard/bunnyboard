import { sleep } from '../lib/utils';
import DexscanCollector from '../modules/collector/dexscan';
import { ContextServices, ContextStorages } from '../types/namespaces';
import { BasicCommand } from './basic';

export class DexscanCommand extends BasicCommand {
  public readonly name: string = 'dexscan';
  public readonly describe: string = 'Run dexscan services';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const services: ContextServices = await super.getServices();
    const storages: ContextStorages = await super.getStorages();

    const dexscan = new DexscanCollector(storages, services);

    do {
      await dexscan.run({
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
      chain: {
        type: 'string',
        default: '',
        describe: 'Collect all protocols data on given chain.',
      },
      protocol: {
        type: 'string',
        default: '',
        describe: 'Collect data of given protocol.',
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
