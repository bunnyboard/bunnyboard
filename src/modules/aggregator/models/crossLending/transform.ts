import BigNumber from 'bignumber.js';

import { convertToNumber, convertToPercentage } from '../../../../lib/math';
import {
  AggCrossLendingDataOverall,
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
    currentDataState: any | null,
    last24Hours: any,
  ): AggCrossLendingReserveSnapshot {
    const dataState: CrossLendingReserveDataTimeframe = currentDataState;
    const dataTimeframeLast24Hours: CrossLendingReserveDataTimeframe = last24Hours as CrossLendingReserveDataTimeframe;

    let feesIn24hs = new BigNumber(dataState.totalBorrowed).multipliedBy(new BigNumber(dataState.rateBorrow));
    if (dataState.rateBorrowStable && dataState.totalBorrowedStable) {
      feesIn24hs = feesIn24hs.plus(
        new BigNumber(dataState.totalBorrowedStable).multipliedBy(new BigNumber(dataState.rateBorrowStable)),
      );
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

      volumeDeposited: transformValueWithTokenPrice(dataState, dataTimeframeLast24Hours, 'volumeDeposited'),
      volumeWithdrawn: transformValueWithTokenPrice(dataState, dataTimeframeLast24Hours, 'volumeWithdrawn'),
      volumeBorrowed: transformValueWithTokenPrice(dataState, dataTimeframeLast24Hours, 'volumeBorrowed'),
      volumeRepaid: transformValueWithTokenPrice(dataState, dataTimeframeLast24Hours, 'volumeRepaid'),

      feesPaidTheoretically: transformValueWithTokenPrice(
        {
          tokenPrice: dataState.tokenPrice,
          feesPaidTheoretically: feesIn24hs.toString(10),
        },
        {
          tokenPrice: dataTimeframeLast24Hours.tokenPrice,
          feesPaidTheoretically: new BigNumber(dataTimeframeLast24Hours.totalBorrowed)
            .multipliedBy(new BigNumber(dataTimeframeLast24Hours.rateBorrow))
            .toString(10),
        },
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
