import { DataState, DataTimeframe } from '../base';
import { Token } from '../configs';

export interface TokenBoardDataState extends DataState, Token {
  stablecoin: boolean;
  tokenPrice: string;
  totalSupply: string;
}

export interface TokenBoardDataTimeframe extends DataTimeframe, TokenBoardDataState {
  // total Transfer volume/amount
  volumeTransfer: string;

  // total Transfer from address(0)
  volumeMint: string;

  // total Transfer to address(0)
  volumeBurn: string;
}

export interface TokenBoardDataStateWithTimeframes extends TokenBoardDataTimeframe {
  // previous day data
  last24Hours: TokenBoardDataTimeframe | null;
}
