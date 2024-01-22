import BigNumber from 'bignumber.js';

import OracleService from '../../services/oracle/oracle';
import { ActivityActions, BaseActivityEvent, TokenAmountItem } from '../../types/domains/base';
import { CrossLendingActivityEvent } from '../../types/domains/lending';

interface LendingDataActivity {
  volumeDeposited: string;
  volumeWithdrawn: string;
  volumeBorrowed: string;
  volumeRepaid: string;
  volumeLiquidated: Array<TokenAmountItem>;
  numberOfUsers: number;
  numberOfTransactions: number;
}

export async function countCrossLendingDataFromActivities(
  activities: Array<CrossLendingActivityEvent>,
): Promise<LendingDataActivity> {
  const oracle = new OracleService();

  let volumeDeposited = new BigNumber(0);
  let volumeWithdrawn = new BigNumber(0);
  let volumeBorrowed = new BigNumber(0);
  let volumeRepaid = new BigNumber(0);
  const volumeLiquidated: { [key: string]: TokenAmountItem } = {};
  const countUsers: { [key: string]: boolean } = {};
  const transactions: { [key: string]: boolean } = {};
  for (const document of activities) {
    const activityEvent = document as BaseActivityEvent;
    const borrower = (activityEvent as CrossLendingActivityEvent).borrower;

    if (!transactions[document.transactionHash]) {
      transactions[document.transactionHash] = true;
    }

    if (!countUsers[activityEvent.user]) {
      countUsers[activityEvent.user] = true;
    }

    if (borrower && !countUsers[borrower]) {
      countUsers[borrower] = true;
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
        const event = activityEvent as CrossLendingActivityEvent;
        if (event.collateralToken && event.collateralAmount) {
          const key = `${document.address}-${event.collateralToken.address}`;
          if (!volumeLiquidated[key]) {
            const tokenPrice = await oracle.getTokenPriceUsd({
              chain: event.collateralToken.chain,
              address: event.collateralToken.address,
              timestamp: document.timestamp,
            });
            volumeLiquidated[key] = {
              token: event.collateralToken,
              amount: '0',
              tokenPrice: tokenPrice ? tokenPrice : ' 0',
            };
          }
          volumeLiquidated[key].amount = new BigNumber(volumeLiquidated[key].amount)
            .plus(new BigNumber(event.collateralAmount.toString()))
            .toString(10);
        }
        break;
      }
    }
  }

  return {
    volumeDeposited: volumeDeposited.toString(10),
    volumeWithdrawn: volumeWithdrawn.toString(10),
    volumeBorrowed: volumeBorrowed.toString(10),
    volumeRepaid: volumeRepaid.toString(10),
    volumeLiquidated: Object.values(volumeLiquidated),
    numberOfUsers: Object.keys(countUsers).length,
    numberOfTransactions: Object.keys(transactions).length,
  };
}
