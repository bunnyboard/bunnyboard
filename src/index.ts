import dotenv from 'dotenv';
import yargs from 'yargs/yargs';

import { RunCommand } from './cmd/run';
import { ServerCommand } from './cmd/server';

(async function () {
  dotenv.config();

  const runCommand = new RunCommand();
  const serverCommand = new ServerCommand();

  yargs(process.argv.slice(2))
    .scriptName('bunnyboard')
    .command(runCommand.name, runCommand.describe, runCommand.setOptions, runCommand.execute)
    .command(serverCommand.name, serverCommand.describe, serverCommand.setOptions, serverCommand.execute)
    .help().argv;
})();
