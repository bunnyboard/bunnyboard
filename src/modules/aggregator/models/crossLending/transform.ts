import BigNumber from 'bignumber.js';

import { TimeUnits } from '../../../../configs/constants';
import { groupAndSumObjectList } from '../../../../lib/helper';
import {
  calChangesOf_Current_From_Previous,
  calChangesOf_Total_From_Items,
  calChangesOf_Two_Number_Diff,
  calPreviousOf_Current_And_Change,
  convertRateToPercentage,
  convertToNumber,
} from '../../../../lib/math';
import { DataValue } from '../../../../types/aggregates/common';
import {
  AggCrossLendingDataOverall,
  AggCrossLendingDayData,
  AggCrossLendingMarketSnapshot,
  AggCrossLendingReserveSnapshot,
} from '../../../../types/aggregates/crossLending';
import { CrossLendingReserveDataTimeframe } from '../../../../types/collectors/crossLending';
import { DataMetrics } from '../../../../types/configs';
import { transformTokenValueToUsd } from '../../helper';

export default class CrossLendingDataTransformer {
  public static getDefaultAggCrossLendingDataOverall(): AggCrossLendingDataOverall {
    return {
      totalValueLocked: {
        value: 0,
      },
      totalDeposited: {
        value: 0,
      },
      totalBorrowed: {
        value: 0,
      },
      volumeDeposited: {
        value: 0,
      },
      volumeWithdrawn: {
        value: 0,
      },
      volumeBorrowed: {
        value: 0,
      },
      volumeRepaid: {
        value: 0,
      },
      volumeLiquidated: {
        value: 0,
      },
      volumeTotal: {
        value: 0,
      },
      feesPaidTheoretically: {
        value: 0,
      },
      rateUtilization: {
        value: 0,
      },
      numberOfUsers: {
        value: 0,
      },
      numberOfTransactions: {
        value: 0,
      },
      markets: [],
      dayData: [],
    };
  }

