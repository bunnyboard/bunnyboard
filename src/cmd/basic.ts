import { ContractConfigs } from '../configs/contracts';
import envConfig from '../configs/envConfig';
import EnvConfig from '../configs/envConfig';
import { normalizeAddress } from '../lib/utils';
import BlockchainService from '../services/blockchains/blockchain';
import DatabaseService from '../services/database/database';
import { ContextServices } from '../types/namespaces';

export class BasicCommand {
  public readonly name: string = 'command';
  public readonly describe: string = 'Basic command';

  constructor() {}

  public async getServices(): Promise<ContextServices> {
    const database = new DatabaseService();
    const blockchain = new BlockchainService();

    await database.connect(envConfig.mongodb.connectionUri, envConfig.mongodb.databaseName);

    // update contract config
    for (const config of ContractConfigs) {
      await database.update({
        collection: EnvConfig.mongodb.collections.contracts,
        keys: {
          chain: config.chain,
          address: normalizeAddress(config.address),
        },
        updates: {
          ...config,
        },
        upsert: true,
      });
    }

    return {
      database: database,
      blockchain: blockchain,
    };
  }

  public async execute(argv: any) {}
  public setOptions(yargs: any) {}
}
