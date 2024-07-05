#! /usr/bin/env node

import dotenv from 'dotenv';
import yargs from 'yargs/yargs';

import { RunCommand } from './cmd/run';
import { TestCommand } from './cmd/test';

(async function () {
  dotenv.config();

  const runCommand = new RunCommand();
  const testCommand = new TestCommand();

  yargs(process.argv.slice(2))
    .scriptName('bunny')
    .command(runCommand.name, runCommand.describe, runCommand.setOptions, runCommand.execute)
    .command(testCommand.name, testCommand.describe, testCommand.setOptions, testCommand.execute)
    .help().argv;
})();
