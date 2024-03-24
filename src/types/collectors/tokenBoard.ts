import { DexVersion, Token } from '../configs';
import { DataState, DataTimeframe } from './base';

export interface TokenBoardErc20AddressBalance extends Token {
  holder: string;
  balance: string;
  timestamp: number;
}

export interface TokenBoardErc20DataState extends DataState, Token {
  stablecoin: boolean;
  tokenPrice: string;
  totalSupply: string;
}

export interface TokenBoardErc20DataOnDex {
  protocol: string;
  version: DexVersion;
  totalLiquidity: string;
  volumeTrading: string;
}

export interface TokenBoardErc20DataTimeframe extends DataTimeframe, TokenBoardErc20DataState {
  // total Transfer volume/amount
  volumeTransfer: string;

  // total Transfer from address(0)
  volumeMint: string;

  // total Transfer to address(0)
  volumeBurn: string;

  // volume trading on all dex
  dataOnDex: Array<TokenBoardErc20DataOnDex>;

  // a list of addresses sent or received tokens
  addressBalances: Array<TokenBoardErc20AddressBalance>;
}

export interface TokenBoardErc20DataStateWithTimeframes extends TokenBoardErc20DataTimeframe {
  // previous day data
  last24Hours: TokenBoardErc20DataTimeframe | null;
}
