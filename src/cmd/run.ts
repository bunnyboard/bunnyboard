import { sleep } from '../lib/utils';
import DexscanCollector from '../modules/collector/dexscan';
import ProtocolCollector from '../modules/collector/protocol';
import TokenBoardCollector from '../modules/collector/tokenBoard';
import { ContextServices, ContextStorages } from '../types/namespaces';
import { BasicCommand } from './basic';

export class RunCommand extends BasicCommand {
  public readonly name: string = 'run';
  public readonly describe: string = 'Run collector services';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const services: ContextServices = await super.getServices();
    const storages: ContextStorages = await super.getStorages();

    switch (argv.service) {
      case 'adapter': {
        const collector = new ProtocolCollector(storages, services);
        do {
          await collector.run({
            metric: argv.metric !== '' ? argv.metric : undefined,
            chain: argv.chain !== '' ? argv.chain : undefined,
            protocols: argv.protocol !== '' ? argv.protocol.split(',') : undefined,
            fromTime: argv.fromTime ? argv.fromTime : undefined,
            force: argv.force,
          });

          if (argv.exit) {
            process.exit(0);
          } else {
            await sleep(argv.sleep ? Number(argv.sleep) : 300);
          }
        } while (!argv.exit);
        break;
      }
      case 'tokenBoard': {
        const tokenBoardCollector = new TokenBoardCollector(storages, services);

        do {
          await tokenBoardCollector.run({
            metric: argv.metric !== '' ? argv.metric : undefined,
            chain: argv.chain !== '' ? argv.chain : undefined,
            protocols: argv.protocol !== '' ? argv.protocol.split(',') : undefined,
            fromTime: argv.fromTime ? argv.fromTime : undefined,
            force: argv.force,
          });

          if (argv.exit) {
            process.exit(0);
          } else {
            await sleep(argv.sleep ? Number(argv.sleep) : 300);
          }
        } while (!argv.exit);

        break;
      }
      case 'dexscan': {
        const dexscan = new DexscanCollector(storages, services);

        do {
          await dexscan.run({
            chain: argv.chain !== '' ? argv.chain : undefined,
            protocols: argv.protocol !== '' ? argv.protocol.split(',') : undefined,
          });

          if (argv.exit) {
            process.exit(0);
          } else {
            await sleep(argv.sleep ? Number(argv.sleep) : 300);
          }
        } while (!argv.exit);

        break;
      }
    }

    process.exit(0);
  }

  public setOptions(yargs: any) {
    return yargs.option({
      service: {
        type: 'string',
        default: 'adapter',
        describe: 'Run collector with given service: adapter, dexscan, tokenBoard',
      },
      metric: {
        type: 'string',
        default: '',
        describe: 'Collect data from given data metric.',
      },
      chain: {
        type: 'string',
        default: '',
        describe: 'Collect all protocols data on given chain.',
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
        default: 300, // 5 minutes
        describe: 'Given amount of seconds to sleep after every sync round. Default is 5 minutes.',
      },
    });
  }
}
