import BigNumber from 'bignumber.js';

import { calChangesOf_Y_From_XP, calChangesOf_Y_From_X_List, calValueOf_X_Amount_Price_P } from '../../../lib/math';
import { DataValueItem } from '../../../types/aggregates/common';
import { AggCdpLendingMarketSnapshot, AggCrossLendingMarketSnapshot } from '../../../types/aggregates/lending';
import {
  CdpLendingMarketDataTimeframeWithChanges,
  CrossLendingMarketDataTimeframeWithChanges,
} from '../../../types/collectors/lending';
import { Token } from '../../../types/configs';

export default class DataTransform {
  public static transformToCrossLendingMarketState(databaseDocument: any): AggCrossLendingMarketSnapshot {
    const dataWithChanges = databaseDocument as CrossLendingMarketDataTimeframeWithChanges;

    return {
      chain: dataWithChanges.chain,
      protocol: dataWithChanges.protocol,
      address: dataWithChanges.address,
      token: dataWithChanges.token as Token,
      tokenPrice: {
        value: new BigNumber(dataWithChanges.tokenPrice).toNumber(),
        valueUsd: new BigNumber(dataWithChanges.tokenPrice).toNumber(),
        changedValue: new BigNumber(dataWithChanges.dailyChangesTokenPrice).multipliedBy(100).toNumber(),
        changedValueUsd: new BigNumber(dataWithChanges.dailyChangesTokenPrice).multipliedBy(100).toNumber(),
      },
      totalDeposited: {
        value: new BigNumber(dataWithChanges.totalDeposited).toNumber(),
        valueUsd: new BigNumber(dataWithChanges.totalDeposited)
          .multipliedBy(new BigNumber(dataWithChanges.tokenPrice))
          .toNumber(),
        changedValue: new BigNumber(dataWithChanges.dailyChangesTotalDeposited).multipliedBy(100).toNumber(),
      },
      totalBorrowed: {
        value: new BigNumber(dataWithChanges.totalBorrowed).toNumber(),
        valueUsd: new BigNumber(dataWithChanges.totalBorrowed)
          .multipliedBy(new BigNumber(dataWithChanges.tokenPrice))
          .toNumber(),
        changedValue: new BigNumber(dataWithChanges.dailyChangesTotalBorrowed).multipliedBy(100).toNumber(),
      },
      volumeDeposited: {
        value: new BigNumber(dataWithChanges.volumeDeposited).toNumber(),
        valueUsd: new BigNumber(dataWithChanges.volumeDeposited)
          .multipliedBy(new BigNumber(dataWithChanges.tokenPrice))
          .toNumber(),
        changedValue: new BigNumber(dataWithChanges.dailyChangesVolumeDeposited).multipliedBy(100).toNumber(),
      },
      volumeWithdrawn: {
        value: new BigNumber(dataWithChanges.volumeWithdrawn).toNumber(),
        valueUsd: new BigNumber(dataWithChanges.volumeWithdrawn)
          .multipliedBy(new BigNumber(dataWithChanges.tokenPrice))
          .toNumber(),
        changedValue: new BigNumber(dataWithChanges.dailyChangesVolumeWithdrawn).multipliedBy(100).toNumber(),
      },
      volumeBorrowed: {
        value: new BigNumber(dataWithChanges.volumeBorrowed).toNumber(),
        valueUsd: new BigNumber(dataWithChanges.volumeBorrowed)
          .multipliedBy(new BigNumber(dataWithChanges.tokenPrice))
          .toNumber(),
        changedValue: new BigNumber(dataWithChanges.dailyChangesVolumeBorrowed).multipliedBy(100).toNumber(),
      },
      volumeRepaid: {
        value: new BigNumber(dataWithChanges.volumeRepaid).toNumber(),
        valueUsd: new BigNumber(dataWithChanges.volumeRepaid)
          .multipliedBy(new BigNumber(dataWithChanges.tokenPrice))
          .toNumber(),
        changedValue: new BigNumber(dataWithChanges.dailyChangesVolumeRepaid).multipliedBy(100).toNumber(),
      },
      volumeFeesPaid: {
        value: new BigNumber(dataWithChanges.volumeFeesPaid).toNumber(),
        valueUsd: new BigNumber(dataWithChanges.volumeFeesPaid)
          .multipliedBy(new BigNumber(dataWithChanges.tokenPrice))
          .toNumber(),
        changedValue: new BigNumber(dataWithChanges.dailyChangesVolumeFeesPaid).multipliedBy(100).toNumber(),
      },
      rateSupply: new BigNumber(dataWithChanges.rateSupply).multipliedBy(100).toNumber(),
      rateBorrow: new BigNumber(dataWithChanges.rateBorrow).multipliedBy(100).toNumber(),
      rateRewardSupply: new BigNumber(dataWithChanges.rateRewardSupply ? dataWithChanges.rateRewardSupply : '0')
        .multipliedBy(100)
        .toNumber(),
      rateRewardBorrow: new BigNumber(dataWithChanges.rateRewardBorrow ? dataWithChanges.rateRewardBorrow : '0')
        .multipliedBy(100)
        .toNumber(),
      rateLoanToValue: new BigNumber(dataWithChanges.rateLoanToValue).multipliedBy(100).toNumber(),
      numberOfUsers: dataWithChanges.numberOfUsers,
      numberOfTransactions: dataWithChanges.numberOfTransactions,
      timestamp: dataWithChanges.timestamp,
    };
  }

