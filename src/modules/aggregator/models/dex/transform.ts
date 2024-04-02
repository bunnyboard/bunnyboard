import { groupAndSumObjectList } from '../../../../lib/helper';
import { calChangesOf_Current_From_Previous, convertToNumber } from '../../../../lib/math';
import { AggDexDataOverall, AggDexDataSnapshot, AggDexDayData } from '../../../../types/aggregates/dex';
import { DexDataTimeframe } from '../../../../types/collectors/dex';

export default class DexDataTransformer {
  public static getDefaultDexDataOverall(): AggDexDataOverall {
    return {
      totalLiquidityUsd: {
        value: 0,
      },
      feesTradingUsd: {
        value: 0,
      },
      volumeTradingUsd: {
        value: 0,
      },
      numberOfTraders: {
        value: 0,
      },
      numberOfTransactions: {
        value: 0,
      },

      exchanges: [],
      dayData: [],
    };
  }

  // DexDataTimeframe -> AggDexDataSnapshot
  public static transformDexDataSnapshot(
    // from CurrentTime - DAY -> CurrentTime
    currentLast24Hours: DexDataTimeframe,
    // from CurrentTime - 2 * DAY -> CurrentTime - DAY
    previousLast24Hours: DexDataTimeframe | null,
  ): AggDexDataSnapshot {
    return {
      protocol: currentLast24Hours.protocol,
      version: currentLast24Hours.version,
      metric: currentLast24Hours.metric,
      chain: currentLast24Hours.chain,
      timestamp: currentLast24Hours.timestamp,
      timefrom: currentLast24Hours.timefrom,
      timeto: currentLast24Hours.timeto,

      totalLiquidityUsd: {
        value: convertToNumber(currentLast24Hours.totalLiquidityUsd),
        changedDay: previousLast24Hours
          ? calChangesOf_Current_From_Previous(
              currentLast24Hours.totalLiquidityUsd,
              previousLast24Hours.totalLiquidityUsd,
            )
          : undefined,
      },
      feesTradingUsd: {
        value: convertToNumber(currentLast24Hours.feesTradingUsd),
        changedDay: previousLast24Hours
          ? calChangesOf_Current_From_Previous(currentLast24Hours.feesTradingUsd, previousLast24Hours.feesTradingUsd)
          : undefined,
      },
      volumeTradingUsd: {
        value: convertToNumber(currentLast24Hours.volumeTradingUsd),
        changedDay: previousLast24Hours
          ? calChangesOf_Current_From_Previous(
              currentLast24Hours.volumeTradingUsd,
              previousLast24Hours.volumeTradingUsd,
            )
          : undefined,
      },
      numberOfTransactions: {
        value: convertToNumber(currentLast24Hours.numberOfTransactions),
        changedDay: previousLast24Hours
          ? calChangesOf_Current_From_Previous(
              currentLast24Hours.numberOfTransactions,
              previousLast24Hours.numberOfTransactions,
            )
          : undefined,
      },
      traders: currentLast24Hours.traders.map((trader) => {
        return {
          address: trader.address,
          volumeUsd: convertToNumber(trader.volumeUsd),
        };
      }),
    };
  }

  // Array<AggDexDataSnapshot> -> Array<AggDexDayData>
  public static transformDexDayData(dexSnapshots: Array<AggDexDataSnapshot>): Array<AggDexDayData> {
    return groupAndSumObjectList(
      dexSnapshots.map((dexSnapshots) => {
        return {
          timestamp: dexSnapshots.timestamp,
          totalLiquidityUsd: dexSnapshots.totalLiquidityUsd.value,
          feesTradingUsd: dexSnapshots.feesTradingUsd.value,
          volumeTradingUsd: dexSnapshots.volumeTradingUsd.value,
          numberOfTraders: dexSnapshots.traders.length,
          numberOfTransactions: dexSnapshots.numberOfTransactions.value,
        };
      }),
      'timestamp',
    )
      .map((item) => {
        return {
          timestamp: item.timestamp,
          totalLiquidityUsd: item.totalLiquidityUsd,
          feesTradingUsd: item.feesTradingUsd,
          volumeTradingUsd: item.volumeTradingUsd,
          numberOfTraders: item.numberOfTraders,
          numberOfTransactions: item.numberOfTransactions,
        };
      })
      .sort(function (a, b) {
        return a.timestamp > b.timestamp ? 1 : -1;
      });
  }
}
