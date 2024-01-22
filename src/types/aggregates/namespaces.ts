import { IDatabaseService } from '../../services/database/domains';
import { AggDataQueryOptions, AggDataQueryResult } from './options';

export interface DataAggregator {
  name: string;
  database: IDatabaseService;

  query: (options: AggDataQueryOptions) => Promise<AggDataQueryResult | null>;

  // expect to aggregate data and update to database
  runUpdate: () => Promise<void>;
}
