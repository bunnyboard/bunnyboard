import { ProtocolConfigs } from '../configs';
import { getDateString, getTodayUTCTimestamp } from '../lib/utils';
import getProtocolAdapters from '../modules/adapters';
import { LendingMarketSnapshot } from '../types/domains/lending';
import { ContextServices } from '../types/namespaces';
import { BasicCommand } from './basic';

function printLendingMarketSnapshots(snapshots: Array<LendingMarketSnapshot>) {
  const prettyData = [];
  for (const snapshot of snapshots) {
    prettyData.push({
      chain: snapshot.chain,
      day: getDateString(snapshot.timestamp),
      token: snapshot.token.symbol,
      tokenPrice: snapshot.tokenPrice,
      totalDeposited: snapshot.totalDeposited,
      supplyRate: snapshot.supplyRate,
    });
  }
  console.table(prettyData);
}

export class RunCommand extends BasicCommand {
  public readonly name: string = 'run';
  public readonly describe: string = 'Run a adapter, mainly for testing';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const services: ContextServices = await super.getServices();

    const protocol = argv.protocol;
    const protocolConfig = ProtocolConfigs[protocol];
    const timestamp = getTodayUTCTimestamp();

    const adapters = getProtocolAdapters(services);
    if (protocolConfig && adapters[protocol]) {
      if (protocolConfig.lendingMarkets) {
        for (const config of protocolConfig.lendingMarkets) {
          const snapshots = await adapters[protocol].getLendingMarketSnapshots({
            config: config,
            timestamp: timestamp,
          });
          if (snapshots) {
            printLendingMarketSnapshots(snapshots);
          }
        }
      }
    }

    process.exit(0);
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
