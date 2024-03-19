import { TimeUnits } from '../../../../configs/constants';
import EnvConfig from '../../../../configs/envConfig';
import logger from '../../../../lib/logger';
import { calChangesOf_Total_From_Items, calPreviousOf_Current_And_Change } from '../../../../lib/math';
import { IDatabaseService } from '../../../../services/database/domains';
import {
  AggCdpLendingCollateralSnapshot,
  AggCdpLendingDataOverall,
  AggCdpLendingMarketDataOverall,
  AggCdpLendingMarketSnapshot,
} from '../../../../types/aggregates/cdpLending';
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

const OverallDataCachingKey = 'CdpLendingOverallData';

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

    const previousTotalCollateralDeposited = calPreviousOf_Current_And_Change(
      dataOverall.totalCollateralDeposited.value,
      dataOverall.totalCollateralDeposited.changedDay ? dataOverall.totalCollateralDeposited.changedDay : 0,
    );
    const previousTotalBorrowed = calPreviousOf_Current_And_Change(
      dataOverall.totalBorrowed.value,
      dataOverall.totalBorrowed.changedDay ? dataOverall.totalBorrowed.changedDay : 0,
    );
    dataOverall.rateCollateralization = {
      value: (dataOverall.totalCollateralDeposited.value / dataOverall.totalBorrowed.value) * 100,
      changedDay: (previousTotalCollateralDeposited / previousTotalBorrowed) * 100,
    };

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

  // get a list of market data at a given timestamp
  // if the timestamp was zero, return latest state
  public async getMarkets(timestamp: number): Promise<Array<AggCdpLendingMarketSnapshot>> {
    let snapshots: Array<any>;
    if (timestamp === 0) {
      snapshots = await this.database.query({
        collection: EnvConfig.mongodb.collections.cdpLendingAssetStates.name,
        query: {},
      });
    } else {
      snapshots = await this.database.query({
        collection: EnvConfig.mongodb.collections.cdpLendingAssetSnapshots.name,
        query: {
          timestamp: timestamp,
        },
      });
    }

    const markets: Array<AggCdpLendingMarketSnapshot> = [];
    for (const snapshot of snapshots) {
      const previousSnapshot = snapshot.last24Hours
        ? snapshot.last24Hours
        : snapshot.last24Hours
          ? snapshot.last24Hours
          : await this.database.find({
              collection: EnvConfig.mongodb.collections.cdpLendingAssetSnapshots.name,
              query: {
                chain: snapshot.chain,
                protocol: snapshot.protocol,
                'token.address': snapshot.token.address,
                timestamp: snapshot.timestamp - TimeUnits.SecondsPerDay,
              },
            });

      markets.push(CdpLendingDataTransformer.transformCdpLendingMarketSnapshot(snapshot, previousSnapshot));
    }

    return markets;
  }

  // get a market detail includes current states and history day data
  public async getMarket(
    protocol: string,
    chain: string,
    token: string,
  ): Promise<AggCdpLendingMarketDataOverall | null> {
    // get state
    const state = await this.database.find({
      collection: EnvConfig.mongodb.collections.cdpLendingAssetStates.name,
      query: {
        protocol,
        chain,
        'token.address': token,
      },
    });

    if (state) {
      const marketData: AggCdpLendingMarketDataOverall = {
        ...CdpLendingDataTransformer.transformCdpLendingMarketSnapshot(state, state.last24Hours),
        dayData: [],
      };

      const snapshots = await this.database.query({
        collection: EnvConfig.mongodb.collections.cdpLendingAssetSnapshots.name,
        query: {
          protocol,
          chain,
          'token.address': token,
        },
      });

      const marketSnapshots: Array<AggCdpLendingMarketSnapshot> = [];
      for (const snapshot of snapshots) {
        const previousSnapshot = snapshots.filter(
          (item) =>
            item.chain === snapshot.chain &&
            item.protocol === snapshot.protocol &&
            item.token.address === snapshot.token.address &&
            item.timestamp === snapshot.timestamp - TimeUnits.SecondsPerDay,
        )[0];

        marketSnapshots.push(CdpLendingDataTransformer.transformCdpLendingMarketSnapshot(snapshot, previousSnapshot));
      }

      marketData.dayData = CdpLendingDataTransformer.transformCdpLendingDayData(marketSnapshots);

      return marketData;
    }

    return null;
  }

  // get list collateral assets of given market at given timestamp
  // if the timestamp is zero, return current data state
  public async getMarketCollaterals(
    protocol: string,
    chain: string,
    token: string,
    timestamp: number,
  ): Promise<Array<AggCdpLendingCollateralSnapshot>> {
    const collaterals: Array<AggCdpLendingCollateralSnapshot> = [];

    const currentMarketData =
      timestamp === 0
        ? await this.database.find({
            collection: EnvConfig.mongodb.collections.cdpLendingAssetStates.name,
            query: {
              protocol,
              chain,
              'token.address': token,
            },
          })
        : await this.database.find({
            collection: EnvConfig.mongodb.collections.cdpLendingAssetSnapshots.name,
            query: {
              protocol,
              chain,
              'token.address': token,
              timestamp: timestamp,
            },
          });
    const previousMarketData =
      timestamp === 0
        ? currentMarketData.last24Hours
        : await this.database.find({
            collection: EnvConfig.mongodb.collections.cdpLendingAssetSnapshots.name,
            query: {
              protocol,
              chain,
              'token.address': token,
              timestamp: timestamp - TimeUnits.SecondsPerDay,
            },
          });

    if (currentMarketData) {
      for (const collateral of currentMarketData.collaterals) {
        const previousCollateral = previousMarketData
          ? previousMarketData.collaterals.filter(
              (item: any) => item.chain === chain && item.protocol === protocol && item.token.address === token,
            )
          : undefined;

        const snapshot = CdpLendingDataTransformer.transformCdpLendingCollateralSnapshot(
          collateral,
          previousCollateral,
          currentMarketData.tokenPrice,
        );

        collaterals.push(snapshot);
      }
    }

    return collaterals;
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
