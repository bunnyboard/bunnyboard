import { AggCrossLendingOverallState } from '../../../types/aggregates/lending';

export default class AggregatorTransformHelper {
  public static getDefaultAggCrossLendingOverallState(): AggCrossLendingOverallState {
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
      volumeFeesPaid: {
        value: 0,
        valueUsd: 0,
      },
      markets: [],
      dayData: [],
    };
  }
}