  public static transformToCrossLendingMarketSnapshot(
    databaseDocument: any, // the snapshot of given day
    previousDocument: any = null, // the snapshot of given previous day
  ): AggCrossLendingMarketSnapshot {
    const dataFields: Array<string> = [
      'totalDeposited',
      'totalBorrowed',

      'volumeFeesPaid',
      'volumeDeposited',
      'volumeWithdrawn',
      'volumeBorrowed',
      'volumeRepaid',
    ];

    const snapshotFields: { [key: string]: DataValueItem } = {};
    for (const dataField of dataFields) {
      let change: undefined | number = undefined;
      let changeUsd: undefined | number = undefined;

      snapshotFields[dataField] = {
        value: new BigNumber(databaseDocument[dataField]).toNumber(),
        valueUsd: new BigNumber(databaseDocument[dataField])
          .multipliedBy(new BigNumber(databaseDocument.tokenPrice))
          .toNumber(),
      };

      if (previousDocument) {
        change = new BigNumber(databaseDocument[dataField])
          .minus(new BigNumber(previousDocument[dataField]))
          .multipliedBy(100)
          .dividedBy(new BigNumber(previousDocument[dataField]))
          .toNumber();

        const previousUsd = new BigNumber(previousDocument[dataField]).multipliedBy(
          new BigNumber(previousDocument.tokenPrice),
        );
        const currentUsd = new BigNumber(databaseDocument[dataField]).multipliedBy(
          new BigNumber(databaseDocument.tokenPrice),
        );
        changeUsd = currentUsd.minus(previousUsd).dividedBy(previousUsd).multipliedBy(100).toNumber();

        snapshotFields[dataField].changedValue = change;
        snapshotFields[dataField].changedValueUsd = changeUsd;
      }
    }

    return {
      ...DataTransform.transformToCrossLendingMarketState(databaseDocument),
      ...(snapshotFields as any),
      numberOfUsers: databaseDocument.numberOfUsers,
      numberOfTransactions: databaseDocument.numberOfTransactions,
    };
  }

