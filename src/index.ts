import dotenv from 'dotenv';
import yargs from 'yargs/yargs';

import { GetTokenPriceCommand } from './cmd/getTokenPrice';
import { RunCommand } from './cmd/run';

(async function () {
  dotenv.config();

  const runCommand = new RunCommand();
  const getTokenPriceCommand = new GetTokenPriceCommand();

  yargs(process.argv.slice(2))
    .scriptName('bunnyboard')
    .command(runCommand.name, runCommand.describe, runCommand.setOptions, runCommand.execute)
    .command(
      getTokenPriceCommand.name,
      getTokenPriceCommand.describe,
      getTokenPriceCommand.setOptions,
      getTokenPriceCommand.execute,
    )
    .help().argv;
})();
