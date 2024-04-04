import dotenv from 'dotenv';
import yargs from 'yargs/yargs';

import { RunCommand } from './cmd/run';

(async function () {
  dotenv.config();

  const runCommand = new RunCommand();

  yargs(process.argv.slice(2))
    .scriptName('bunnyboard')
    .command(runCommand.name, runCommand.describe, runCommand.setOptions, runCommand.execute)
    .help().argv;
})();
