import BigNumber from 'bignumber.js';

import { convertToNumber, convertToPercentage } from '../../../../lib/math';
import {
  AggCrossLendingDataOverall,
  AggCrossLendingMarketSnapshot,
  AggCrossLendingReserveSnapshot,
} from '../../../../types/aggregates/crossLending';
import {
  CrossLendingReserveDataState,
  CrossLendingReserveDataTimeframe,
} from '../../../../types/collectors/crossLending';
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

  public static getDefaultAggCrossLendingMarketSnapshot(
    protocol: string,
    chain: string,
    timestamp: number,
  ): AggCrossLendingMarketSnapshot {
    return {
      protocol,
      chain,
      metric: DataMetrics.crossLending,
      timestamp,
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
      numberOfUsers: 0,
      numberOfTransactions: 0,
      reserves: [],
    };
  }

  public static transformCrossReservesToMarkets(
    reserves: Array<AggCrossLendingReserveSnapshot>,
  ): Array<AggCrossLendingMarketSnapshot> {
    // we transform all reserves to a list of market
    // by grouping protocol and chain

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
          numberOfTransactions: 0,
          numberOfUsers: 0,
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

    return Object.values(markets);
  }

  public static transformCrossLendingMarketSnapshot(
    timeframeLast24Hours: any,
    timeframeLast48Hours: any,
    currentDataState: any | null,
  ): AggCrossLendingReserveSnapshot {
    const dataTimeframeLast24Hours: CrossLendingReserveDataTimeframe =
      timeframeLast24Hours as CrossLendingReserveDataTimeframe;
    const dataTimeframeLast48Hours: CrossLendingReserveDataTimeframe | null = timeframeLast48Hours
      ? (timeframeLast48Hours as CrossLendingReserveDataTimeframe)
      : null;
    const dataState: CrossLendingReserveDataState = currentDataState ? currentDataState : timeframeLast24Hours;

    let feesIn24hs = new BigNumber(timeframeLast24Hours.totalBorrowed)
      .multipliedBy(new BigNumber(timeframeLast24Hours.rateBorrow));
    if (timeframeLast24Hours.rateBorrowStable && timeframeLast24Hours.totalBorrowedStable) {
      feesIn24hs = feesIn24hs.plus(new BigNumber(timeframeLast24Hours.totalBorrowedStable).multipliedBy(new BigNumber(timeframeLast24Hours.rateBorrowStable)));
    }

    return {
      metric: dataState.metric,
      timestamp: dataState.timestamp,
      timefrom: dataTimeframeLast24Hours.timefrom,
      timeto: dataTimeframeLast24Hours.timeto,

      chain: dataState.chain,
      protocol: dataState.protocol,
      address: dataState.address,
      token: dataState.token,
      tokenPrice: convertToNumber(dataState.tokenPrice),

      totalDeposited: transformValueWithTokenPrice(dataState, dataTimeframeLast24Hours, 'totalDeposited'),
      totalBorrowed: transformValueWithTokenPrice(dataState, dataTimeframeLast24Hours, 'totalBorrowed'),

      volumeDeposited: transformValueWithTokenPrice(
        dataTimeframeLast24Hours,
        dataTimeframeLast48Hours,
        'volumeDeposited',
      ),
      volumeWithdrawn: transformValueWithTokenPrice(
        dataTimeframeLast24Hours,
        dataTimeframeLast48Hours,
        'volumeWithdrawn',
      ),
      volumeBorrowed: transformValueWithTokenPrice(
        dataTimeframeLast24Hours,
        dataTimeframeLast48Hours,
        'volumeBorrowed',
      ),
      volumeRepaid: transformValueWithTokenPrice(dataTimeframeLast24Hours, dataTimeframeLast48Hours, 'volumeRepaid'),

      feesPaidTheoretically: transformValueWithTokenPrice(
        {
          tokenPrice: dataTimeframeLast24Hours.tokenPrice,
          feesPaidTheoretically: feesIn24hs.toString(10),
        },
        dataTimeframeLast48Hours
          ? {
              tokenPrice: dataTimeframeLast48Hours.tokenPrice,
              feesPaidTheoretically: new BigNumber(dataTimeframeLast48Hours.totalBorrowed)
                .multipliedBy(new BigNumber(dataTimeframeLast48Hours.rateBorrow))
                .toString(10),
            }
          : undefined,
        'feesPaidTheoretically',
      ),

      rateSupply: convertToPercentage(dataState.rateSupply),
      rateBorrow: convertToPercentage(dataState.rateBorrow),
      rateBorrowStable: dataState.rateBorrowStable ? convertToPercentage(dataState.rateBorrowStable) : undefined,
      rateRewardSupply: convertToPercentage(dataState.rateRewardSupply),
      rateRewardBorrow: convertToPercentage(dataState.rateRewardBorrow),
      rateRewardBorrowStable: dataState.rateRewardBorrowStable
        ? convertToPercentage(dataState.rateRewardBorrowStable)
        : undefined,
      rateLoanToValue: convertToPercentage(dataState.rateLoanToValue),

      numberOfUsers: dataTimeframeLast24Hours.addresses.length,
      numberOfTransactions: dataTimeframeLast24Hours.transactions.length,
    };
  }
}
