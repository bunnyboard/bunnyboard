import { TimeUnits } from '../../../../configs/constants';
import { groupAndSumObjectList } from '../../../../lib/helper';
import {
  calChangesOf_Current_From_Previous,
  calPreviousOf_Current_And_Change,
  convertRateToPercentage,
  convertToNumber,
} from '../../../../lib/math';
import {
  AggCdpLendingCollateralSnapshot,
  AggCdpLendingDataOverall,
  AggCdpLendingDayData,
  AggCdpLendingMarketSnapshot,
} from '../../../../types/aggregates/cdpLending';
import {
  CdpLendingAssetDataTimeframe,
  CdpLendingCollateralDataTimeframe,
} from '../../../../types/collectors/cdpLending';
import { transformTokenValueToUsd } from '../../helper';

export default class CdpLendingDataTransformer {
  public static getDefaultAggCdpLendingDataOverall(): AggCdpLendingDataOverall {
    return {
      totalValueLocked: {
        value: 0,
      },
      totalBorrowed: {
        value: 0,
      },
      volumeBorrowed: {
        value: 0,
      },
      volumeRepaid: {
        value: 0,
      },
      feesPaidTheoretically: {
        value: 0,
      },
      totalCollateralDeposited: {
        value: 0,
      },
      volumeCollateralDeposited: {
        value: 0,
      },
      volumeCollateralWithdrawn: {
        value: 0,
      },
      volumeCollateralLiquidated: {
        value: 0,
      },
      markets: [],
      dayData: [],
    };
  }

  // CdpLendingCollateralDataTimeframe -> AggCdpLendingCollateralSnapshot
  public static transformCdpLendingCollateralSnapshot(
    // from CurrentTime - DAY -> CurrentTime
    currentLast24Hours: CdpLendingCollateralDataTimeframe,
    // from CurrentTime - 2 * DAY -> CurrentTime - DAY
    previousLast24Hours: CdpLendingCollateralDataTimeframe | null | undefined,
  ): AggCdpLendingCollateralSnapshot {
    return {
      metric: currentLast24Hours.metric,
      timestamp: currentLast24Hours.timestamp,
      timefrom: currentLast24Hours.timefrom,
      timeto: currentLast24Hours.timeto,

      chain: currentLast24Hours.chain,
      protocol: currentLast24Hours.protocol,
      address: currentLast24Hours.address,
      token: currentLast24Hours.token,
      tokenPrice: convertToNumber(currentLast24Hours.tokenPrice),

      totalDeposited: transformTokenValueToUsd({
        currentValue: currentLast24Hours,
        previousValue: previousLast24Hours,
        tokenValueField: 'totalDeposited',
        tokenPriceField: 'tokenPrice',
      }),
      totalBorrowed: currentLast24Hours.totalBorrowed
        ? transformTokenValueToUsd({
            currentValue: currentLast24Hours,
            previousValue: previousLast24Hours,
            tokenValueField: 'totalBorrowed',
            tokenPriceField: 'tokenPrice',
          })
        : undefined,

      volumeDeposited: transformTokenValueToUsd({
        currentValue: currentLast24Hours,
        previousValue: previousLast24Hours,
        tokenValueField: 'volumeDeposited',
        tokenPriceField: 'tokenPrice',
      }),
      volumeWithdrawn: transformTokenValueToUsd({
        currentValue: currentLast24Hours,
        previousValue: previousLast24Hours,
        tokenValueField: 'volumeWithdrawn',
        tokenPriceField: 'tokenPrice',
      }),
      volumeLiquidated: transformTokenValueToUsd({
        currentValue: currentLast24Hours,
        previousValue: previousLast24Hours,
        tokenValueField: 'volumeLiquidated',
        tokenPriceField: 'tokenPrice',
      }),

      rateBorrow: {
        value: convertRateToPercentage(currentLast24Hours.rateBorrow),
        changedDay: previousLast24Hours
          ? calPreviousOf_Current_And_Change(
              convertRateToPercentage(currentLast24Hours.rateBorrow),
              convertRateToPercentage(previousLast24Hours.rateBorrow),
            )
          : undefined,
      },

      rateLoanToValue: convertRateToPercentage(currentLast24Hours.rateLoanToValue),
    };
  }

