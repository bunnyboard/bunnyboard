import BlockchainService from '../services/blockchains/blockchain';
import DatabaseService from '../services/database/database';
import OracleService from '../services/oracle/oracle';
import { ContextServices } from '../types/namespaces';

export class BasicCommand {
  public readonly name: string = 'command';
  public readonly describe: string = 'Basic command';

  constructor() {}

  public async getServices(): Promise<ContextServices> {
    const database = new DatabaseService();
    const blockchain = new BlockchainService();
    const oracle = new OracleService();

    // await database.connect(envConfig.mongodb.connectionUri, envConfig.mongodb.databaseName);

    return {
      database: database,
      blockchain: blockchain,
      oracle: oracle,
    };
  }

  public async execute(argv: any) {}
  public setOptions(yargs: any) {}
}