  // Array<AggCrossLendingReserveSnapshot> -> Array<AggCrossLendingMarketSnapshot>
  public static transformCrossReservesToMarkets(
    reserves: Array<AggCrossLendingReserveSnapshot>,
  ): Array<AggCrossLendingMarketSnapshot> {
    // we transform all reserves to a list of market
    // group by protocol and chain

    const markets: { [key: string]: AggCrossLendingMarketSnapshot } = {};
    for (const reserve of reserves) {
      const marketId = `${reserve.protocol}-${reserve.chain}`;

      if (!markets[marketId]) {
        markets[marketId] = {
          metric: DataMetrics.crossLending,
          chain: reserve.chain,
          protocol: reserve.protocol,
          timestamp: reserve.timestamp,

          totalValueLocked: {
            value: 0,
          },
          totalDeposited: {
            value: 0,
          },
          totalBorrowed: {
            value: 0,
          },
          volumeDeposited: {
            value: 0,
          },
          volumeWithdrawn: {
            value: 0,
          },
          volumeBorrowed: {
            value: 0,
          },
          volumeRepaid: {
            value: 0,
          },
          volumeLiquidated: {
            value: 0,
          },
          volumeTotal: {
            value: 0,
          },
          feesPaidTheoretically: {
            value: 0,
          },
          rateUtilization: {
            value: 0,
          },
          reserves: [],
        };
      }

      markets[marketId].totalValueLocked.value += reserve.totalValueLocked.value;
      markets[marketId].totalDeposited.value += reserve.totalDeposited.value;
      markets[marketId].totalBorrowed.value += reserve.totalBorrowed.value;
      markets[marketId].volumeDeposited.value += reserve.volumeDeposited.value;
      markets[marketId].volumeWithdrawn.value += reserve.volumeWithdrawn.value;
      markets[marketId].volumeBorrowed.value += reserve.volumeBorrowed.value;
      markets[marketId].volumeRepaid.value += reserve.volumeRepaid.value;
      markets[marketId].volumeLiquidated.value += reserve.volumeLiquidated.value;
      markets[marketId].volumeTotal.value += reserve.volumeTotal.value;
      markets[marketId].feesPaidTheoretically.value += reserve.feesPaidTheoretically.value;

      markets[marketId].reserves.push(reserve);
    }

    for (const marketKey of Object.keys(markets)) {
      markets[marketKey].totalValueLocked.changedDay = calChangesOf_Total_From_Items(
        markets[marketKey].reserves.map((reserve) => {
          return {
            value: reserve.totalValueLocked.value,
            change: reserve.totalValueLocked.changedDay ? reserve.totalValueLocked.changedDay : 0,
          };
        }),
      );
      markets[marketKey].totalDeposited.changedDay = calChangesOf_Total_From_Items(
        markets[marketKey].reserves.map((reserve) => {
          return {
            value: reserve.totalDeposited.value,
            change: reserve.totalDeposited.changedDay ? reserve.totalDeposited.changedDay : 0,
          };
        }),
      );
      markets[marketKey].totalBorrowed.changedDay = calChangesOf_Total_From_Items(
        markets[marketKey].reserves.map((reserve) => {
          return {
            value: reserve.totalBorrowed.value,
            change: reserve.totalBorrowed.changedDay ? reserve.totalBorrowed.changedDay : 0,
          };
        }),
      );
      markets[marketKey].volumeDeposited.changedDay = calChangesOf_Total_From_Items(
        markets[marketKey].reserves.map((reserve) => {
          return {
            value: reserve.volumeDeposited.value,
            change: reserve.volumeDeposited.changedDay ? reserve.volumeDeposited.changedDay : 0,
          };
        }),
      );
      markets[marketKey].volumeWithdrawn.changedDay = calChangesOf_Total_From_Items(
        markets[marketKey].reserves.map((reserve) => {
          return {
            value: reserve.volumeWithdrawn.value,
            change: reserve.volumeWithdrawn.changedDay ? reserve.volumeWithdrawn.changedDay : 0,
          };
        }),
      );
      markets[marketKey].volumeBorrowed.changedDay = calChangesOf_Total_From_Items(
        markets[marketKey].reserves.map((reserve) => {
          return {
            value: reserve.volumeBorrowed.value,
            change: reserve.volumeBorrowed.changedDay ? reserve.volumeBorrowed.changedDay : 0,
          };
        }),
      );
      markets[marketKey].volumeRepaid.changedDay = calChangesOf_Total_From_Items(
        markets[marketKey].reserves.map((reserve) => {
          return {
            value: reserve.volumeRepaid.value,
            change: reserve.volumeRepaid.changedDay ? reserve.volumeRepaid.changedDay : 0,
          };
        }),
      );
      markets[marketKey].volumeLiquidated.changedDay = calChangesOf_Total_From_Items(
        markets[marketKey].reserves.map((reserve) => {
          return {
            value: reserve.volumeLiquidated.value,
            change: reserve.volumeLiquidated.changedDay ? reserve.volumeLiquidated.changedDay : 0,
          };
        }),
      );
      markets[marketKey].volumeTotal.changedDay = calChangesOf_Total_From_Items(
        markets[marketKey].reserves.map((reserve) => {
          return {
            value: reserve.volumeTotal.value,
            change: reserve.volumeTotal.changedDay ? reserve.volumeTotal.changedDay : 0,
          };
        }),
      );
      markets[marketKey].feesPaidTheoretically.changedDay = calChangesOf_Total_From_Items(
        markets[marketKey].reserves.map((reserve) => {
          return {
            value: reserve.feesPaidTheoretically.value,
            change: reserve.feesPaidTheoretically.changedDay ? reserve.feesPaidTheoretically.changedDay : 0,
          };
        }),
      );

      // we do calculate utilization rate value and day changed
      const totalDepositedChanged = markets[marketKey].totalDeposited.changedDay
        ? markets[marketKey].totalDeposited.changedDay
        : 0;
      const totalBorrowedChanged = markets[marketKey].totalBorrowed.changedDay
        ? markets[marketKey].totalBorrowed.changedDay
        : 0;
      const totalDepositedPrevious = calPreviousOf_Current_And_Change(
        markets[marketKey].totalDeposited.value,
        totalDepositedChanged ? totalDepositedChanged : 0,
      );
      const totalBorrowedPrevious = calPreviousOf_Current_And_Change(
        markets[marketKey].totalBorrowed.value,
        totalBorrowedChanged ? totalBorrowedChanged : 0,
      );
      const previousUtilization = convertRateToPercentage(totalBorrowedPrevious / totalDepositedPrevious);
      const currentUtilization = convertRateToPercentage(
        markets[marketKey].totalDeposited.value / markets[marketKey].totalBorrowed.value,
      );

      markets[marketKey].rateUtilization = {
        value: currentUtilization,
        changedDay: calChangesOf_Current_From_Previous(currentUtilization, previousUtilization),
      };
    }

    return Object.values(markets);
  }

