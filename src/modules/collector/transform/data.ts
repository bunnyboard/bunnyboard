import BigNumber from 'bignumber.js';

import { DAY } from '../../../configs/constants';
import {
  CdpCollateralDataState,
  CdpLendingMarketDataState,
  CdpLendingMarketDataTimeframe,
  CdpLendingMarketDataTimeframeWithChanges,
  CrossLendingMarketDataState,
  CrossLendingMarketDataTimeframe,
  CrossLendingMarketDataTimeframeWithChanges,
} from '../../../types/collectors/lending';

export default class CollectorDataTransform {
  public static transformCrossLendingStates(
    state: CrossLendingMarketDataState,
    timeframeLast24Hours: CrossLendingMarketDataTimeframe | undefined,
    timeframeLast48Hours: CrossLendingMarketDataTimeframe | undefined,
  ): CrossLendingMarketDataTimeframeWithChanges {
    const stateWithChanges: CrossLendingMarketDataTimeframeWithChanges = {
      ...state,

      timefrom: state.timestamp - DAY,
      timeto: state.timestamp,

      volumeDeposited: '0',
      volumeWithdrawn: '0',
      volumeBorrowed: '0',
      volumeRepaid: '0',
      volumeLiquidated: [],
      volumeFeesPaid: '0',

      numberOfUsers: 0,
      numberOfTransactions: 0,

      dailyChangesTokenPrice: '0',
      dailyChangesTotalDeposited: '0',
      dailyChangesTotalBorrowed: '0',
      dailyChangesVolumeDeposited: '0',
      dailyChangesVolumeWithdrawn: '0',
      dailyChangesVolumeBorrowed: '0',
      dailyChangesVolumeRepaid: '0',
      dailyChangesVolumeFeesPaid: '0',
    };

    if (timeframeLast24Hours) {
      stateWithChanges.volumeDeposited = timeframeLast24Hours.volumeDeposited;
      stateWithChanges.volumeWithdrawn = timeframeLast24Hours.volumeWithdrawn;
      stateWithChanges.volumeBorrowed = timeframeLast24Hours.volumeBorrowed;
      stateWithChanges.volumeRepaid = timeframeLast24Hours.volumeRepaid;
      stateWithChanges.volumeLiquidated = timeframeLast24Hours.volumeLiquidated;
      stateWithChanges.volumeFeesPaid = timeframeLast24Hours.volumeFeesPaid;
      stateWithChanges.numberOfUsers = timeframeLast24Hours.numberOfUsers;
      stateWithChanges.numberOfTransactions = timeframeLast24Hours.numberOfTransactions;

      if (timeframeLast48Hours) {
        if (timeframeLast24Hours.tokenPrice !== '0') {
          stateWithChanges.dailyChangesTokenPrice = new BigNumber(state.tokenPrice)
            .minus(new BigNumber(timeframeLast24Hours.tokenPrice))
            .dividedBy(new BigNumber(timeframeLast24Hours.tokenPrice))
            .toString(10);
        }

        if (timeframeLast24Hours.totalDeposited !== '0') {
          stateWithChanges.dailyChangesTotalDeposited = new BigNumber(state.totalDeposited)
            .minus(new BigNumber(timeframeLast24Hours.totalDeposited))
            .dividedBy(new BigNumber(timeframeLast24Hours.totalDeposited))
            .toString(10);
        }
        if (timeframeLast24Hours.totalBorrowed !== '0') {
          stateWithChanges.dailyChangesTotalBorrowed = new BigNumber(state.totalBorrowed)
            .minus(new BigNumber(timeframeLast24Hours.totalBorrowed))
            .dividedBy(new BigNumber(timeframeLast24Hours.totalBorrowed))
            .toString(10);
        }

        if (timeframeLast48Hours.volumeDeposited !== '0') {
          stateWithChanges.dailyChangesVolumeDeposited = new BigNumber(timeframeLast24Hours.volumeDeposited)
            .minus(new BigNumber(timeframeLast48Hours.volumeDeposited))
            .dividedBy(new BigNumber(timeframeLast48Hours.volumeDeposited))
            .toString(10);
        }
        if (timeframeLast48Hours.volumeWithdrawn !== '0') {
          stateWithChanges.dailyChangesVolumeWithdrawn = new BigNumber(timeframeLast24Hours.volumeWithdrawn)
            .minus(new BigNumber(timeframeLast48Hours.volumeWithdrawn))
            .dividedBy(new BigNumber(timeframeLast48Hours.volumeWithdrawn))
            .toString(10);
        }
        if (timeframeLast48Hours.volumeBorrowed !== '0') {
          stateWithChanges.dailyChangesVolumeBorrowed = new BigNumber(timeframeLast24Hours.volumeBorrowed)
            .minus(new BigNumber(timeframeLast48Hours.volumeBorrowed))
            .dividedBy(new BigNumber(timeframeLast48Hours.volumeBorrowed))
            .toString(10);
        }
        if (timeframeLast48Hours.volumeRepaid !== '0') {
          stateWithChanges.dailyChangesVolumeRepaid = new BigNumber(timeframeLast24Hours.volumeRepaid)
            .minus(new BigNumber(timeframeLast48Hours.volumeRepaid))
            .dividedBy(new BigNumber(timeframeLast48Hours.volumeRepaid))
            .toString(10);
        }
        if (timeframeLast48Hours.volumeFeesPaid !== '0') {
          stateWithChanges.dailyChangesVolumeFeesPaid = new BigNumber(timeframeLast24Hours.volumeFeesPaid)
            .minus(new BigNumber(timeframeLast48Hours.volumeFeesPaid))
            .dividedBy(new BigNumber(timeframeLast48Hours.volumeFeesPaid))
            .toString(10);
        }

        if (
          state.totalBorrowedStable &&
          timeframeLast24Hours.totalBorrowedStable &&
          timeframeLast24Hours.totalBorrowedStable !== '0'
        ) {
          stateWithChanges.dailyChangesTotalBorrowedStable = new BigNumber(state.totalBorrowedStable)
            .minus(new BigNumber(timeframeLast24Hours.totalBorrowedStable))
            .dividedBy(new BigNumber(timeframeLast24Hours.totalBorrowedStable))
            .toString(10);
        }
      }
    }

    return stateWithChanges;
  }

