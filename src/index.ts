import dotenv from 'dotenv';
import yargs from 'yargs/yargs';

import { RunCommand } from './cmd/run';
import { ServerCommand } from './cmd/server';
import { WorkerCommand } from './cmd/worker';

(async function () {
  dotenv.config();

  const runCommand = new RunCommand();
  const workerCommand = new WorkerCommand();
  const serverCommand = new ServerCommand();

  yargs(process.argv.slice(2))
    .scriptName('bunnyboard')
    .command(runCommand.name, runCommand.describe, runCommand.setOptions, runCommand.execute)
    .command(workerCommand.name, workerCommand.describe, workerCommand.setOptions, workerCommand.execute)
    .command(serverCommand.name, serverCommand.describe, serverCommand.setOptions, serverCommand.execute)
    .help().argv;
})();
