import {
  calChangesOf_Current_From_Previous,
  calChangesOf_Total_From_Items,
  calValueOf_Amount_With_Price,
  convertToNumber,
  convertToPercentage,
} from '../../../lib/math';
import { DataValueItem } from '../../../types/aggregates/common';
import {
  AggCdpLendingCollateralSnapshot,
  AggCdpLendingMarketSnapshot,
  AggCrossLendingMarketSnapshot,
} from '../../../types/aggregates/lending';
import { AggPerpetualMarketSnapshot } from '../../../types/aggregates/perpetual';
import {
  CdpLendingMarketDataState,
  CdpLendingMarketDataTimeframe,
  CrossLendingMarketDataState,
  CrossLendingMarketDataTimeframe,
} from '../../../types/collectors/lending';
import { PerpetualMarketDataState, PerpetualMarketDataTimeframe } from '../../../types/collectors/perpetutal';

function transformValueWithTokenPrice(
  dataTimeframeLast24Hours: any,
  dataTimeframeLast48Hours: any | null,
  field: string,
): DataValueItem {
  return {
    value: convertToNumber((dataTimeframeLast24Hours as any)[field]),
    valueUsd: calValueOf_Amount_With_Price(
      (dataTimeframeLast24Hours as any)[field],
      dataTimeframeLast24Hours.tokenPrice,
    ),
    changedValue:
      dataTimeframeLast48Hours && convertToNumber((dataTimeframeLast48Hours as any)[field]) !== 0
        ? calChangesOf_Current_From_Previous(
            (dataTimeframeLast24Hours as any)[field],
            (dataTimeframeLast48Hours as any)[field],
          )
        : undefined,
    changedValueUsd:
      dataTimeframeLast48Hours && convertToNumber((dataTimeframeLast48Hours as any)[field]) !== 0
        ? calChangesOf_Current_From_Previous(
            calValueOf_Amount_With_Price((dataTimeframeLast24Hours as any)[field], dataTimeframeLast24Hours.tokenPrice),
            calValueOf_Amount_With_Price((dataTimeframeLast48Hours as any)[field], dataTimeframeLast48Hours.tokenPrice),
          )
        : undefined,
  };
}

export default class AggregatorTransformModel {
  // CrossLendingMarketDataTimeframe -> AggCrossLendingMarketSnapshot
  public static transformCrossLendingMarketSnapshot(
    timeframeLast24Hours: any,
    timeframeLast48Hours: any,
    currentDataState: any | null,
  ): AggCrossLendingMarketSnapshot {
    const dataTimeframeLast24Hours: CrossLendingMarketDataTimeframe =
      timeframeLast24Hours as CrossLendingMarketDataTimeframe;
    const dataTimeframeLast48Hours: CrossLendingMarketDataTimeframe | null = timeframeLast48Hours
      ? (timeframeLast48Hours as CrossLendingMarketDataTimeframe)
      : null;
    const dataState: CrossLendingMarketDataState = currentDataState ? currentDataState : timeframeLast24Hours;

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
      volumeFeesPaid: transformValueWithTokenPrice(
        dataTimeframeLast24Hours,
        dataTimeframeLast48Hours,
        'volumeFeesPaid',
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

      numberOfUsers: dataTimeframeLast24Hours.numberOfUsers,
      numberOfTransactions: dataTimeframeLast24Hours.numberOfTransactions,
    };
  }

