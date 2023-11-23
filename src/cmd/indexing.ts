import EnvConfig from '../configs/envConfig';
import { normalizeAddress, sleep } from '../lib/utils';
import ContractIndexing from '../modules/indexing/contract';
import { ContextServices } from '../types/namespaces';
import { BasicCommand } from './basic';

export class IndexCommand extends BasicCommand {
  public readonly name: string = 'index';
  public readonly describe: string = 'Run contract logs indexing service';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const services: ContextServices = await super.getServices();
    const indexer = new ContractIndexing(services);

    while (true) {
      await indexer.run({
        chain: argv.chain,
        address: argv.address && argv.address !== '' ? normalizeAddress(argv.address) : undefined,
      });

      if (argv.exit) {
        process.exit(0);
      }

      await sleep(argv.sleep ? Number(argv.sleep) : 300);
    }
  }

  public setOptions(yargs: any) {
    return yargs.option({
      chain: {
        type: 'string',
        default: 'ethereum',
        describe: `The blockchain name to index, support: ${Object.keys(EnvConfig.blockchains).toString()}.`,
      },
      address: {
        type: 'string',
        default: '',
        describe: `Index only given contract address.`,
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
