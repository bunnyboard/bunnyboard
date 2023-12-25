import { ProtocolConfigs } from '../configs';
import { getDateString, getTodayUTCTimestamp } from '../lib/utils';
import getProtocolAdapters from '../modules/adapters';
import { ContextServices } from '../types/namespaces';
import { BasicCommand } from './basic';

async function printOutput(protocolData: any, output: string) {
  if (output === 'json') {
    console.log(JSON.stringify(protocolData));
  } else {
    if (protocolData.lendingMarketSnapshots) {
      const prettyData = [];
      for (const snapshot of protocolData.lendingMarketSnapshots) {
        prettyData.push({
          chain: snapshot.chain,
          day: getDateString(snapshot.timestamp),
          token: snapshot.token.symbol,
          tokenPrice: snapshot.tokenPrice,
          totalDeposited: snapshot.totalDeposited,
          supplyRate: snapshot.supplyRate,
          borrowRate: snapshot.borrowRate,
        });
      }
      console.log('');
      console.log('Lending Market Snapshots');
      console.table(prettyData);
    }
  }
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
    const activity = argv.activity;
    const timestamp = argv.timestamp ? Number(argv.timestamp) : getTodayUTCTimestamp();
    const output = argv.output; // console, json, default: console

    const protocolConfig = ProtocolConfigs[protocol];
    const adapters = getProtocolAdapters(services);
    if (protocolConfig && adapters[protocol]) {
      const protocolData: any = {
        protocol: protocol,
      };

      if (protocolConfig.lendingMarkets) {
        for (const config of protocolConfig.lendingMarkets) {
          const snapshots = await adapters[protocol].getLendingMarketSnapshots({
            config: config,
            timestamp: timestamp,
          });
          if (snapshots) {
            protocolData.lendingMarketSnapshots = snapshots;
          }

          if (activity) {
            protocolData.lendingMarketActivities = await adapters[protocol].getLendingMarketActivities({
              config: config,
              timestamp: timestamp,
            });
          }
        }
      }

      if (protocolConfig.masterchefs) {
        for (const config of protocolConfig.masterchefs) {
          const snapshots = await adapters[protocol].getMasterchefSnapshots({
            config: config,
            timestamp: timestamp,
          });
          if (snapshots) {
            protocolData.masterchefPoolSnapshots = snapshots;
          }

          if (activity) {
            protocolData.masterchefPoolActivities = await adapters[protocol].getMasterchefActivities({
              config: config,
              timestamp: timestamp,
            });
          }
        }
      }

      await printOutput(protocolData, output);
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
      timestamp: {
        type: 'number',
        default: 0,
        describe: 'Collect data at given timestamp, default: current time.',
      },
      activity: {
        type: 'boolean',
        default: false,
        describe: 'Request to collect protocol activities, default: false',
      },
      output: {
        type: 'string',
        default: 'console',
        describe: 'Output result in given format: console, json, default is console.',
      },
    });
  }
}
