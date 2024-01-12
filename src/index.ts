import dotenv from 'dotenv';
import yargs from 'yargs/yargs';

import { GetTokenPriceCommand } from './cmd/getTokenPrice';
import { RunAdapterCommand } from './cmd/runAdapter';
import { RunCollectorCommand } from './cmd/runCollector';

(async function () {
  dotenv.config();

  const runCollectorCommand = new RunCollectorCommand();
  const runAdapterCommand = new RunAdapterCommand();
  const getTokenPriceCommand = new GetTokenPriceCommand();

  yargs(process.argv.slice(2))
    .scriptName('bunnyboard')
    .command(
      runAdapterCommand.name,
      runAdapterCommand.describe,
      runAdapterCommand.setOptions,
      runAdapterCommand.execute,
    )
    .command(
      runCollectorCommand.name,
      runCollectorCommand.describe,
      runCollectorCommand.setOptions,
      runCollectorCommand.execute,
    )
    .command(
      getTokenPriceCommand.name,
      getTokenPriceCommand.describe,
      getTokenPriceCommand.setOptions,
      getTokenPriceCommand.execute,
    )
    .help().argv;
})();
