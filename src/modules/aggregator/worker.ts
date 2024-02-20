import { IDatabaseService } from '../../services/database/domains';
import CrossLendingDataAggregator from './models/crossLending';

export default class DataAggregatorWorker {
  private readonly _database: IDatabaseService;

  constructor(database: IDatabaseService) {
    this._database = database;
  }

  public async runUpdate(): Promise<void> {
    const crossLendingAggregator = new CrossLendingDataAggregator(this._database);

    await crossLendingAggregator.runUpdate();
  }
}
