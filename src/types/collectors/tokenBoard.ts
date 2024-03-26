import { Token } from '../configs';
import { DataState, DataTimeframe } from './base';

export interface TokenBoardErc20DataState extends DataState, Token {
  stablecoin: boolean;
  tokenPrice: string;
  totalSupply: string;
}

export interface TokenBoardErc20DataTimeframe extends DataTimeframe, TokenBoardErc20DataState {
  // total Transfer volume/amount
  volumeTransfer: string;

  // total Transfer from address(0)
  volumeMint: string;

  // total Transfer to address(0)
  volumeBurn: string;
}

export interface TokenBoardErc20DataStateWithTimeframes extends TokenBoardErc20DataTimeframe {
  // previous day data
  last24Hours: TokenBoardErc20DataTimeframe | null;
}
