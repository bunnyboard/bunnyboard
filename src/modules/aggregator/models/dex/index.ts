import { TimeUnits } from '../../../../configs/constants';
import EnvConfig from '../../../../configs/envConfig';
import logger from '../../../../lib/logger';
import { calChangesOf_Total_From_Items } from '../../../../lib/math';
import { IDatabaseService } from '../../../../services/database/domains';
import { DataValue } from '../../../../types/aggregates/common';
import { AggDexDataOverall, AggDexDataSnapshot } from '../../../../types/aggregates/dex';
import { DexDataStateWithTimeframes } from '../../../../types/collectors/dex';
import BaseDataAggregator from '../../base';
import DexDataTransformer from './transform';

const OverallDataCachingKey = 'DexOverallData';

export default class DexDataAggregator extends BaseDataAggregator {
  public readonly name: string = 'aggregator.dex';

  constructor(database: IDatabaseService) {
    super(database);
  }

  private async getDataOverallInternal(): Promise<AggDexDataOverall> {
    const dataOverall: AggDexDataOverall = DexDataTransformer.getDefaultDexDataOverall();

    const documentState = await this.database.getCollection(EnvConfig.mongodb.collections.dexDataStates.name);
    const queryCursorState = documentState.find({});

    while (await queryCursorState.hasNext()) {
      const document: any = await queryCursorState.next();
      const stateData = document as DexDataStateWithTimeframes;
      const snapshot = DexDataTransformer.transformDexDataSnapshot(stateData, stateData.last24Hours);

      dataOverall.totalLiquidityUsd.value += snapshot.totalLiquidityUsd.value;
      dataOverall.feesTradingUsd.value += snapshot.feesTradingUsd.value;
      dataOverall.feesTradingCumulativeUsd.value += snapshot.feesTradingCumulativeUsd.value;
      dataOverall.volumeTradingUsd.value += snapshot.volumeTradingUsd.value;
      dataOverall.volumeTradingCumulativeUsd.value += snapshot.volumeTradingCumulativeUsd.value;
      dataOverall.numberOfTraders.value += snapshot.traders.length;
      dataOverall.numberOfTransactions.value += snapshot.numberOfTransactions.value;

      // do not save traders list in overall data
      dataOverall.exchanges.push({
        ...snapshot,
        traders: [],
      });
    }

    const DataFields = [
      'totalLiquidityUsd',
      'feesTradingUsd',
      'feesTradingCumulativeUsd',
      'volumeTradingUsd',
      'volumeTradingCumulativeUsd',
      'numberOfTransactions',
    ];
    for (const field of DataFields) {
      ((dataOverall as any)[field] as DataValue).changedDay = calChangesOf_Total_From_Items(
        dataOverall.exchanges.map((item) => {
          return {
            value: (item as any)[field].value,
            change: (item as any)[field].changedDay ? (item as any)[field].changedDay : 0,
          };
        }),
      );
    }

    const documentSnapshot = await this.database.getCollection(EnvConfig.mongodb.collections.dexDataSnapshots.name);
    const queryCursorSnapshot = documentSnapshot.find({});

    const snapshots: Array<AggDexDataSnapshot> = [];
    while (await queryCursorSnapshot.hasNext()) {
      const document: any = await queryCursorSnapshot.next();
      snapshots.push(DexDataTransformer.transformDexDataSnapshot(document, null));
    }

    dataOverall.dayData = DexDataTransformer.transformDexDayData(snapshots);

    await queryCursorState.close();
    await queryCursorSnapshot.close();

    return dataOverall;
  }

  public async getDataOverall(): Promise<AggDexDataOverall | null> {
    const overallData = await this.database.find({
      collection: EnvConfig.mongodb.collections.cachingData.name,
      query: {
        name: OverallDataCachingKey,
      },
    });
    if (overallData) {
      return overallData.data as AggDexDataOverall;
    } else {
      return null;
    }
  }

  public async getDexDataSnapshot(
    chain: string,
    protocol: string,
    timestamp: number,
  ): Promise<AggDexDataSnapshot | null> {
    if (timestamp > 0) {
      const current = await this.database.find({
        collection: EnvConfig.mongodb.collections.dexDataSnapshots.name,
        query: {
          chain: chain,
          protocol: protocol,
          timestamp: timestamp,
        },
      });
      const previous = await this.database.find({
        collection: EnvConfig.mongodb.collections.dexDataSnapshots.name,
        query: {
          chain: chain,
          protocol: protocol,
          timestamp: timestamp - TimeUnits.SecondsPerDay,
        },
      });

      return current ? DexDataTransformer.transformDexDataSnapshot(current, previous) : null;
    } else {
      const state = await this.database.find({
        collection: EnvConfig.mongodb.collections.dexDataStates.name,
        query: {
          chain: chain,
          protocol: protocol,
        },
      });
      return state ? DexDataTransformer.transformDexDataSnapshot(state, state.last24Hours) : null;
    }
  }

  public async runUpdate(): Promise<void> {
    logger.info('start to update aggregator data', {
      service: this.name,
      name: OverallDataCachingKey,
    });
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

    logger.info('updated aggregator data', {
      service: this.name,
      name: OverallDataCachingKey,
    });
  }
}
