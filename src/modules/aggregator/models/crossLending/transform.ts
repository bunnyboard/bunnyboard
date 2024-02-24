import BigNumber from 'bignumber.js';

import { groupAndSumObjectList } from '../../../../lib/helper';
import { calChangesOf_Total_From_Items, convertToNumber, convertToPercentage } from '../../../../lib/math';
import {
  AggCrossLendingDataOverall,
  AggCrossLendingDayData,
  AggCrossLendingMarketSnapshot,
  AggCrossLendingReserveSnapshot,
} from '../../../../types/aggregates/crossLending';
import { CrossLendingReserveDataTimeframe } from '../../../../types/collectors/crossLending';
import { DataMetrics } from '../../../../types/configs';
import { transformValueWithTokenPrice } from '../../helper';

export default class CrossLendingDataTransformer {
  public static getDefaultAggCrossLendingDataOverall(): AggCrossLendingDataOverall {
    return {
      totalDeposited: {
        value: 0,
        valueUsd: 0,
      },
      totalBorrowed: {
        value: 0,
        valueUsd: 0,
      },
      volumeDeposited: {
        value: 0,
        valueUsd: 0,
      },
      volumeWithdrawn: {
        value: 0,
        valueUsd: 0,
      },
      volumeBorrowed: {
        value: 0,
        valueUsd: 0,
      },
      volumeRepaid: {
        value: 0,
        valueUsd: 0,
      },
      feesPaidTheoretically: {
        value: 0,
        valueUsd: 0,
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

          totalDeposited: {
            value: 0,
            valueUsd: 0,
          },
          totalBorrowed: {
            value: 0,
            valueUsd: 0,
          },
          volumeDeposited: {
            value: 0,
            valueUsd: 0,
          },
          volumeWithdrawn: {
            value: 0,
            valueUsd: 0,
          },
          volumeBorrowed: {
            value: 0,
            valueUsd: 0,
          },
          volumeRepaid: {
            value: 0,
            valueUsd: 0,
          },
          feesPaidTheoretically: {
            value: 0,
            valueUsd: 0,
          },
          reserves: [],
        };
      }

      markets[marketId].totalDeposited.valueUsd += reserve.totalDeposited.valueUsd;
      markets[marketId].totalBorrowed.valueUsd += reserve.totalBorrowed.valueUsd;
      markets[marketId].volumeDeposited.valueUsd += reserve.volumeDeposited.valueUsd;
      markets[marketId].volumeWithdrawn.valueUsd += reserve.volumeWithdrawn.valueUsd;
      markets[marketId].volumeBorrowed.valueUsd += reserve.volumeBorrowed.valueUsd;
      markets[marketId].volumeRepaid.valueUsd += reserve.volumeRepaid.valueUsd;
      markets[marketId].feesPaidTheoretically.valueUsd += reserve.feesPaidTheoretically.valueUsd;
      markets[marketId].reserves.push(reserve);
    }

