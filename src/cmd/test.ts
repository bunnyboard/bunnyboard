import { DefaultMemcacheTime, ProtocolConfigs } from '../configs';
import BlockchainService from '../services/blockchains/blockchain';
import { MemcacheService } from '../services/caching/memcache';
import DatabaseService from '../services/database/database';
import OracleService from '../services/oracle/oracle';
import { MetricConfig } from '../types/configs';
import { BasicCommand } from './basic';
import { getProtocolAdapters } from '../modules/adapters';
import logger from '../lib/logger';

export class TestCommand extends BasicCommand {
  public readonly name: string = 'test';
  public readonly describe: string = 'Run adapter testing';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const blockchain = new BlockchainService();
    const oracle = new OracleService();
    const memcache = new MemcacheService(DefaultMemcacheTime);
    const database = new DatabaseService();

    let configs: Array<MetricConfig> = [];
    for (const [, protocolConfig] of Object.entries(ProtocolConfigs)) {
      configs = configs.concat(protocolConfig.configs);
    }

    if (argv.chain !== '') {
      configs = configs.filter((config) => config.chain === argv.chain);
    }
    if (argv.protocl !== '') {
      configs = configs.filter((config) => config.protocol === argv.protocol);
    }

    if (argv.chain === '' && argv.protocol === '') {
      logger.error('require chain or protocol parameters', {
        service: 'testing',
        chain: argv.chain === '' ? 'none' : argv.chain,
        protocol: argv.protocol === '' ? 'none' : argv.protocol,
      });
      process.exit(0);
    }

    const adapters = getProtocolAdapters(
      {
        blockchain: blockchain,
        oracle: oracle,
      },
      {
        memcache: memcache,
        database: database,
      },
    );
    for (const config of configs) {
      if (adapters[config.protocol]) {
        logger.info('running adapter test', {
          service: 'testing',
          metric: config.metric,
          chain: config.chain,
          protocol: config.protocol,
        });
        await adapters[config.protocol].runTest({ metricConfig: config });
      }
    }

    process.exit(0);
  }

  public setOptions(yargs: any) {
    return yargs.option({
      chain: {
        type: 'string',
        default: '',
        describe:
          'Collect all protocols data on given list of chain seperated by comma, ex: --chain "ethereum,arbitrum".',
      },
      protocol: {
        type: 'string',
        default: '',
        describe:
          'Collect data of given protocol. You can pass a list of protocol seperated by comma, ex: --protocol "aavev3,uniswapv2".',
      },
    });
  }
}
