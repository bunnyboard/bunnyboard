import { IDatabaseService } from '../../services/database/domains';
import { IDataAggregator } from '../../types/namespaces';

export default class BaseDataAggregator implements IDataAggregator {
  public readonly name: string = 'aggregator';
  public readonly database: IDatabaseService;

  constructor(database: IDatabaseService) {
    this.database = database;
  }

  public async runUpdate(): Promise<void> {}
}
