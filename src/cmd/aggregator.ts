import { sleep } from '../lib/utils';
import DataAggregatorWorker from '../modules/aggregator/worker';
import { BasicCommand } from './basic';

export class AggregatorCommand extends BasicCommand {
  public readonly name: string = 'aggregator';
  public readonly describe: string = 'Run data aggregate data worker service';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const storages = await super.getStorages();

    const worker = new DataAggregatorWorker(storages.database);

    while (true) {
      await worker.runUpdate();

      await sleep(Number(argv.interval));
    }
  }

  public setOptions(yargs: any) {
    return yargs.option({
      interval: {
        type: 'number',
        default: 300,
        describe: 'Number of seconds the worker going to sleep.',
      },
    });
  }
}
