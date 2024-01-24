import { sleep } from '../lib/utils';
import Collector from '../modules/collector/collector';
import { ContextServices, ContextStorages } from '../types/namespaces';
import { BasicCommand } from './basic';

export class CollectorCommand extends BasicCommand {
  public readonly name: string = 'collector';
  public readonly describe: string = 'Run collector services';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const services: ContextServices = await super.getServices();
    const storages: ContextStorages = await super.getStorages();

    const collector = new Collector(storages, services);

    do {
      await collector.run({
        chain: argv.chain !== '' ? argv.chain : undefined,
        protocol: argv.protocol !== '' ? argv.protocol : undefined,
        fromTime: argv.fromTime ? argv.fromTime : undefined,
        force: argv.force,
        service: argv.service === 'state' || argv.service === 'snapshot' ? argv.service : undefined,
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
      fromTime: {
        type: 'number',
        default: 0,
        describe: 'Collect snapshots data from given timestamp.',
      },
      force: {
        type: 'boolean',
        default: false,
        describe: 'Force collect data from given from block number.',
      },
      service: {
        type: 'string',
        default: 'all',
        describe: 'Run collector with given service: state, snapshot, or both.',
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
