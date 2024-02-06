import { AggCdpLendingOverallState, AggCrossLendingOverallState } from '../../../types/aggregates/lending';
import { AggPerpetualOverallState } from '../../../types/aggregates/perpetual';

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

  public static getDefaultAggCdpLendingOverallState(): AggCdpLendingOverallState {
    return {
      totalDebts: {
        value: 0,
        valueUsd: 0,
      },
      volumeFeesPaid: {
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
      totalCollateralDeposited: {
        value: 0,
        valueUsd: 0,
      },
      volumeCollateralDeposited: {
        value: 0,
        valueUsd: 0,
      },
      volumeCollateralWithdrawn: {
        value: 0,
        valueUsd: 0,
      },
      volumeCollateralLiquidated: {
        value: 0,
        valueUsd: 0,
      },
      markets: [],
      dayData: [],
    };
  }

  public static getDefaultAggPerpetualOverallState(): AggPerpetualOverallState {
    return {
      totalDeposited: {
        value: 0,
        valueUsd: 0,
      },
      totalOpenInterestLong: {
        value: 0,
        valueUsd: 0,
      },
      totalOpenInterestShort: {
        value: 0,
        valueUsd: 0,
      },
      volumeFeesPaid: {
        value: 0,
        valueUsd: 0,
      },
      volumeTradingLong: {
        value: 0,
        valueUsd: 0,
      },
      volumeTradingShort: {
        value: 0,
        valueUsd: 0,
      },
      volumeLiquidationLong: {
        value: 0,
        valueUsd: 0,
      },
      volumeLiquidationShort: {
        value: 0,
        valueUsd: 0,
      },
      markets: [],
      dayData: [],
    };
  }
}
