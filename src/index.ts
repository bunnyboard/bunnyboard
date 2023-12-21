import dotenv from 'dotenv';
import yargs from 'yargs/yargs';

import { CollectCommand } from './cmd/collect';
import { GetTokenPriceCommand } from './cmd/getTokenPrice';
import { ServerCommand } from './cmd/server';

(async function () {
  dotenv.config();

  const collectCommand = new CollectCommand();
  const serverCommand = new ServerCommand();
  const getTokenPriceCommand = new GetTokenPriceCommand();

  yargs(process.argv.slice(2))
    .scriptName('bboard')
    .command(collectCommand.name, collectCommand.describe, collectCommand.setOptions, collectCommand.execute)
    .command(serverCommand.name, serverCommand.describe, serverCommand.setOptions, serverCommand.execute)
    .command(
      getTokenPriceCommand.name,
      getTokenPriceCommand.describe,
      getTokenPriceCommand.setOptions,
      getTokenPriceCommand.execute,
    )
    .help().argv;
})();
