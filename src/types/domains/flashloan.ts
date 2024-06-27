import { DataTimeframe } from '../base';
import { Token } from '../configs';

export interface FlashloanReserveData {
  token: Token;
  tokenPrice: string;

  // flashloan volume
  volume: string;

  // fees generated from fashloan only
  feesPaid: string;

  // a list of execute contracts
  // contract address => token flashloan amount
  executors: { [key: string]: string };
}

export interface FlashloanDataTimeframe extends DataTimeframe {
  address: string;

  // a list of reserves
  reserves: Array<FlashloanReserveData>;

  // a list of senders
  addresses: Array<string>;

  // txn list
  transactions: Array<string>;
}

export interface FlashloanDataStateWithTimeframes extends FlashloanDataTimeframe {
  // previous day data
  last24Hours: FlashloanDataTimeframe | null;
}