  public static transformToCdpLendingMarketState(databaseDocument: any): AggCdpLendingMarketSnapshot {
    const dataWithChanges = databaseDocument as CdpLendingMarketDataTimeframeWithChanges;

    const snapshot: AggCdpLendingMarketSnapshot = {
      chain: dataWithChanges.chain,
      protocol: dataWithChanges.protocol,
      token: dataWithChanges.token as Token,
      tokenPrice: {
        value: new BigNumber(dataWithChanges.tokenPrice).toNumber(),
        valueUsd: new BigNumber(dataWithChanges.tokenPrice).toNumber(),
        changedValue: new BigNumber(dataWithChanges.dailyChangesTokenPrice).multipliedBy(100).toNumber(),
        changedValueUsd: new BigNumber(dataWithChanges.dailyChangesTokenPrice).multipliedBy(100).toNumber(),
      },
      totalDebts: {
        value: new BigNumber(dataWithChanges.totalDebts).toNumber(),
        valueUsd: calValueOf_X_Amount_Price_P(dataWithChanges.totalDebts, dataWithChanges.tokenPrice),
        changedValue: new BigNumber(dataWithChanges.dailyChangesTotalDebts).multipliedBy(100).toNumber(),
        changedValueUsd:
          calChangesOf_Y_From_XP(
            dataWithChanges.totalDebts,
            dataWithChanges.dailyChangesTotalDebts,
            dataWithChanges.tokenPrice,
            dataWithChanges.dailyChangesTokenPrice,
          ) * 100,
      },
      totalCollateralDeposited: {
        value: 0,
        valueUsd: 0,
      },
      totalDeposited:
        dataWithChanges.totalDeposited && dataWithChanges.dailyChangesTotalDeposited
          ? {
              value: new BigNumber(dataWithChanges.totalDeposited).toNumber(),
              valueUsd: calValueOf_X_Amount_Price_P(dataWithChanges.totalDeposited, dataWithChanges.tokenPrice),
              changedValue: new BigNumber(dataWithChanges.dailyChangesTotalDeposited).multipliedBy(100).toNumber(),
              changedValueUsd:
                calChangesOf_Y_From_XP(
                  dataWithChanges.totalDeposited,
                  dataWithChanges.dailyChangesTotalDeposited,
                  dataWithChanges.tokenPrice,
                  dataWithChanges.dailyChangesTokenPrice,
                ) * 100,
            }
          : undefined,
      volumeDeposited:
        dataWithChanges.volumeDeposited && dataWithChanges.dailyChangesVolumeDeposited
          ? {
              value: new BigNumber(dataWithChanges.volumeDeposited).toNumber(),
              valueUsd: calValueOf_X_Amount_Price_P(dataWithChanges.volumeDeposited, dataWithChanges.tokenPrice),
              changedValue: new BigNumber(dataWithChanges.dailyChangesVolumeDeposited).multipliedBy(100).toNumber(),
              changedValueUsd:
                calChangesOf_Y_From_XP(
                  dataWithChanges.volumeDeposited,
                  dataWithChanges.dailyChangesVolumeDeposited,
                  dataWithChanges.tokenPrice,
                  dataWithChanges.dailyChangesTokenPrice,
                ) * 100,
            }
          : undefined,
      volumeWithdrawn:
        dataWithChanges.volumeWithdrawn && dataWithChanges.dailyChangesVolumeWithdrawn
          ? {
              value: new BigNumber(dataWithChanges.volumeWithdrawn).toNumber(),
              valueUsd: calValueOf_X_Amount_Price_P(dataWithChanges.volumeWithdrawn, dataWithChanges.tokenPrice),
              changedValue: new BigNumber(dataWithChanges.dailyChangesVolumeWithdrawn).multipliedBy(100).toNumber(),
              changedValueUsd:
                calChangesOf_Y_From_XP(
                  dataWithChanges.volumeWithdrawn,
                  dataWithChanges.dailyChangesVolumeWithdrawn,
                  dataWithChanges.tokenPrice,
                  dataWithChanges.dailyChangesTokenPrice,
                ) * 100,
            }
          : undefined,
      volumeBorrowed: {
        value: new BigNumber(dataWithChanges.volumeBorrowed).toNumber(),
        valueUsd: calValueOf_X_Amount_Price_P(dataWithChanges.volumeBorrowed, dataWithChanges.tokenPrice),
        changedValue: new BigNumber(dataWithChanges.dailyChangesVolumeBorrowed).multipliedBy(100).toNumber(),
        changedValueUsd:
          calChangesOf_Y_From_XP(
            dataWithChanges.volumeBorrowed,
            dataWithChanges.dailyChangesVolumeBorrowed,
            dataWithChanges.tokenPrice,
            dataWithChanges.dailyChangesTokenPrice,
          ) * 100,
      },
      volumeRepaid: {
        value: new BigNumber(dataWithChanges.volumeRepaid).toNumber(),
        valueUsd: calValueOf_X_Amount_Price_P(dataWithChanges.volumeRepaid, dataWithChanges.tokenPrice),
        changedValue: new BigNumber(dataWithChanges.dailyChangesVolumeRepaid).multipliedBy(100).toNumber(),
        changedValueUsd:
          calChangesOf_Y_From_XP(
            dataWithChanges.volumeRepaid,
            dataWithChanges.dailyChangesVolumeRepaid,
            dataWithChanges.tokenPrice,
            dataWithChanges.dailyChangesTokenPrice,
          ) * 100,
      },
      volumeFeesPaid: {
        value: new BigNumber(dataWithChanges.volumeFeesPaid).toNumber(),
        valueUsd: calValueOf_X_Amount_Price_P(dataWithChanges.volumeFeesPaid, dataWithChanges.tokenPrice),
        changedValue: new BigNumber(dataWithChanges.dailyChangesVolumeFeesPaid).multipliedBy(100).toNumber(),
        changedValueUsd:
          calChangesOf_Y_From_XP(
            dataWithChanges.volumeFeesPaid,
            dataWithChanges.dailyChangesVolumeFeesPaid,
            dataWithChanges.tokenPrice,
            dataWithChanges.dailyChangesTokenPrice,
          ) * 100,
      },
      rateSupply: dataWithChanges.rateSupply
        ? new BigNumber(dataWithChanges.rateSupply).multipliedBy(100).toNumber()
        : undefined,
      rateRewardSupply: new BigNumber(dataWithChanges.rateRewardSupply ? dataWithChanges.rateRewardSupply : '0')
        .multipliedBy(100)
        .toNumber(),
      numberOfUsers: dataWithChanges.numberOfUsers,
      numberOfTransactions: dataWithChanges.numberOfTransactions,
      timestamp: dataWithChanges.timestamp,

      collaterals: [],
    };

    for (const collateral of dataWithChanges.collaterals) {
      snapshot.totalCollateralDeposited.valueUsd += calValueOf_X_Amount_Price_P(
        collateral.totalDeposited,
        collateral.tokenPrice,
      );

      snapshot.collaterals.push({
        address: collateral.address,
        token: collateral.token,
        tokenPrice: {
          value: new BigNumber(collateral.tokenPrice).toNumber(),
          valueUsd: new BigNumber(collateral.tokenPrice).toNumber(),
          changedValue: new BigNumber(collateral.dailyChangesTokenPrice).toNumber() * 100,
          changedValueUsd: new BigNumber(collateral.dailyChangesTokenPrice).toNumber() * 100,
        },
        totalDeposited: {
          value: new BigNumber(collateral.totalDeposited).toNumber(),
          valueUsd: calValueOf_X_Amount_Price_P(collateral.totalDeposited, collateral.tokenPrice),
          changedValue: new BigNumber(collateral.dailyChangesTotalDeposited).toNumber() * 100,
          changedValueUsd:
            calChangesOf_Y_From_XP(
              collateral.totalDeposited,
              collateral.dailyChangesTotalDeposited,
              collateral.tokenPrice,
              collateral.dailyChangesTokenPrice,
            ) * 100,
        },
        volumeDeposited: {
          value: new BigNumber(collateral.volumeDeposited).toNumber(),
          valueUsd: calValueOf_X_Amount_Price_P(collateral.volumeDeposited, collateral.tokenPrice),
          changedValue: new BigNumber(collateral.dailyChangesVolumeDeposited).toNumber() * 100,
          changedValueUsd:
            calChangesOf_Y_From_XP(
              collateral.volumeDeposited,
              collateral.dailyChangesVolumeDeposited,
              collateral.tokenPrice,
              collateral.dailyChangesTokenPrice,
            ) * 100,
        },
        volumeWithdrawn: {
          value: new BigNumber(collateral.volumeWithdrawn).toNumber(),
          valueUsd: calValueOf_X_Amount_Price_P(collateral.volumeWithdrawn, collateral.tokenPrice),
          changedValue: new BigNumber(collateral.dailyChangesVolumeWithdrawn).toNumber() * 100,
          changedValueUsd:
            calChangesOf_Y_From_XP(
              collateral.volumeWithdrawn,
              collateral.dailyChangesVolumeWithdrawn,
              collateral.tokenPrice,
              collateral.dailyChangesTokenPrice,
            ) * 100,
        },
        volumeLiquidated: {
          value: new BigNumber(collateral.volumeLiquidated).toNumber(),
          valueUsd: calValueOf_X_Amount_Price_P(collateral.volumeLiquidated, collateral.tokenPrice),
          changedValue: new BigNumber(collateral.dailyChangesVolumeLiquidated).toNumber() * 100,
          changedValueUsd:
            calChangesOf_Y_From_XP(
              collateral.volumeLiquidated,
              collateral.dailyChangesVolumeLiquidated,
              collateral.tokenPrice,
              collateral.dailyChangesTokenPrice,
            ) * 100,
        },

        rateBorrow: new BigNumber(collateral.rateBorrow).toNumber(),
        rateRewardBorrow: collateral.rateRewardBorrow
          ? new BigNumber(collateral.rateRewardBorrow).toNumber()
          : undefined,
        rateLoanToValue: collateral.rateLoanToValue ? new BigNumber(collateral.rateLoanToValue).toNumber() : undefined,
      });
    }

    snapshot.totalCollateralDeposited.changedValueUsd =
      calChangesOf_Y_From_X_List(
        dataWithChanges.collaterals.map((collateral) => {
          return {
            value: new BigNumber(collateral.totalDeposited).multipliedBy(collateral.tokenPrice).toNumber(),
            change: calChangesOf_Y_From_XP(
              collateral.totalDeposited,
              collateral.dailyChangesTotalDeposited,
              collateral.dailyChangesTokenPrice,
              collateral.dailyChangesTokenPrice,
            ),
          };
        }),
      ) * 100;

    return snapshot;
  }
}
