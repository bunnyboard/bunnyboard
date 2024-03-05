import EnvConfig from '../../../../configs/envConfig';
import logger from '../../../../lib/logger';
import { calChangesOf_Total_From_Items } from '../../../../lib/math';
import { IDatabaseService } from '../../../../services/database/domains';
import { AggCdpLendingDataOverall } from '../../../../types/aggregates/cdpLending';
import { DataValue } from '../../../../types/aggregates/common';
import { CdpLendingAssetDataStateWithTimeframes } from '../../../../types/collectors/cdpLending';
import { DataMetrics } from '../../../../types/configs';
import BaseDataAggregator from '../../base';
import CdpLendingDataTransformer from './transform';

const DataFields: Array<string> = [
  'totalValueLocked',
  'totalBorrowed',
  'feesPaidTheoretically',

  'volumeBorrowed',
  'volumeRepaid',

  'totalCollateralDeposited',
  'volumeCollateralDeposited',
  'volumeCollateralWithdrawn',
  'volumeCollateralLiquidated',
];

const OverallDataCachingKey = `CdpLendingOverallData`;

export default class CdpLendingDataAggregator extends BaseDataAggregator {
  public readonly name: string = 'aggregator.cdpLending';

  constructor(database: IDatabaseService) {
    super(database);
  }

  private async getDataOverallInternal(): Promise<AggCdpLendingDataOverall> {
    const dataOverall: AggCdpLendingDataOverall = CdpLendingDataTransformer.getDefaultAggCdpLendingDataOverall();

    // get all cross lending states
    const assetStates = await this.database.query({
      collection: EnvConfig.mongodb.collections.cdpLendingAssetStates.name,
      query: {
        metric: DataMetrics.cdpLending,
      },
    });

    for (const assetState of assetStates) {
      const stateWithTimeframes = assetState as CdpLendingAssetDataStateWithTimeframes;
      const marketSnapshot = CdpLendingDataTransformer.transformCdpLendingMarketSnapshot(
        stateWithTimeframes,
        stateWithTimeframes.last24Hours,
      );

      dataOverall.totalValueLocked.value += marketSnapshot.totalValueLocked.value;
      dataOverall.totalBorrowed.value += marketSnapshot.totalBorrowed.value;
      dataOverall.feesPaidTheoretically.value += marketSnapshot.feesPaidTheoretically.value;

      dataOverall.volumeBorrowed.value += marketSnapshot.volumeBorrowed.value;
      dataOverall.volumeRepaid.value += marketSnapshot.volumeRepaid.value;

      dataOverall.totalCollateralDeposited.value += marketSnapshot.totalCollateralDeposited.value;
      dataOverall.volumeCollateralDeposited.value += marketSnapshot.volumeCollateralDeposited.value;
      dataOverall.volumeCollateralWithdrawn.value += marketSnapshot.volumeCollateralWithdrawn.value;
      dataOverall.volumeCollateralLiquidated.value += marketSnapshot.volumeCollateralLiquidated.value;

      dataOverall.markets.push(marketSnapshot);
    }

    for (const field of DataFields) {
      ((dataOverall as any)[field] as DataValue).changedDay = calChangesOf_Total_From_Items(
        dataOverall.markets.map((item) => {
          return {
            value: (item as any)[field].value,
            change: (item as any)[field].changedDay ? (item as any)[field].changedDay : 0,
          };
        }),
      );
    }

    // process snapshots and build up day data list
    const snapshots = await this.database.query({
      collection: EnvConfig.mongodb.collections.cdpLendingAssetSnapshots.name,
      query: {
        timestamp: { $gt: 0 },
      },
    });
    dataOverall.dayData = CdpLendingDataTransformer.transformCdpLendingDayData(
      snapshots.map((snapshot) => CdpLendingDataTransformer.transformCdpLendingMarketSnapshot(snapshot, null)),
    );

    return dataOverall;
  }

  // get current overall data across all markets
  public async getDataOverall(): Promise<AggCdpLendingDataOverall> {
    const overallData = await this.database.find({
      collection: EnvConfig.mongodb.collections.cachingData.name,
      query: {
        name: OverallDataCachingKey,
      },
    });
    if (overallData) {
      return overallData.data as AggCdpLendingDataOverall;
    } else {
      return await this.getDataOverallInternal();
    }
  }

  public async runUpdate(): Promise<void> {
    const overallData = await this.getDataOverallInternal();
    await this.database.update({
      collection: EnvConfig.mongodb.collections.cachingData.name,
      keys: {
        name: OverallDataCachingKey,
      },
      updates: {
        name: OverallDataCachingKey,
        data: overallData,
      },
      upsert: true,
    });

    logger.info('updated caching data', {
      service: this.name,
      name: OverallDataCachingKey,
    });
  }
}
