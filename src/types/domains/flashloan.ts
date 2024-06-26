import { Token } from "@uniswap/sdk-core";
import { DataTimeframe } from "../base";

export interface FlashloanReserveData {
  token: Token;
  tokenPrice: string;
  
  // token balance in contract
  balance: string;

  // flashloan volume
  volume: string;

  // fees generated from fashloan only
  feesPaid: string;
}

export interface FlashloanDataTimeframe extends DataTimeframe {
  address: string;

  // a list of reserves
  reserves: Array<FlashloanReserveData>;
}

export interface FlashloanDataStateWithTimeframes extends FlashloanDataTimeframe {
  // previous day data
  last24Hours: FlashloanDataTimeframe | null;
}
