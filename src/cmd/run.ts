import { ProtocolConfigs } from '../configs';
import { getTimestamp } from '../lib/utils';
import getProtocolAdapters from '../modules/adapters';
import { ContextServices } from '../types/namespaces';
import { BasicCommand } from './basic';

export class RunCommand extends BasicCommand {
  public readonly name: string = 'run';
  public readonly describe: string = 'Run a adapter, mainly for testing';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const services: ContextServices = await super.getServices();

    const protocol = argv.protocol;
    const chain = argv.chain;
    const activity = argv.activity;
    const timestamp = argv.timestamp ? Number(argv.timestamp) : getTimestamp();

    const protocolConfig = ProtocolConfigs[protocol];
    const adapters = getProtocolAdapters(services);
    if (protocolConfig && adapters[protocol]) {
      const protocolData: any = {
        protocol: protocol,
        lendingMarketSnapshots: [],
        lendingMarketActivities: [],
        masterchefPoolSnapshots: [],
        masterchefPoolActivities: [],
        perpetualMarketSnapshots: [],
        perpetualMarketActivities: [],
      };

      if (protocolConfig.lendingMarkets) {
        for (const config of protocolConfig.lendingMarkets.filter((item) => chain === '' || item.chain === chain)) {
          const result = await adapters[protocol].getLendingMarketSnapshots({
            config: config,
            timestamp: timestamp,
            collectActivities: activity,
          });
          protocolData.lendingMarketSnapshots = protocolData.lendingMarketSnapshots.concat(result.snapshots);
          protocolData.lendingMarketActivities = protocolData.lendingMarketActivities.concat(result.activities);
        }
      }

      if (protocolConfig.masterchefs) {
        for (const config of protocolConfig.masterchefs.filter((item) => chain === '' || item.chain === chain)) {
          const result = await adapters[protocol].getMasterchefSnapshots({
            config: config,
            timestamp: timestamp,
            collectActivities: activity,
          });
          protocolData.masterchefPoolSnapshots = protocolData.masterchefPoolSnapshots.concat(result.snapshots);
          protocolData.masterchefPoolActivities = protocolData.masterchefPoolActivities.concat(result.activities);
        }
      }

      if (protocolConfig.perpetualMarkets) {
        for (const config of protocolConfig.perpetualMarkets.filter((item) => chain === '' || item.chain === chain)) {
          const result = await adapters[protocol].getPerpetualSnapshots({
            config: config,
            timestamp: timestamp,
            collectActivities: activity,
          });
          protocolData.perpetualMarketSnapshots = protocolData.perpetualMarketSnapshots.concat(result.snapshots);
          protocolData.perpetualMarketActivities = protocolData.perpetualMarketActivities.concat(result.activities);
        }
      }

      console.log(JSON.stringify(protocolData));
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
      chain: {
        type: 'string',
        default: '',
        describe: 'Run adapter on given chain.',
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
    });
  }
}
