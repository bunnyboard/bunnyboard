import { DataState } from './base';
import { Token } from '../configs';

export interface Erc20DataState extends DataState {
  token: Token;
  tokenPrice: string;
  totalSupply: string;
}
