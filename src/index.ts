import dotenv from 'dotenv';
import yargs from 'yargs/yargs';

import { CollectCommand } from './cmd/collect';
import { GetlogCommand } from './cmd/getlog';

(async function () {
  dotenv.config();

  const collectCommand = new CollectCommand();
  const getlogCommand = new GetlogCommand();

  yargs(process.argv.slice(2))
    .scriptName('magicbunny')
    .command(collectCommand.name, collectCommand.describe, collectCommand.setOptions, collectCommand.execute)
    .command(getlogCommand.name, getlogCommand.describe, getlogCommand.setOptions, getlogCommand.execute)
    .help().argv;
})();
