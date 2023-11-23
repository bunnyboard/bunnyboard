import dotenv from 'dotenv';
import yargs from 'yargs/yargs';

import { CollectCommand } from './cmd/collect';
import { IndexCommand } from './cmd/indexing';

(async function () {
  dotenv.config();

  const indexCommand = new IndexCommand();
  const collectCommand = new CollectCommand();

  yargs(process.argv.slice(2))
    .scriptName('magicbunny')
    .command(indexCommand.name, indexCommand.describe, indexCommand.setOptions, indexCommand.execute)
    .command(collectCommand.name, collectCommand.describe, collectCommand.setOptions, collectCommand.execute)
    .help().argv;
})();
