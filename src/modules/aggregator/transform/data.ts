import BigNumber from 'bignumber.js';

import { DataValueItem } from '../../../types/aggregates/common';
import { AggCrossLendingMarketSnapshot } from '../../../types/aggregates/lending';
import { CrossLendingMarketDataTimeframeWithChanges } from '../../../types/collectors/lending';
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
}
