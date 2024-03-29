import { convertToNumber } from '../../../../lib/math';
import { AggDexLiquidityPoolSnapshot, AggDexLiquidityTokenSnapshot } from '../../../../types/aggregates/dexscan';
import { DexLiquidityPoolSnapshot, DexLiquidityTokenSnapshot } from '../../../../types/collectors/dexscan';

export default class DexscanDataTransformer {
  // DexLiquidityTokenSnapshot -> AggDexLiquidityTokenSnapshot
  public static transformDexLiquidityTokenSnapshot(snapshot: DexLiquidityTokenSnapshot): AggDexLiquidityTokenSnapshot {
    return {
      protocol: snapshot.protocol,
      version: snapshot.version,
      chain: snapshot.chain,
      symbol: snapshot.symbol,
      decimals: snapshot.decimals,
      address: snapshot.address,

      tokenPrice: convertToNumber(snapshot.tokenPrice),
      totalLiquidity: convertToNumber(snapshot.totalLiquidity),
      feesTrading: convertToNumber(snapshot.feesTrading),
      feesTradingCumulative: convertToNumber(snapshot.feesTradingCumulative),
      volumeTrading: convertToNumber(snapshot.volumeTrading),
      volumeTradingCumulative: convertToNumber(snapshot.volumeTradingCumulative),
      numberOfTransactions: snapshot.numberOfTransactions,
      numberOfTransactionsCumulative: snapshot.numberOfTransactionsCumulative,
    };
  }

  // DexLiquidityPoolSnapshot -> AggDexLiquidityPoolSnapshot
  public static transformDexLiquidityPoolSnapshot(snapshot: DexLiquidityPoolSnapshot): AggDexLiquidityPoolSnapshot {
    return {
      protocol: snapshot.protocol,
      version: snapshot.version,
      chain: snapshot.chain,
      address: snapshot.address,
      tokens: snapshot.tokens,
      tokenPrices: snapshot.tokenPrices.map((item) => convertToNumber(item)),
      tokenBalances: snapshot.tokenBalances.map((item) => convertToNumber(item)),
      feesPercentage: snapshot.feesPercentage,
      totalLiquidityUsd: convertToNumber(snapshot.totalLiquidityUsd),
      feesTradingUsd: convertToNumber(snapshot.feesTradingUsd),
      feesTradingCumulativeUsd: convertToNumber(snapshot.feesTradingCumulativeUsd),
      volumeTradingUsd: convertToNumber(snapshot.volumeTradingUsd),
      volumeTradingCumulativeUsd: convertToNumber(snapshot.volumeTradingCumulativeUsd),
      numberOfTransactions: snapshot.numberOfTransactions,
      numberOfTransactionsCumulative: snapshot.numberOfTransactionsCumulative,
    };
  }
}
