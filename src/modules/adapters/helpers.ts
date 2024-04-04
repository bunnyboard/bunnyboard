import BigNumber from 'bignumber.js';

import { ActivityActions, BaseActivityEvent } from '../../types/base';
import { CrossLendingActivityEvent } from '../../types/crossLending';

interface LendingDataActivity {
  volumeDeposited: string;
  volumeWithdrawn: string;
  volumeBorrowed: string;
  volumeRepaid: string;
  volumeLiquidated: string;
  addresses: Array<string>;
  transactions: Array<string>;
}

export function countCrossLendingDataFromActivities(activities: Array<CrossLendingActivityEvent>): LendingDataActivity {
  let volumeDeposited = new BigNumber(0);
  let volumeWithdrawn = new BigNumber(0);
  let volumeBorrowed = new BigNumber(0);
  let volumeRepaid = new BigNumber(0);
  let volumeLiquidated = new BigNumber(0);
  const addresses: { [key: string]: boolean } = {};
  const transactions: { [key: string]: boolean } = {};
  for (const document of activities) {
    const activityEvent = document as BaseActivityEvent;

    if (!transactions[document.transactionHash]) {
      transactions[document.transactionHash] = true;
    }

    if (!addresses[activityEvent.user]) {
      addresses[activityEvent.user] = true;
    }

    switch (activityEvent.action) {
      case ActivityActions.deposit: {
        volumeDeposited = volumeDeposited.plus(new BigNumber(activityEvent.tokenAmount));
        break;
      }
      case ActivityActions.withdraw: {
        volumeWithdrawn = volumeWithdrawn.plus(new BigNumber(activityEvent.tokenAmount));
        break;
      }
      case ActivityActions.borrow: {
        volumeBorrowed = volumeBorrowed.plus(new BigNumber(activityEvent.tokenAmount));
        break;
      }
      case ActivityActions.repay: {
        volumeRepaid = volumeRepaid.plus(new BigNumber(activityEvent.tokenAmount));
        break;
      }
      case ActivityActions.liquidate: {
        volumeLiquidated = volumeRepaid.plus(new BigNumber(activityEvent.tokenAmount));
        break;
      }
    }
  }

  return {
    volumeDeposited: volumeDeposited.toString(10),
    volumeWithdrawn: volumeWithdrawn.toString(10),
    volumeBorrowed: volumeBorrowed.toString(10),
    volumeRepaid: volumeRepaid.toString(10),
    volumeLiquidated: volumeLiquidated.toString(10),
    addresses: Object.keys(addresses),
    transactions: Object.keys(transactions),
  };
}
