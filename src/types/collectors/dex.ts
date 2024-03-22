import { DexVersion, Token } from '../configs';
import { DataState } from './base';

export interface DexLiquidityPoolDataState extends DataState {
  version: DexVersion;
  address: string;
  tokens: Array<Token>;
  tokenBalances: Array<string>;
  tokenPrices: Array<string>;
}