  // CdpLendingAssetDataTimeframe -> AggCdpLendingMarketSnapshot
  public static transformCdpLendingMarketSnapshot(
    // from CurrentTime - DAY -> CurrentTime
    currentLast24Hours: CdpLendingAssetDataTimeframe,
    // from CurrentTime - 2 * DAY -> CurrentTime - DAY
    previousLast24Hours: CdpLendingAssetDataTimeframe | null,
  ): AggCdpLendingMarketSnapshot {
    let feesPaidTheoreticallyCurrent = 0;
    let feesPaidTheoreticallyPrevious = 0;

    let totalCollateralDepositedCurrent = 0;
    let totalCollateralDepositedPrevious = 0;
    let volumeCollateralDepositedCurrent = 0;
    let volumeCollateralDepositedPrevious = 0;
    let volumeCollateralWithdrawnCurrent = 0;
    let volumeCollateralWithdrawnPrevious = 0;
    let volumeCollateralLiquidatedCurrent = 0;
    let volumeCollateralLiquidatedPrevious = 0;

    const collaterals: Array<AggCdpLendingCollateralSnapshot> = currentLast24Hours.collaterals.map((collateral) => {
      const previousCollateralDaySnapshot = previousLast24Hours
        ? previousLast24Hours.collaterals.filter(
            (item) =>
              collateral.chain === item.chain &&
              collateral.protocol === item.protocol &&
              collateral.token.address === item.token.address,
          )[0]
        : undefined;
      return CdpLendingDataTransformer.transformCdpLendingCollateralSnapshot(collateral, previousCollateralDaySnapshot);
    });

    for (const collateral of collaterals) {
      if (collateral.totalBorrowed && collateral.rateBorrow.value > 0) {
        // Fee = TotalBorrowed * RateBorrow / 365
        feesPaidTheoreticallyCurrent +=
          (collateral.totalBorrowed.value * collateral.rateBorrow.value) / TimeUnits.DaysPerYear;

        const previousTotalBorrowed = collateral.totalBorrowed.changedDay
          ? calPreviousOf_Current_And_Change(collateral.totalBorrowed.value, collateral.totalBorrowed.changedDay)
          : 0;
        const previousRateBorrow = collateral.rateBorrow.changedDay
          ? calPreviousOf_Current_And_Change(collateral.rateBorrow.value, collateral.rateBorrow.changedDay)
          : 0;
        if (previousTotalBorrowed > 0 && previousRateBorrow > 0) {
          feesPaidTheoreticallyPrevious += (previousTotalBorrowed * previousRateBorrow) / TimeUnits.DaysPerYear;
        }
      }

      totalCollateralDepositedCurrent += collateral.totalDeposited.value;
      if (collateral.totalDeposited.changedDay) {
        totalCollateralDepositedPrevious += calPreviousOf_Current_And_Change(
          collateral.totalDeposited.value,
          collateral.totalDeposited.changedDay,
        );
      }

      volumeCollateralDepositedCurrent += collateral.volumeDeposited.value;
      if (collateral.volumeDeposited.changedDay) {
        volumeCollateralDepositedPrevious += calPreviousOf_Current_And_Change(
          collateral.volumeDeposited.value,
          collateral.volumeDeposited.changedDay,
        );
      }

      volumeCollateralWithdrawnCurrent += collateral.volumeWithdrawn.value;
      if (collateral.volumeWithdrawn.changedDay) {
        volumeCollateralWithdrawnPrevious += calPreviousOf_Current_And_Change(
          collateral.volumeWithdrawn.value,
          collateral.volumeWithdrawn.changedDay,
        );
      }

      volumeCollateralLiquidatedCurrent += collateral.volumeLiquidated.value;
      if (collateral.volumeLiquidated.changedDay) {
        volumeCollateralLiquidatedPrevious += calPreviousOf_Current_And_Change(
          collateral.volumeLiquidated.value,
          collateral.volumeLiquidated.changedDay,
        );
      }
    }

    let totalValueLockedCurrent = totalCollateralDepositedCurrent;
    let totalValueLockedPrevious = totalCollateralDepositedPrevious;
    if (currentLast24Hours.totalDeposited) {
      // in some protocol like Compound III, lenders supply debt tokens
      // so, total debt token locked = TotalSupplied - TotalBorrowed
      totalValueLockedCurrent +=
        convertToNumber(currentLast24Hours.totalDeposited) - convertToNumber(currentLast24Hours.totalBorrowed);
      if (previousLast24Hours && previousLast24Hours.totalDeposited) {
        totalValueLockedPrevious +=
          convertToNumber(previousLast24Hours.totalDeposited) - convertToNumber(previousLast24Hours.totalBorrowed);
      }
    }

    return {
      metric: currentLast24Hours.metric,
      timestamp: currentLast24Hours.timestamp,
      timefrom: currentLast24Hours.timefrom,
      timeto: currentLast24Hours.timeto,

      chain: currentLast24Hours.chain,
      protocol: currentLast24Hours.protocol,
      token: currentLast24Hours.token,
      tokenPrice: convertToNumber(currentLast24Hours.tokenPrice),

      totalValueLocked: {
        value: totalValueLockedCurrent,
        changedDay: calChangesOf_Current_From_Previous(totalValueLockedCurrent, totalValueLockedPrevious),
      },
      totalBorrowed: transformTokenValueToUsd({
        currentValue: currentLast24Hours,
        previousValue: previousLast24Hours,
        tokenPriceField: 'tokenPrice',
        tokenValueField: 'totalBorrowed',
      }),
      volumeBorrowed: transformTokenValueToUsd({
        currentValue: currentLast24Hours,
        previousValue: previousLast24Hours,
        tokenPriceField: 'tokenPrice',
        tokenValueField: 'volumeBorrowed',
      }),
      volumeRepaid: transformTokenValueToUsd({
        currentValue: currentLast24Hours,
        previousValue: previousLast24Hours,
        tokenPriceField: 'tokenPrice',
        tokenValueField: 'volumeRepaid',
      }),
      volumeDeposited: currentLast24Hours.volumeDeposited
        ? transformTokenValueToUsd({
            currentValue: currentLast24Hours,
            previousValue: previousLast24Hours,
            tokenPriceField: 'tokenPrice',
            tokenValueField: 'volumeDeposited',
          })
        : undefined,
      volumeWithdrawn: currentLast24Hours.volumeWithdrawn
        ? transformTokenValueToUsd({
            currentValue: currentLast24Hours,
            previousValue: previousLast24Hours,
            tokenPriceField: 'tokenPrice',
            tokenValueField: 'volumeWithdrawn',
          })
        : undefined,

      feesPaidTheoretically: {
        value: feesPaidTheoreticallyCurrent,
        changedDay: calChangesOf_Current_From_Previous(feesPaidTheoreticallyCurrent, feesPaidTheoreticallyPrevious),
      },
      totalCollateralDeposited: {
        value: totalCollateralDepositedCurrent,
        changedDay: calChangesOf_Current_From_Previous(
          totalCollateralDepositedCurrent,
          totalCollateralDepositedPrevious,
        ),
      },
      volumeCollateralDeposited: {
        value: volumeCollateralDepositedCurrent,
        changedDay: calChangesOf_Current_From_Previous(
          volumeCollateralDepositedCurrent,
          volumeCollateralDepositedPrevious,
        ),
      },
      volumeCollateralWithdrawn: {
        value: volumeCollateralWithdrawnCurrent,
        changedDay: calChangesOf_Current_From_Previous(
          volumeCollateralWithdrawnCurrent,
          volumeCollateralWithdrawnPrevious,
        ),
      },
      volumeCollateralLiquidated: {
        value: volumeCollateralLiquidatedCurrent,
        changedDay: calChangesOf_Current_From_Previous(
          volumeCollateralLiquidatedCurrent,
          volumeCollateralLiquidatedPrevious,
        ),
      },

      numberOfUsers: {
        value: currentLast24Hours.addresses.length,
        changedDay: previousLast24Hours
          ? calChangesOf_Current_From_Previous(
              currentLast24Hours.addresses.length,
              previousLast24Hours.addresses.length,
            )
          : undefined,
      },
      numberOfTransactions: {
        value: currentLast24Hours.transactions.length,
        changedDay: previousLast24Hours
          ? calChangesOf_Current_From_Previous(
              currentLast24Hours.transactions.length,
              previousLast24Hours.transactions.length,
            )
          : undefined,
      },
    };
  }

