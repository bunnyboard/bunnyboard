import { IDatabaseService } from '../../services/database/domains';
import CdpLendingDataAggregator from './models/cdpLending';
import CrossLendingDataAggregator from './models/crossLending';
import PerpetualDataAggregator from './models/perpetual';

export default class DataAggregatorWorker {
  private readonly _database: IDatabaseService;

  constructor(database: IDatabaseService) {
    this._database = database;
  }

  public async runUpdate(): Promise<void> {
    const crossLendingAggregator = new CrossLendingDataAggregator(this._database);
    const cdpLendingAggregator = new CdpLendingDataAggregator(this._database);
    const perpetualAggregator = new PerpetualDataAggregator(this._database);

    await crossLendingAggregator.runUpdate();
    await cdpLendingAggregator.runUpdate();
    await perpetualAggregator.runUpdate();
  }
}
