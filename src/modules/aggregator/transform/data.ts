import {
  calChangesOf_Current_From_Previous,
  calValueOf_Amount_With_Price,
  convertToNumber,
  convertToPercentage,
} from '../../../lib/math';
import { DataValueItem } from '../../../types/aggregates/common';
import { AggCrossLendingMarketSnapshot } from '../../../types/aggregates/lending';
import { CrossLendingMarketDataTimeframe } from '../../../types/collectors/lending';

function transformValueWithTokenPrice(
  dataTimeframeLast24Hours: CrossLendingMarketDataTimeframe,
  dataTimeframeLast48Hours: CrossLendingMarketDataTimeframe | null,
  field: string,
): DataValueItem {
  return {
    value: convertToNumber((dataTimeframeLast24Hours as any)[field]),
    valueUsd: calValueOf_Amount_With_Price(
      (dataTimeframeLast24Hours as any)[field],
      dataTimeframeLast24Hours.tokenPrice,
    ),
    changedValue: dataTimeframeLast48Hours
      ? calChangesOf_Current_From_Previous(
          (dataTimeframeLast24Hours as any)[field],
          (dataTimeframeLast48Hours as any)[field],
        )
      : undefined,
    changedValueUsd: dataTimeframeLast48Hours
      ? calChangesOf_Current_From_Previous(
          calValueOf_Amount_With_Price((dataTimeframeLast24Hours as any)[field], dataTimeframeLast24Hours.tokenPrice),
          calValueOf_Amount_With_Price(
            (dataTimeframeLast48Hours as any).totalDeposited,
            dataTimeframeLast48Hours.tokenPrice,
          ),
        )
      : undefined,
  };
}

export default class AggregatorTransformModel {
  // CrossLendingMarketDataTimeframe -> AggCrossLendingMarketSnapshot
  public static transformCrossLendingMarketSnapshot(
    timeframeLast24Hours: any,
    timeframeLast48Hours: any,
  ): AggCrossLendingMarketSnapshot {
    const dataTimeframeLast24Hours: CrossLendingMarketDataTimeframe =
      timeframeLast24Hours as CrossLendingMarketDataTimeframe;
    const dataTimeframeLast48Hours: CrossLendingMarketDataTimeframe | null = timeframeLast48Hours
      ? (timeframeLast48Hours as CrossLendingMarketDataTimeframe)
      : null;

    return {
      metric: dataTimeframeLast24Hours.metric,
      timestamp: dataTimeframeLast24Hours.timestamp,
      timefrom: dataTimeframeLast24Hours.timefrom,
      timeto: dataTimeframeLast24Hours.timeto,

      chain: dataTimeframeLast24Hours.chain,
      protocol: dataTimeframeLast24Hours.protocol,
      address: dataTimeframeLast24Hours.address,
      token: dataTimeframeLast24Hours.token,
      tokenPrice: convertToNumber(dataTimeframeLast24Hours.tokenPrice),

      totalDeposited: transformValueWithTokenPrice(
        dataTimeframeLast24Hours,
        dataTimeframeLast48Hours,
        'totalDeposited',
      ),
      totalBorrowed: transformValueWithTokenPrice(dataTimeframeLast24Hours, dataTimeframeLast48Hours, 'totalBorrowed'),
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
      volumeFeesPaid: transformValueWithTokenPrice(
        dataTimeframeLast24Hours,
        dataTimeframeLast48Hours,
        'volumeFeesPaid',
      ),

      rateSupply: convertToPercentage(dataTimeframeLast24Hours.rateSupply),
      rateBorrow: convertToPercentage(dataTimeframeLast24Hours.rateBorrow),
      rateBorrowStable: dataTimeframeLast24Hours.rateBorrowStable
        ? convertToPercentage(dataTimeframeLast24Hours.rateBorrowStable)
        : undefined,
      rateRewardSupply: convertToPercentage(dataTimeframeLast24Hours.rateRewardSupply),
      rateRewardBorrow: convertToPercentage(dataTimeframeLast24Hours.rateRewardBorrow),
      rateRewardBorrowStable: dataTimeframeLast24Hours.rateRewardBorrowStable
        ? convertToPercentage(dataTimeframeLast24Hours.rateRewardBorrowStable)
        : undefined,
      rateLoanToValue: convertToPercentage(dataTimeframeLast24Hours.rateLoanToValue),

      numberOfUsers: dataTimeframeLast24Hours.numberOfUsers,
      numberOfTransactions: dataTimeframeLast24Hours.numberOfTransactions,
    };
  }
}
