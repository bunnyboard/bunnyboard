import dotenv from 'dotenv';
import yargs from 'yargs/yargs';

import { AdapterCommand } from './cmd/adapter';
import { CollectorCommand } from './cmd/collector';
import { DexscanCommand } from './cmd/dexscan';
import { GetTokenPriceCommand } from './cmd/getTokenPrice';
import { ServerCommand } from './cmd/server';
import { WorkerCommand } from './cmd/worker';

(async function () {
  dotenv.config();

  const collectorCommand = new CollectorCommand();
  const adapterCommand = new AdapterCommand();
  const workerCommand = new WorkerCommand();
  const serverCommand = new ServerCommand();
  const dexscanCommand = new DexscanCommand();
  const getTokenPriceCommand = new GetTokenPriceCommand();

  yargs(process.argv.slice(2))
    .scriptName('bunnyboard')
    .command(adapterCommand.name, adapterCommand.describe, adapterCommand.setOptions, adapterCommand.execute)
    .command(collectorCommand.name, collectorCommand.describe, collectorCommand.setOptions, collectorCommand.execute)
    .command(
      getTokenPriceCommand.name,
      getTokenPriceCommand.describe,
      getTokenPriceCommand.setOptions,
      getTokenPriceCommand.execute,
    )
    .command(workerCommand.name, workerCommand.describe, workerCommand.setOptions, workerCommand.execute)
    .command(serverCommand.name, serverCommand.describe, serverCommand.setOptions, serverCommand.execute)
    .command(dexscanCommand.name, dexscanCommand.describe, dexscanCommand.setOptions, dexscanCommand.execute)
    .help().argv;
})();
