import { sleep } from '../lib/utils';
import Collector from '../modules/collector/collector';
import { ContextServices, ContextStorages } from '../types/namespaces';
import { BasicCommand } from './basic';

const DefaultServiceSleepSeconds = 3600;

export class RunCommand extends BasicCommand {
  public readonly name: string = 'run';
  public readonly describe: string = 'Run collector services';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const services: ContextServices = await super.getServices();
    const storages: ContextStorages = await super.getStorages();

    let service = undefined;
    if (argv.service === 'state' || argv.service === 'snapshot') {
      service = argv.service;
    }

    const collector = new Collector(storages, services);
    do {
      await collector.run({
        metric: argv.metric !== '' ? argv.metric.split(',') : undefined,
        service: service,
        chains: argv.chain !== '' ? argv.chain.split(',') : undefined,
        protocols: argv.protocol !== '' ? argv.protocol.split(',') : undefined,
        fromTime: argv.fromTime ? argv.fromTime : undefined,
        force: argv.force,
      });

      if (argv.exit) {
        process.exit(0);
      } else {
        await sleep(argv.sleep ? Number(argv.sleep) : DefaultServiceSleepSeconds);
      }
    } while (!argv.exit);

    process.exit(0);
  }

  public setOptions(yargs: any) {
    return yargs.option({
      metric: {
        type: 'string',
        default: '',
        describe: 'Collect data from given list of data metric.',
      },
      service: {
        type: 'string',
        default: '',
        describe: 'Collect current data state or historical snapshots.',
      },
      chain: {
        type: 'string',
        default: '',
        describe:
          'Collect all protocols data on given list of chain seperated by comma, ex: --chain "ethereum,arbitrum".',
      },
      protocol: {
        type: 'string',
        default: '',
        describe:
          'Collect data of given protocol. You can pass a list of protocol seperated by comma, ex: --protocol "aavev3,uniswapv2".',
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

      exit: {
        type: 'boolean',
        default: false,
        describe: 'Do not run services as workers.',
      },
      sleep: {
        type: 'number',
        default: DefaultServiceSleepSeconds, // 60 minutes
        describe: 'Given amount of seconds to sleep after every sync round. Default is 60 minutes.',
      },
    });
  }
}
