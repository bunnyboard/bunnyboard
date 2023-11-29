import { ProtocolConfigs } from '../configs';
import EnvConfig from '../configs/envConfig';
import envConfig from '../configs/envConfig';
import { compareAddress, sleep } from '../lib/utils';
import LendingCollector from '../modules/collector/lending';
import { LendingMarketConfig } from '../types/configs';
import { ContextServices } from '../types/namespaces';
import { BasicCommand } from './basic';

const MetricLending: string = 'lending';

export class CollectCommand extends BasicCommand {
  public readonly name: string = 'collect';
  public readonly describe: string = 'Run metrics collector service';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const services: ContextServices = await super.getServices();

    const metric = argv.metric ? argv.metric : null;
    const chain = argv.chain === '' ? null : argv.chain;
    const protocol = argv.protocol === '' ? null : argv.protocol;

    if (metric === MetricLending) {
      const marketArgv = argv.market === '' ? null : argv.market;

      let markets: Array<LendingMarketConfig> = [];
      for (const protocolConfig of Object.values(ProtocolConfigs)) {
        if (protocolConfig.lendingMarkets) {
          markets = markets.concat(protocolConfig.lendingMarkets);
        }
      }

      if (chain) {
        markets = markets.filter((market) => market.chain === chain);
      }
      if (protocol) {
        markets = markets.filter((market) => market.protocol === protocol);
      }
      if (marketArgv) {
        markets = markets.filter((market) => compareAddress(market.address, marketArgv));
      }

      if (markets.length > 0) {
        // connect database only when we got validated configs
        await services.database.connect(envConfig.mongodb.connectionUri, envConfig.mongodb.databaseName);

        // run collector
        const lendingCollector = new LendingCollector(services, markets);

        do {
          await lendingCollector.run({});

          if (argv.exit) {
            process.exit(0);
          } else {
            await sleep(argv.sleep ? Number(argv.sleep) : 300);
          }
        } while (!argv.exit);
      }
    }

    process.exit(0);
  }

  public setOptions(yargs: any) {
    return yargs.option({
      metric: {
        type: 'string',
        default: MetricLending,
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

      // this option will be used with metric is "lending" only
      market: {
        type: 'string',
        default: '',
        describe: 'Run collector with given lending market contract address only.',
      },
    });
  }
}