    for (const marketKey of Object.keys(markets)) {
      markets[marketKey].totalDeposited.changedValueUsd = calChangesOf_Total_From_Items(
        markets[marketKey].reserves.map((reserve) => {
          return {
            value: reserve.totalDeposited.valueUsd,
            change: reserve.totalDeposited.changedValueUsd ? reserve.totalDeposited.changedValueUsd : 0,
          };
        }),
      );
      markets[marketKey].totalBorrowed.changedValueUsd = calChangesOf_Total_From_Items(
        markets[marketKey].reserves.map((reserve) => {
          return {
            value: reserve.totalBorrowed.valueUsd,
            change: reserve.totalBorrowed.changedValueUsd ? reserve.totalBorrowed.changedValueUsd : 0,
          };
        }),
      );
      markets[marketKey].volumeDeposited.changedValueUsd = calChangesOf_Total_From_Items(
        markets[marketKey].reserves.map((reserve) => {
          return {
            value: reserve.volumeDeposited.valueUsd,
            change: reserve.volumeDeposited.changedValueUsd ? reserve.volumeDeposited.changedValueUsd : 0,
          };
        }),
      );
      markets[marketKey].volumeWithdrawn.changedValueUsd = calChangesOf_Total_From_Items(
        markets[marketKey].reserves.map((reserve) => {
          return {
            value: reserve.volumeWithdrawn.valueUsd,
            change: reserve.volumeWithdrawn.changedValueUsd ? reserve.volumeWithdrawn.changedValueUsd : 0,
          };
        }),
      );
      markets[marketKey].volumeBorrowed.changedValueUsd = calChangesOf_Total_From_Items(
        markets[marketKey].reserves.map((reserve) => {
          return {
            value: reserve.volumeBorrowed.valueUsd,
            change: reserve.volumeBorrowed.changedValueUsd ? reserve.volumeBorrowed.changedValueUsd : 0,
          };
        }),
      );
      markets[marketKey].volumeRepaid.changedValueUsd = calChangesOf_Total_From_Items(
        markets[marketKey].reserves.map((reserve) => {
          return {
            value: reserve.volumeRepaid.valueUsd,
            change: reserve.volumeRepaid.changedValueUsd ? reserve.volumeRepaid.changedValueUsd : 0,
          };
        }),
      );
      markets[marketKey].feesPaidTheoretically.changedValueUsd = calChangesOf_Total_From_Items(
        markets[marketKey].reserves.map((reserve) => {
          return {
            value: reserve.feesPaidTheoretically.valueUsd,
            change: reserve.feesPaidTheoretically.changedValueUsd ? reserve.feesPaidTheoretically.changedValueUsd : 0,
          };
        }),
      );
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
    // Fees = FeesBorrow + FeesBorrowStable
    let feesIn24hs = new BigNumber(currentLast24Hours.totalBorrowed).multipliedBy(
      new BigNumber(currentLast24Hours.rateBorrow),
    );
    if (currentLast24Hours.rateBorrowStable && currentLast24Hours.totalBorrowedStable) {
      feesIn24hs = feesIn24hs.plus(
        new BigNumber(currentLast24Hours.totalBorrowedStable).multipliedBy(
          new BigNumber(currentLast24Hours.rateBorrowStable),
        ),
      );
    }

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

      totalDeposited: transformValueWithTokenPrice(currentLast24Hours, previousLast24Hours, 'totalDeposited'),
      totalBorrowed: transformValueWithTokenPrice(currentLast24Hours, previousLast24Hours, 'totalBorrowed'),

      volumeDeposited: transformValueWithTokenPrice(currentLast24Hours, previousLast24Hours, 'volumeDeposited'),
      volumeWithdrawn: transformValueWithTokenPrice(currentLast24Hours, previousLast24Hours, 'volumeWithdrawn'),
      volumeBorrowed: transformValueWithTokenPrice(currentLast24Hours, previousLast24Hours, 'volumeBorrowed'),
      volumeRepaid: transformValueWithTokenPrice(currentLast24Hours, previousLast24Hours, 'volumeRepaid'),

      feesPaidTheoretically: transformValueWithTokenPrice(
        {
          tokenPrice: currentLast24Hours.tokenPrice,
          feesPaidTheoretically: feesIn24hs.toString(10),
        },
        previousLast24Hours
          ? {
              tokenPrice: previousLast24Hours.tokenPrice,
              feesPaidTheoretically: new BigNumber(previousLast24Hours.totalBorrowed)
                .multipliedBy(new BigNumber(previousLast24Hours.rateBorrow))
                .toString(10),
            }
          : null,
        'feesPaidTheoretically',
      ),

      rateSupply: convertToPercentage(currentLast24Hours.rateSupply),
      rateBorrow: convertToPercentage(currentLast24Hours.rateBorrow),
      rateBorrowStable: currentLast24Hours.rateBorrowStable
        ? convertToPercentage(currentLast24Hours.rateBorrowStable)
        : undefined,
      rateRewardSupply: convertToPercentage(currentLast24Hours.rateRewardSupply),
      rateRewardBorrow: convertToPercentage(currentLast24Hours.rateRewardBorrow),
      rateRewardBorrowStable: currentLast24Hours.rateRewardBorrowStable
        ? convertToPercentage(currentLast24Hours.rateRewardBorrowStable)
        : undefined,
      rateLoanToValue: convertToPercentage(currentLast24Hours.rateLoanToValue),
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
          totalDeposited: snapshot.totalDeposited.valueUsd,
          totalBorrowed: snapshot.totalBorrowed.valueUsd,
          feesPaidTheoretically: snapshot.feesPaidTheoretically.valueUsd,
          volumeDeposited: snapshot.volumeDeposited.valueUsd,
          volumeWithdrawn: snapshot.volumeWithdrawn.valueUsd,
          volumeBorrowed: snapshot.volumeBorrowed.valueUsd,
          volumeRepaid: snapshot.volumeRepaid.valueUsd,
        };
      }),
      'timestamp',
    ).map((item) => {
      return {
        timestamp: item.timestamp,
        totalDeposited: {
          value: item.totalDeposited,
          valueUsd: item.totalDeposited,
        },
        totalBorrowed: {
          value: item.totalBorrowed,
          valueUsd: item.totalBorrowed,
        },
        feesPaidTheoretically: {
          value: item.feesPaidTheoretically,
          valueUsd: item.feesPaidTheoretically,
        },
        volumeDeposited: {
          value: item.volumeDeposited,
          valueUsd: item.volumeDeposited,
        },
        volumeWithdrawn: {
          value: item.volumeWithdrawn,
          valueUsd: item.volumeWithdrawn,
        },
        volumeBorrowed: {
          value: item.volumeBorrowed,
          valueUsd: item.volumeBorrowed,
        },
        volumeRepaid: {
          value: item.volumeRepaid,
          valueUsd: item.volumeRepaid,
        },
      };
    });
  }
}
