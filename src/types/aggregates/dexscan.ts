import { DexVersion, Token } from '../configs';

export interface AggDexLiquidityTokenSnapshot extends Token {
  // dex name
  protocol: string;

  // dex version
  version: DexVersion;

  // token price in USD at the time of fetching data
  // calculated exactly at timefrom timestamp
  tokenPrice: number;

  // total tokens were provided as liquidity
  // collected exactly at timefrom timestamp
  totalLiquidity: number;

  // fees collected from trading
  feesTrading: number;

  // total token amount was traded
  // collected in the period from timefrom to timeto timestamps
  volumeTrading: number;

  // total token amount was traded of all time
  volumeTradingCumulative: number;

  // collected in the period from timefrom to timeto timestamps
  numberOfTransactions: number;

  // total transaction counted of all time
  numberOfTransactionsCumulative: number;
}

export interface AggDexLiquidityPoolSnapshot {
  protocol: string;
  version: string;
  chain: string;
  // pool contract address
  address: string;
  tokens: Array<Token>;

  feesPercentage: number;

  tokenPrices: Array<number>;
  tokenBalances: Array<number>;
  totalLiquidityUsd: number;
  feesTradingUsd: number;
  volumeTradingUsd: number;
  volumeTradingCumulativeUsd: number;
  numberOfTransactions: number;
  numberOfTransactionsCumulative: number;
}
