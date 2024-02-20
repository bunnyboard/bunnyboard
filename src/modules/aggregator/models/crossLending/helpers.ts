import { CrossLendingReserveDataTimeframe } from '../../../../types/collectors/crossLending';
import { AggCrossLendingDayData } from '../../../../types/aggregates/crossLending';
import { groupAndSumObjectList } from '../../../../lib/helper';
import { calValueOf_Amount_With_Price } from '../../../../lib/math';
import BigNumber from 'bignumber.js';

export function groupReserveSnapshotsToDayData(reserveSnapshots: Array<CrossLendingReserveDataTimeframe>): Array<AggCrossLendingDayData> {
  return groupAndSumObjectList(
    reserveSnapshots.map((snapshot) => {
      let fees = new BigNumber(snapshot.totalBorrowed)
        .multipliedBy(new BigNumber(snapshot.rateBorrow));
      if (snapshot.rateBorrowStable && snapshot.totalBorrowedStable) {
        fees = fees.plus(new BigNumber(snapshot.totalBorrowedStable).multipliedBy(new BigNumber(snapshot.rateBorrowStable)));
      }

      return {
        timestamp: snapshot.timestamp,
        totalDeposited: calValueOf_Amount_With_Price(snapshot.totalDeposited, snapshot.tokenPrice),
        totalBorrowed: calValueOf_Amount_With_Price(snapshot.totalBorrowed, snapshot.tokenPrice),
        feesPaidTheoretically: calValueOf_Amount_With_Price(fees, snapshot.tokenPrice),
        volumeDeposited: calValueOf_Amount_With_Price(snapshot.volumeDeposited, snapshot.tokenPrice),
        volumeWithdrawn: calValueOf_Amount_With_Price(snapshot.volumeWithdrawn, snapshot.tokenPrice),
        volumeBorrowed: calValueOf_Amount_With_Price(snapshot.volumeBorrowed, snapshot.tokenPrice),
        volumeRepaid: calValueOf_Amount_With_Price(snapshot.volumeRepaid, snapshot.tokenPrice),
      };
    }),
    'timestamp',
  ).map(item => {
    return {
      timestamp: item.timestamp,
      totalDeposited: {
        value: 0,
        valueUsd: item.totalDeposited,
      },
      totalBorrowed: {
        value: 0,
        valueUsd: item.totalBorrowed,
      },
      feesPaidTheoretically: {
        value: 0,
        valueUsd: item.feesPaidTheoretically,
      },
      volumeDeposited: {
        value: 0,
        valueUsd: item.volumeDeposited,
      },
      volumeWithdrawn: {
        value: 0,
        valueUsd: item.volumeWithdrawn,
      },
      volumeBorrowed: {
        value: 0,
        valueUsd: item.volumeBorrowed,
      },
      volumeRepaid: {
        value: 0,
        valueUsd: item.volumeRepaid,
      },
    }
  })
}
