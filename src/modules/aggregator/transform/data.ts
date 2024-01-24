import BigNumber from 'bignumber.js';

import { DataValueItem } from '../../../types/aggregates/common';
import { AggCrossLendingMarketSnapshot, AggCrossLendingMarketState } from '../../../types/aggregates/lending';
import { Token } from '../../../types/configs';

export default class DataTransform {
  public static transformToCrossLendingMarketState(databaseDocument: any): AggCrossLendingMarketState {
    return {
      chain: databaseDocument.chain,
      protocol: databaseDocument.protocol,
      address: databaseDocument.address,
      token: databaseDocument.token as Token,
      tokenPrice: new BigNumber(databaseDocument.tokenPrice).toNumber(),
      totalDeposited: {
        value: new BigNumber(databaseDocument.totalDeposited).toNumber(),
        valueUsd: new BigNumber(databaseDocument.totalDeposited)
          .multipliedBy(new BigNumber(databaseDocument.tokenPrice))
          .toNumber(),
      },
      totalBorrowed: {
        value: new BigNumber(databaseDocument.totalBorrowed).toNumber(),
        valueUsd: new BigNumber(databaseDocument.totalBorrowed)
          .multipliedBy(new BigNumber(databaseDocument.tokenPrice))
          .toNumber(),
      },
      rateSupply: new BigNumber(databaseDocument.rateSupply).multipliedBy(100).toNumber(),
      rateBorrow: new BigNumber(databaseDocument.rateBorrow).multipliedBy(100).toNumber(),
      rateRewardSupply: new BigNumber(databaseDocument.rateRewardSupply).multipliedBy(100).toNumber(),
      rateRewardBorrow: new BigNumber(databaseDocument.rateRewardBorrow).multipliedBy(100).toNumber(),
      rateLoanToValue: new BigNumber(databaseDocument.rateLoanToValue).multipliedBy(100).toNumber(),
      timestamp: databaseDocument.timestamp,
    };
  }

  public static transformToCrossLendingMarketSnapshot(
    databaseDocument: any, // the snapshot of given day
    previousDocument: any = null, // the snapshot of given previous day
  ): AggCrossLendingMarketSnapshot {
    const dataFields: Array<string> = [
      'totalDeposited',
      'totalBorrowed',
      'totalFeesPaid',

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
