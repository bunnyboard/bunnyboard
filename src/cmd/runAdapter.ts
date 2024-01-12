import { ProtocolConfigs } from '../configs';
import { getTimestamp } from '../lib/utils';
import getProtocolAdapters from '../modules/adapters';
import { ContextServices } from '../types/namespaces';
import { BasicCommand } from './basic';

export class RunAdapterCommand extends BasicCommand {
  public readonly name: string = 'runAdapter';
  public readonly describe: string = 'Run adapter and print data metrics';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const services: ContextServices = await super.getServices();

    const protocol = argv.protocol;
    const timestamp = argv.timestamp > 0 ? argv.timestamp : getTimestamp();
    const adapters = getProtocolAdapters(services);

    let data: Array<any> = [];
    if (ProtocolConfigs[protocol] && adapters[protocol]) {
      for (const config of ProtocolConfigs[protocol].configs) {
        if (
          (argv.protocol === '' || config.protocol === argv.protocol) &&
          (argv.chain === '' || config.chain === argv.chain)
        ) {
          data = data.concat(
            await adapters[protocol].getStateData({
              config: config,
              timestamp: timestamp,
            }),
          );
        }
      }

      console.log(JSON.stringify(data));
    } else {
      console.log(`Adapter was not found for protocol ${protocol}`);
    }

    process.exit(0);
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
      timestamp: {
        type: 'number',
        default: 0,
        describe: 'Collect data at given timestamp.',
      },
    });
  }
}