  // Array<AggCdpLendingMarketSnapshot> -> Array<AggCdpLendingDayData>
  public static transformCdpLendingDayData(
    marketSnapshots: Array<AggCdpLendingMarketSnapshot>,
  ): Array<AggCdpLendingDayData> {
    return groupAndSumObjectList(
      marketSnapshots.map((marketSnapshot) => {
        return {
          timestamp: marketSnapshot.timestamp,
          totalValueLocked: marketSnapshot.totalValueLocked.value,
          totalBorrowed: marketSnapshot.totalBorrowed.value,
          feesPaidTheoretically: marketSnapshot.feesPaidTheoretically.value,

          volumeBorrowed: marketSnapshot.volumeBorrowed.value,
          volumeRepaid: marketSnapshot.volumeRepaid.value,

          totalCollateralDeposited: marketSnapshot.totalCollateralDeposited.value,
          volumeCollateralDeposited: marketSnapshot.volumeCollateralDeposited.value,
          volumeCollateralWithdrawn: marketSnapshot.volumeCollateralWithdrawn.value,
          volumeCollateralLiquidated: marketSnapshot.volumeCollateralLiquidated.value,
        };
      }),
      'timestamp',
    )
      .map((item) => {
        return {
          timestamp: item.timestamp,
          totalValueLocked: item.totalValueLocked,
          totalBorrowed: item.totalBorrowed,
          feesPaidTheoretically: item.feesPaidTheoretically,

          volumeBorrowed: item.volumeBorrowed,
          volumeRepaid: item.volumeRepaid,

          totalCollateralDeposited: item.totalCollateralDeposited,
          volumeCollateralDeposited: item.volumeCollateralDeposited,
          volumeCollateralWithdrawn: item.volumeCollateralWithdrawn,
          volumeCollateralLiquidated: item.volumeCollateralLiquidated,
        };
      })
      .sort(function (a, b) {
        return a.timestamp > b.timestamp ? 1 : -1;
      });
  }
}
