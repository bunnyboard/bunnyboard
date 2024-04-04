import { DexVersion, Token } from './configs';

export interface DexLiquidityTokenSnapshot extends Token {
  // dex name
  protocol: string;

  // dex version
  version: DexVersion;

  // token price in USD at the time of fetching data
  // calculated exactly at timefrom timestamp
  tokenPrice: string;

  // total tokens were provided as liquidity
  // collected exactly at timefrom timestamp
  totalLiquidity: string;

  // fees collected from trading
  feesTrading: string;

  // all time fees were collected
  feesTradingCumulative: string;

  // total token amount was traded
  // collected in the period from timefrom to timeto timestamps
  volumeTrading: string;

  // total token amount was traded of all time
  volumeTradingCumulative: string;

  // collected in the period from timefrom to timeto timestamps
  numberOfTransactions: number;

  // total transaction counted of all time
  numberOfTransactionsCumulative: number;
}

export interface DexLiquidityPoolMetadata {
  protocol: string;
  version: string;
  chain: string;
  // pool contract address
  address: string;
  tokens: Array<Token>;

  feesPercentage: number;
}

export interface DexLiquidityPoolSnapshot extends DexLiquidityPoolMetadata {
  tokenPrices: Array<string>;
  tokenBalances: Array<string>;
  totalLiquidityUsd: string;
  feesTradingUsd: string;
  feesTradingCumulativeUsd: string;
  volumeTradingUsd: string;
  volumeTradingCumulativeUsd: string;
  numberOfTransactions: number;
  numberOfTransactionsCumulative: number;
}
