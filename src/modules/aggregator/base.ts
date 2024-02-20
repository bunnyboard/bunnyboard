import { IDatabaseService } from '../../services/database/domains';
import { DataAggregator } from '../../types/namespaces';

export default class BaseDataAggregator implements DataAggregator {
  public readonly name: string = 'aggregator.baseData';
  public readonly database: IDatabaseService;

  constructor(database: IDatabaseService) {
    this.database = database;
  }

  public async runUpdate(): Promise<void> {}
}