  // CrossLendingReserveDataTimeframe -> AggCrossLendingReserveSnapshot
  public static transformCrossLendingReserveSnapshot(
    // from CurrentTime - DAY -> CurrentTime
    currentLast24Hours: CrossLendingReserveDataTimeframe,
    // from CurrentTime - 2 * DAY -> CurrentTime - DAY
    previousLast24Hours: CrossLendingReserveDataTimeframe | null,
  ): AggCrossLendingReserveSnapshot {
    // Fee = TotalBorrow * BorrowRate / 365
    let feesPaidPrevious = 0;
    let feesPaidCurrent =
      (convertToNumber(currentLast24Hours.totalBorrowed) * convertToNumber(currentLast24Hours.rateBorrow)) /
      TimeUnits.DaysPerYear;
    if (currentLast24Hours.rateBorrowStable) {
      feesPaidCurrent +=
        (convertToNumber(currentLast24Hours.totalBorrowed) * convertToNumber(currentLast24Hours.rateBorrowStable)) /
        TimeUnits.DaysPerYear;
    }
    if (previousLast24Hours) {
      feesPaidPrevious =
        (convertToNumber(previousLast24Hours.totalBorrowed) * convertToNumber(previousLast24Hours.rateBorrow)) /
        TimeUnits.DaysPerYear;
      if (previousLast24Hours.rateBorrowStable) {
        feesPaidPrevious +=
          (convertToNumber(previousLast24Hours.totalBorrowed) * convertToNumber(previousLast24Hours.rateBorrowStable)) /
          TimeUnits.DaysPerYear;
      }
    }

    const totalDeposited = transformTokenValueToUsd({
      currentValue: currentLast24Hours,
      previousValue: previousLast24Hours,
      tokenPriceField: 'tokenPrice',
      tokenValueField: 'totalDeposited',
    });
    const totalBorrowed = transformTokenValueToUsd({
      currentValue: currentLast24Hours,
      previousValue: previousLast24Hours,
      tokenPriceField: 'tokenPrice',
      tokenValueField: 'totalBorrowed',
    });

    const totalValueLocked: DataValue = {
      value: totalDeposited.value - totalBorrowed.value,
      changedDay: calChangesOf_Two_Number_Diff(
        {
          value: totalDeposited.value,
          change: totalDeposited.changedDay ? totalDeposited.changedDay : '0',
        },
        {
          value: totalBorrowed.value,
          change: totalBorrowed.changedDay ? totalBorrowed.changedDay : '0',
        },
      ),
    };

    const volumeDeposited = transformTokenValueToUsd({
      currentValue: currentLast24Hours,
      previousValue: previousLast24Hours,
      tokenPriceField: 'tokenPrice',
      tokenValueField: 'volumeDeposited',
    });
    const volumeWithdrawn = transformTokenValueToUsd({
      currentValue: currentLast24Hours,
      previousValue: previousLast24Hours,
      tokenPriceField: 'tokenPrice',
      tokenValueField: 'volumeWithdrawn',
    });
    const volumeBorrowed = transformTokenValueToUsd({
      currentValue: currentLast24Hours,
      previousValue: previousLast24Hours,
      tokenPriceField: 'tokenPrice',
      tokenValueField: 'volumeBorrowed',
    });
    const volumeRepaid = transformTokenValueToUsd({
      currentValue: currentLast24Hours,
      previousValue: previousLast24Hours,
      tokenPriceField: 'tokenPrice',
      tokenValueField: 'volumeRepaid',
    });
    const volumeLiquidated = transformTokenValueToUsd({
      currentValue: currentLast24Hours,
      previousValue: previousLast24Hours,
      tokenPriceField: 'tokenPrice',
      tokenValueField: 'volumeLiquidated',
    });

    const volumeTotal: DataValue = {
      value:
        volumeDeposited.value +
        volumeWithdrawn.value +
        volumeBorrowed.value +
        volumeRepaid.value +
        volumeLiquidated.value,
      changedDay: calChangesOf_Total_From_Items([
        {
          value: volumeDeposited.value,
          change: volumeDeposited.changedDay ? volumeDeposited.changedDay : 0,
        },
        {
          value: volumeWithdrawn.value,
          change: volumeWithdrawn.changedDay ? volumeWithdrawn.changedDay : 0,
        },
        {
          value: volumeBorrowed.value,
          change: volumeBorrowed.changedDay ? volumeBorrowed.changedDay : 0,
        },
        {
          value: volumeRepaid.value,
          change: volumeRepaid.changedDay ? volumeRepaid.changedDay : 0,
        },
        {
          value: volumeLiquidated.value,
          change: volumeLiquidated.changedDay ? volumeLiquidated.changedDay : 0,
        },
      ]),
    };

    // we do calculate utilization rate value and day changed
    const uRateCurrent = convertRateToPercentage(
      new BigNumber(currentLast24Hours.totalBorrowed).dividedBy(new BigNumber(currentLast24Hours.totalDeposited)),
    );
    const uRatePrevious = previousLast24Hours
      ? convertRateToPercentage(
          new BigNumber(previousLast24Hours.totalBorrowed).dividedBy(new BigNumber(previousLast24Hours.totalDeposited)),
        )
      : 0;

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

      totalValueLocked: totalValueLocked,
      totalDeposited: totalDeposited,
      totalBorrowed: totalBorrowed,

      volumeDeposited: volumeDeposited,
      volumeWithdrawn: volumeWithdrawn,
      volumeBorrowed: volumeBorrowed,
      volumeRepaid: volumeRepaid,
      volumeLiquidated: volumeLiquidated,
      volumeTotal: volumeTotal,

      feesPaidTheoretically: {
        value: feesPaidCurrent,
        changedDay: calChangesOf_Current_From_Previous(feesPaidCurrent, feesPaidPrevious),
      },

      rateSupply: {
        value: convertRateToPercentage(currentLast24Hours.rateSupply),
        changedDay: previousLast24Hours
          ? calChangesOf_Current_From_Previous(currentLast24Hours.rateSupply, previousLast24Hours.rateSupply)
          : undefined,
      },
      rateBorrow: {
        value: convertRateToPercentage(currentLast24Hours.rateBorrow),
        changedDay: previousLast24Hours
          ? calChangesOf_Current_From_Previous(currentLast24Hours.rateBorrow, previousLast24Hours.rateBorrow)
          : undefined,
      },
      rateBorrowStable: currentLast24Hours.rateBorrowStable
        ? {
            value: convertRateToPercentage(currentLast24Hours.rateBorrowStable),
            changedDay:
              previousLast24Hours && previousLast24Hours.rateBorrowStable
                ? calChangesOf_Current_From_Previous(
                    currentLast24Hours.rateBorrowStable,
                    previousLast24Hours.rateBorrowStable,
                  )
                : undefined,
          }
        : undefined,

      rateLoanToValue: convertRateToPercentage(currentLast24Hours.rateLoanToValue),

      rateUtilization: {
        value: uRateCurrent,
        changedDay: uRatePrevious ? calChangesOf_Current_From_Previous(uRateCurrent, uRatePrevious) : undefined,
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

  // Array<AggCrossLendingReserveSnapshot> => Array<AggCrossLendingDayData>
  public static transformCrossReservesToDayData(
    reserveSnapshots: Array<AggCrossLendingReserveSnapshot>,
  ): Array<AggCrossLendingDayData> {
    // timestamp => AggCrossLendingDayData
    return groupAndSumObjectList(
      reserveSnapshots.map((snapshot) => {
        return {
          timestamp: snapshot.timestamp,
          totalValueLocked: snapshot.totalDeposited.value - snapshot.totalBorrowed.value,
          totalDeposited: snapshot.totalDeposited.value,
          totalBorrowed: snapshot.totalBorrowed.value,
          feesPaidTheoretically: snapshot.feesPaidTheoretically.value,
          volumeDeposited: snapshot.volumeDeposited.value,
          volumeWithdrawn: snapshot.volumeWithdrawn.value,
          volumeBorrowed: snapshot.volumeBorrowed.value,
          volumeRepaid: snapshot.volumeRepaid.value,
          volumeLiquidated: snapshot.volumeLiquidated.value,
          volumeTotal: snapshot.volumeTotal.value,
        };
      }),
      'timestamp',
    ).map((item) => {
      return {
        timestamp: item.timestamp,
        totalValueLocked: item.totalValueLocked,
        totalDeposited: item.totalDeposited,
        totalBorrowed: item.totalBorrowed,
        feesPaidTheoretically: item.feesPaidTheoretically,
        volumeDeposited: item.volumeDeposited,
        volumeWithdrawn: item.volumeWithdrawn,
        volumeBorrowed: item.volumeBorrowed,
        volumeRepaid: item.volumeRepaid,
        volumeLiquidated: item.volumeLiquidated,
        volumeTotal: item.volumeTotal,
      };
    });
  }
}
