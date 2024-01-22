import dotenv from 'dotenv';
import yargs from 'yargs/yargs';

import { AdapterCommand } from './cmd/adapter';
import { AggregatorCommand } from './cmd/aggregator';
import { CollectorCommand } from './cmd/collector';
import { GetTokenPriceCommand } from './cmd/getTokenPrice';
import { ServerCommand } from './cmd/server';

(async function () {
  dotenv.config();

  const collectorCommand = new CollectorCommand();
  const adapterCommand = new AdapterCommand();
  const aggregatorCommand = new AggregatorCommand();
  const serverCommand = new ServerCommand();
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
    .command(
      aggregatorCommand.name,
      aggregatorCommand.describe,
      aggregatorCommand.setOptions,
      aggregatorCommand.execute,
    )
    .command(serverCommand.name, serverCommand.describe, serverCommand.setOptions, serverCommand.execute)
    .help().argv;
})();
