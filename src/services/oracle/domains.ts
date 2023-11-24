import { Token } from '../../types/configs';
import { IDatabaseService } from '../database/domains';

export interface GetTokenPriceOptions {
  token: Token;

  // we always convert timestamp to the timestamp at the beginning of the day
  timestamp: number;
}

export interface IOracleService {
  name: string;
  database: IDatabaseService;

  getTokenPriceUsd: (options: GetTokenPriceOptions) => Promise<string>;
}
