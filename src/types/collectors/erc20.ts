import { Token } from '../configs';
import { DataState } from './base';

export interface Erc20DataState extends DataState {
  token: Token;
  tokenPrice: string;
  totalSupply: string;
}
