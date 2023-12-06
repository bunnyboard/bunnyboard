import dotenv from 'dotenv';
import yargs from 'yargs/yargs';

import { CollectCommand } from './cmd/collect';
import { GetlogCommand } from './cmd/getlog';
import { ServerCommand } from './cmd/server';

(async function () {
  dotenv.config();

  const collectCommand = new CollectCommand();
  const getlogCommand = new GetlogCommand();
  const serverCommand = new ServerCommand();

  yargs(process.argv.slice(2))
    .scriptName('magicbunny')
    .command(collectCommand.name, collectCommand.describe, collectCommand.setOptions, collectCommand.execute)
    .command(getlogCommand.name, getlogCommand.describe, getlogCommand.setOptions, getlogCommand.execute)
    .command(serverCommand.name, serverCommand.describe, serverCommand.setOptions, serverCommand.execute)
    .help().argv;
})();
