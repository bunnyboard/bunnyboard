import envConfig from '../configs/envConfig';
import { sleep } from '../lib/utils';
import getProtocolAdapters from '../modules/adapters';
import { ContextServices } from '../types/namespaces';
import { BasicCommand } from './basic';

export class GetlogCommand extends BasicCommand {
  public readonly name: string = 'getlog';
  public readonly describe: string = 'Get contracts raw logs';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const services: ContextServices = await super.getServices();
    await services.database.connect(envConfig.mongodb.connectionUri, envConfig.mongodb.databaseName);

    const adapters = getProtocolAdapters(services);

    do {
      for (const adapter of Object.values(adapters)) {
        await adapter.run({
          contractLogCollector: {
            chain: argv.chain,
          },
        });
      }

      await sleep(argv.sleep ? Number(argv.sleep) : 300);
    } while (true);
  }

  public setOptions(yargs: any) {
    return yargs.option({
      chain: {
        type: 'string',
        default: 'ethereum',
        requiresArg: true,
        describe: 'Get contract logs from given chain.',
      },
    });
  }
}