  // CdpLendingMarketDataTimeframe -> AggCdpLendingMarketSnapshot
  public static transformCdpLendingMarketSnapshot(
    timeframeLast24Hours: any,
    timeframeLast48Hours: any,
    currentDataState: any,
  ): AggCdpLendingMarketSnapshot {
    const dataTimeframeLast24Hours: CdpLendingMarketDataTimeframe =
      timeframeLast24Hours as CdpLendingMarketDataTimeframe;
    const dataTimeframeLast48Hours: CdpLendingMarketDataTimeframe | null = timeframeLast48Hours
      ? (timeframeLast48Hours as CdpLendingMarketDataTimeframe)
      : null;
    const dataState: CdpLendingMarketDataState = currentDataState ? currentDataState : timeframeLast24Hours;

    const snapshot: AggCdpLendingMarketSnapshot = {
      metric: dataTimeframeLast24Hours.metric,
      timestamp: dataTimeframeLast24Hours.timestamp,
      timefrom: dataTimeframeLast24Hours.timefrom,
      timeto: dataTimeframeLast24Hours.timeto,

      chain: dataState.chain,
      protocol: dataState.protocol,
      token: dataState.token,
      tokenPrice: convertToNumber(dataState.tokenPrice),

      totalDebts: transformValueWithTokenPrice(dataState, dataTimeframeLast24Hours, 'totalDebts'),

      volumeFeesPaid: transformValueWithTokenPrice(
        dataTimeframeLast24Hours,
        dataTimeframeLast48Hours,
        'volumeFeesPaid',
      ),
      volumeBorrowed: transformValueWithTokenPrice(
        dataTimeframeLast24Hours,
        dataTimeframeLast48Hours,
        'volumeBorrowed',
      ),
      volumeRepaid: transformValueWithTokenPrice(dataTimeframeLast24Hours, dataTimeframeLast48Hours, 'volumeRepaid'),

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

      numberOfUsers: convertToNumber(dataTimeframeLast24Hours.numberOfUsers),
      numberOfTransactions: convertToNumber(dataTimeframeLast24Hours.numberOfTransactions),

      collaterals: [],
    };

    for (let i = 0; i < dataTimeframeLast24Hours.collaterals.length; i++) {
      const collateralSnapshot: AggCdpLendingCollateralSnapshot = {
        address: dataState.collaterals[i].address,

        token: dataState.collaterals[i].token,
        tokenPrice: convertToNumber(dataState.collaterals[i].tokenPrice),

        totalDeposited: {
          value: convertToNumber(dataState.collaterals[i].totalDeposited),
          valueUsd: calValueOf_Amount_With_Price(
            dataState.collaterals[i].totalDeposited,
            dataState.collaterals[i].tokenPrice,
          ),
          changedValue: dataTimeframeLast24Hours
            ? calChangesOf_Current_From_Previous(
                dataState.collaterals[i].totalDeposited,
                dataTimeframeLast24Hours.collaterals[i].totalDeposited,
              )
            : undefined,
          changedValueUsd: dataTimeframeLast24Hours
            ? calChangesOf_Current_From_Previous(
                calValueOf_Amount_With_Price(
                  dataState.collaterals[i].totalDeposited,
                  dataState.collaterals[i].tokenPrice,
                ),
                calValueOf_Amount_With_Price(
                  dataTimeframeLast24Hours.collaterals[i].totalDeposited,
                  dataTimeframeLast24Hours.collaterals[i].tokenPrice,
                ),
              )
            : undefined,
        },

        volumeDeposited: {
          value: convertToNumber(dataTimeframeLast24Hours.collaterals[i].volumeDeposited),
          valueUsd: calValueOf_Amount_With_Price(
            dataTimeframeLast24Hours.collaterals[i].volumeDeposited,
            dataTimeframeLast24Hours.collaterals[i].tokenPrice,
          ),
          changedValue: dataTimeframeLast48Hours
            ? calChangesOf_Current_From_Previous(
                dataTimeframeLast24Hours.collaterals[i].volumeDeposited,
                dataTimeframeLast48Hours.collaterals[i].volumeDeposited,
              )
            : undefined,
          changedValueUsd: dataTimeframeLast48Hours
            ? calChangesOf_Current_From_Previous(
                calValueOf_Amount_With_Price(
                  dataTimeframeLast24Hours.collaterals[i].volumeDeposited,
                  dataTimeframeLast24Hours.collaterals[i].tokenPrice,
                ),
                calValueOf_Amount_With_Price(
                  dataTimeframeLast48Hours.collaterals[i].volumeDeposited,
                  dataTimeframeLast48Hours.collaterals[i].tokenPrice,
                ),
              )
            : undefined,
        },
        volumeWithdrawn: {
          value: convertToNumber(dataTimeframeLast24Hours.collaterals[i].volumeWithdrawn),
          valueUsd: calValueOf_Amount_With_Price(
            dataTimeframeLast24Hours.collaterals[i].volumeWithdrawn,
            dataTimeframeLast24Hours.collaterals[i].tokenPrice,
          ),
          changedValue: dataTimeframeLast48Hours
            ? calChangesOf_Current_From_Previous(
                dataTimeframeLast24Hours.collaterals[i].volumeWithdrawn,
                dataTimeframeLast48Hours.collaterals[i].volumeWithdrawn,
              )
            : undefined,
          changedValueUsd: dataTimeframeLast48Hours
            ? calChangesOf_Current_From_Previous(
                calValueOf_Amount_With_Price(
                  dataTimeframeLast24Hours.collaterals[i].volumeWithdrawn,
                  dataTimeframeLast24Hours.collaterals[i].tokenPrice,
                ),
                calValueOf_Amount_With_Price(
                  dataTimeframeLast48Hours.collaterals[i].volumeWithdrawn,
                  dataTimeframeLast48Hours.collaterals[i].tokenPrice,
                ),
              )
            : undefined,
        },
        volumeLiquidated: {
          value: convertToNumber(dataTimeframeLast24Hours.collaterals[i].volumeLiquidated),
          valueUsd: calValueOf_Amount_With_Price(
            dataTimeframeLast24Hours.collaterals[i].volumeLiquidated,
            dataTimeframeLast24Hours.collaterals[i].tokenPrice,
          ),
          changedValue: dataTimeframeLast48Hours
            ? calChangesOf_Current_From_Previous(
                dataTimeframeLast24Hours.collaterals[i].volumeLiquidated,
                dataTimeframeLast48Hours.collaterals[i].volumeLiquidated,
              )
            : undefined,
          changedValueUsd: dataTimeframeLast48Hours
            ? calChangesOf_Current_From_Previous(
                calValueOf_Amount_With_Price(
                  dataTimeframeLast24Hours.collaterals[i].volumeLiquidated,
                  dataTimeframeLast24Hours.collaterals[i].tokenPrice,
                ),
                calValueOf_Amount_With_Price(
                  dataTimeframeLast48Hours.collaterals[i].volumeLiquidated,
                  dataTimeframeLast48Hours.collaterals[i].tokenPrice,
                ),
              )
            : undefined,
        },

        rateBorrow: convertToPercentage(dataState.collaterals[i].rateBorrow),
        rateRewardBorrow: dataState.collaterals[i].rateRewardBorrow
          ? convertToPercentage(dataState.collaterals[i].rateRewardBorrow)
          : undefined,
        rateLoanToValue: dataState.collaterals[i].rateLoanToValue
          ? convertToPercentage(dataState.collaterals[i].rateLoanToValue)
          : undefined,
      };

      snapshot.totalCollateralDeposited.valueUsd += collateralSnapshot.totalDeposited.valueUsd;
      snapshot.volumeCollateralDeposited.valueUsd += collateralSnapshot.volumeDeposited.valueUsd;
      snapshot.volumeCollateralWithdrawn.valueUsd += collateralSnapshot.volumeWithdrawn.valueUsd;
      snapshot.volumeCollateralLiquidated.valueUsd += collateralSnapshot.volumeLiquidated.valueUsd;

      snapshot.collaterals.push(collateralSnapshot);
    }

    snapshot.totalCollateralDeposited.changedValueUsd = calChangesOf_Total_From_Items(
      snapshot.collaterals.map((collateral) => {
        return {
          value: collateral.totalDeposited.valueUsd,
          change: collateral.totalDeposited.changedValueUsd ? collateral.totalDeposited.changedValueUsd : 0,
        };
      }),
    );
    snapshot.volumeCollateralDeposited.changedValueUsd = calChangesOf_Total_From_Items(
      snapshot.collaterals.map((collateral) => {
        return {
          value: collateral.volumeDeposited.valueUsd,
          change: collateral.volumeDeposited.changedValueUsd ? collateral.volumeDeposited.changedValueUsd : 0,
        };
      }),
    );
    snapshot.volumeCollateralWithdrawn.changedValueUsd = calChangesOf_Total_From_Items(
      snapshot.collaterals.map((collateral) => {
        return {
          value: collateral.volumeWithdrawn.valueUsd,
          change: collateral.volumeWithdrawn.changedValueUsd ? collateral.volumeWithdrawn.changedValueUsd : 0,
        };
      }),
    );
    snapshot.volumeCollateralLiquidated.changedValueUsd = calChangesOf_Total_From_Items(
      snapshot.collaterals.map((collateral) => {
        return {
          value: collateral.volumeLiquidated.valueUsd,
          change: collateral.volumeLiquidated.changedValueUsd ? collateral.volumeLiquidated.changedValueUsd : 0,
        };
      }),
    );

    return snapshot;
  }