  public static transformCdpLendingStates(
    state: CdpLendingMarketDataState,
    timeframeLast24Hours: CdpLendingMarketDataTimeframe | undefined,
    timeframeLast48Hours: CdpLendingMarketDataTimeframe | undefined,
  ): CdpLendingMarketDataTimeframeWithChanges {
    const stateWithChanges: CdpLendingMarketDataTimeframeWithChanges = {
      ...state,

      timefrom: state.timestamp - DAY,
      timeto: state.timestamp,

      volumeDeposited: '0',
      volumeWithdrawn: '0',
      volumeBorrowed: '0',
      volumeRepaid: '0',
      volumeFeesPaid: '0',

      numberOfUsers: 0,
      numberOfTransactions: 0,

      dailyChangesTokenPrice: '0',
      dailyChangesTotalDebts: '0',
      dailyChangesTotalDeposited: '0',
      dailyChangesVolumeDeposited: '0',
      dailyChangesVolumeWithdrawn: '0',
      dailyChangesVolumeBorrowed: '0',
      dailyChangesVolumeRepaid: '0',
      dailyChangesVolumeFeesPaid: '0',

      collaterals: state.collaterals.map((item: CdpCollateralDataState) => {
        return {
          ...item,

          volumeDeposited: '0',
          volumeWithdrawn: '0',
          volumeLiquidated: '0',

          dailyChangesTokenPrice: '0',
          dailyChangesTotalDeposited: '0',
          dailyChangesVolumeDeposited: '0',
          dailyChangesVolumeWithdrawn: '0',
          dailyChangesVolumeLiquidated: '0',
        };
      }),
    };

    if (timeframeLast24Hours) {
      stateWithChanges.volumeDeposited = timeframeLast24Hours.volumeDeposited;
      stateWithChanges.volumeWithdrawn = timeframeLast24Hours.volumeWithdrawn;
      stateWithChanges.volumeBorrowed = timeframeLast24Hours.volumeBorrowed;
      stateWithChanges.volumeRepaid = timeframeLast24Hours.volumeRepaid;
      stateWithChanges.volumeFeesPaid = timeframeLast24Hours.volumeFeesPaid;
      stateWithChanges.numberOfUsers = timeframeLast24Hours.numberOfUsers;
      stateWithChanges.numberOfTransactions = timeframeLast24Hours.numberOfTransactions;

      if (timeframeLast48Hours) {
        if (timeframeLast24Hours.tokenPrice !== '0') {
          stateWithChanges.dailyChangesTokenPrice = new BigNumber(state.tokenPrice)
            .minus(new BigNumber(timeframeLast24Hours.tokenPrice))
            .dividedBy(new BigNumber(timeframeLast24Hours.tokenPrice))
            .toString(10);
        }

        if (timeframeLast24Hours.totalDebts !== '0') {
          stateWithChanges.dailyChangesTotalDebts = new BigNumber(state.totalDebts)
            .minus(new BigNumber(timeframeLast24Hours.totalDebts))
            .dividedBy(new BigNumber(timeframeLast24Hours.totalDebts))
            .toString(10);
        }
        if (
          state.totalDeposited &&
          timeframeLast24Hours.totalDeposited &&
          timeframeLast24Hours.totalDeposited !== '0'
        ) {
          stateWithChanges.dailyChangesTotalDeposited = new BigNumber(state.totalDeposited)
            .minus(new BigNumber(timeframeLast24Hours.totalDeposited))
            .dividedBy(new BigNumber(timeframeLast24Hours.totalDeposited))
            .toString(10);
        }
      }
    }

    return stateWithChanges;
  }
}
