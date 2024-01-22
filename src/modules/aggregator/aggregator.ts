import { IDatabaseService } from '../../services/database/domains';
import LendingDataAggregator from './models/lending';

export default class DataAggregatorWorker {
  private readonly _database: IDatabaseService;

  constructor(database: IDatabaseService) {
    this._database = database;
  }

  public async runUpdate(): Promise<void> {
    const lendingAggregator = new LendingDataAggregator(this._database);

    await lendingAggregator.runUpdate();
  }
}
