import { DexVersion, Token } from '../configs';

export interface DexLiquidityPoolMetadata {
  protocol: string;
  chain: string;

  version: DexVersion;

  // pool contract address
  address: string;

  // the identical id of given liquidity pool
  poolId: string;

  // fee rate of this pool
  // 0.003 -> 0.3%
  feeRate: string;

  // list of pool tokens
  tokens: Array<Token>;

  // block number where pool was deployed
  birthblock: number;

  // timestamp where pool was deployed
  birthday: number;
}

export interface DexLiquidityPoolDataTimeframe extends DexLiquidityPoolMetadata {
  // the last time data were updated
  timestamp: number;

  timefrom: number;
  timeto: number;

  // usd price of pool tokens
  // can get from external sources
  tokenPrices: Array<string>;

  // list of pool token balances
  tokenBalances: Array<string>;

  // baseTokenPrice * baseTokenReserve * 2
  totalLiquidityUsd: string;

  volumeSwapUsd: string;
  volumeAddLiquidityUsd: string;
  volumeRemoveLiquidityUsd: string;

  // every dex can be swap via a router/aggregator
  // routerAddress => volumeSwapUsd
  addressRouters: { [key: string]: string };

  // unique swapper/trader address
  // swapperAddress => volumeSwapUsd
  addressSwappers: { [key: string]: string };

  // we count a Swap event is a trade
  tradeCount: number;
}