  // PerpetualMarketDataTimeframe -> AggPerpetualMarketSnapshot
  public static transformPerpetualMarketSnapshot(
    timeframeLast24Hours: any,
    timeframeLast48Hours: any,
    currentDataState: any,
  ): AggPerpetualMarketSnapshot {
    const dataTimeframeLast24Hours: PerpetualMarketDataTimeframe = timeframeLast24Hours as PerpetualMarketDataTimeframe;
    const dataTimeframeLast48Hours: PerpetualMarketDataTimeframe | null = timeframeLast48Hours
      ? (timeframeLast48Hours as PerpetualMarketDataTimeframe)
      : null;
    const dataState: PerpetualMarketDataState = currentDataState ? currentDataState : timeframeLast24Hours;

    return {
      metric: dataTimeframeLast24Hours.metric,
      timestamp: dataTimeframeLast24Hours.timestamp,
      timefrom: dataTimeframeLast24Hours.timefrom,
      timeto: dataTimeframeLast24Hours.timeto,

      chain: dataState.chain,
      protocol: dataState.protocol,
      address: dataState.address,
      token: dataState.token,
      tokenPrice: convertToNumber(dataState.tokenPrice),

      rateBorrow: convertToNumber(dataState.rateBorrow),

      totalDeposited: transformValueWithTokenPrice(dataState, dataTimeframeLast24Hours, 'totalDeposited'),

      totalOpenInterestLong: {
        value: 0,
        valueUsd: convertToNumber(dataState.totalOpenInterestLongUsd),
        changedValueUsd: calChangesOf_Current_From_Previous(
          dataState.totalOpenInterestLongUsd,
          dataTimeframeLast24Hours.totalOpenInterestLongUsd,
        ),
      },
      totalOpenInterestShort: {
        value: 0,
        valueUsd: convertToNumber(dataState.totalOpenInterestShortUsd),
        changedValueUsd: calChangesOf_Current_From_Previous(
          dataState.totalOpenInterestShortUsd,
          dataTimeframeLast24Hours.totalOpenInterestShortUsd,
        ),
      },

      volumeFeesPaid: {
        value: 0,
        valueUsd: convertToNumber(dataTimeframeLast24Hours.volumeFeesPaidUsd),
        changedValueUsd: dataTimeframeLast48Hours
          ? calChangesOf_Current_From_Previous(
              dataTimeframeLast24Hours.volumeFeesPaidUsd,
              dataTimeframeLast48Hours.volumeFeesPaidUsd,
            )
          : undefined,
      },
      volumeOpenInterestLong: {
        value: 0,
        valueUsd: convertToNumber(dataTimeframeLast24Hours.volumeOpenInterestLongUsd),
        changedValueUsd: dataTimeframeLast48Hours
          ? calChangesOf_Current_From_Previous(
              dataTimeframeLast24Hours.volumeOpenInterestLongUsd,
              dataTimeframeLast48Hours.volumeOpenInterestLongUsd,
            )
          : undefined,
      },
      volumeOpenInterestShort: {
        value: 0,
        valueUsd: convertToNumber(dataTimeframeLast24Hours.volumeOpenInterestShortUsd),
        changedValueUsd: dataTimeframeLast48Hours
          ? calChangesOf_Current_From_Previous(
              dataTimeframeLast24Hours.volumeOpenInterestShortUsd,
              dataTimeframeLast48Hours.volumeOpenInterestShortUsd,
            )
          : undefined,
      },
      volumeLong: {
        value: 0,
        valueUsd: convertToNumber(dataTimeframeLast24Hours.volumeLongUsd),
        changedValueUsd: dataTimeframeLast48Hours
          ? calChangesOf_Current_From_Previous(
              dataTimeframeLast24Hours.volumeLongUsd,
              dataTimeframeLast48Hours.volumeLongUsd,
            )
          : undefined,
      },
      volumeShort: {
        value: 0,
        valueUsd: convertToNumber(dataTimeframeLast24Hours.volumeShortUsd),
        changedValueUsd: dataTimeframeLast48Hours
          ? calChangesOf_Current_From_Previous(
              dataTimeframeLast24Hours.volumeShortUsd,
              dataTimeframeLast48Hours.volumeShortUsd,
            )
          : undefined,
      },
      volumeLiquidated: {
        value: 0,
        valueUsd: convertToNumber(dataTimeframeLast24Hours.volumeLiquidatedUsd),
        changedValueUsd: dataTimeframeLast48Hours
          ? calChangesOf_Current_From_Previous(
              dataTimeframeLast24Hours.volumeLiquidatedUsd,
              dataTimeframeLast48Hours.volumeLiquidatedUsd,
            )
          : undefined,
      },

      numberOfUsers: convertToNumber(dataTimeframeLast24Hours.numberOfUsers),
      numberOfTransactions: convertToNumber(dataTimeframeLast24Hours.numberOfTransactions),
    };
  }
}
