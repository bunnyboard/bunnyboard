import { TimeUnits } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { getDateString, getTimestamp, getTodayUTCTimestamp } from '../../lib/utils';
import ExecuteSession from '../../services/executeSession';
import { ChainBoardConfig } from '../../types/configs';
import { ChainBoardDataStateWithTimeframes, ChainBoardDataTimeframe } from '../../types/domains/chainBoard';
import { ContextServices, ContextStorages, IChainBoardAdapter } from '../../types/namespaces';
import { RunChainBoardAdapterOptions } from '../../types/options';

export interface ChainBoardGetDataTimeframeOptions {
  config: ChainBoardConfig;
  fromTime: number;
  toTime: number;
  debug?: boolean;
}

export default class ChainBoardAdapter implements IChainBoardAdapter {
  public readonly name: string = 'adapter.chainBoard';

  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  protected executeSession: ExecuteSession;

  constructor(services: ContextServices, storages: ContextStorages) {
    this.services = services;
    this.storages = storages;
    this.executeSession = new ExecuteSession();
  }

  // implement logic on children class
  public async getDataTimeframe(options: ChainBoardGetDataTimeframeOptions): Promise<ChainBoardDataTimeframe | null> {
    return null;
  }

  public async run(options: RunChainBoardAdapterOptions): Promise<void> {
    this.executeSession.startSession('start to run adapter', {
      service: this.name,
      metric: options.chainConfig.metric,
      chain: options.chainConfig.chain,
      fromTime: options.fromTime ? options.fromTime : 'none',
      force: options.force ? options.force : false,
    });

    // we collect current state data, last 24h data
    const currentTimestamp = getTimestamp();
    const last24hTimestamp = currentTimestamp - TimeUnits.SecondsPerDay;
    const last48hTimestamp = last24hTimestamp - TimeUnits.SecondsPerDay;

    const dataTimeframeLast24h = await this.getDataTimeframe({
      config: options.chainConfig,
      fromTime: last24hTimestamp,
      toTime: currentTimestamp,
      debug: true,
    });
    const dataTimeframeLast48h = await this.getDataTimeframe({
      config: options.chainConfig,
      fromTime: last48hTimestamp,
      toTime: last24hTimestamp,
      debug: true,
    });

    if (dataTimeframeLast24h && dataTimeframeLast48h) {
      const dataState: ChainBoardDataStateWithTimeframes = {
        ...dataTimeframeLast24h,
        last24Hours: dataTimeframeLast48h,
      };
      // save data state to database
      await this.storages.database.update({
        collection: EnvConfig.mongodb.collections.chainBoardStates.name,
        keys: {
          chain: options.chainConfig.chain,
        },
        updates: {
          ...dataState,
        },
        upsert: true,
      });
    } else {
      logger.warn('failed to get data state of last 24h and 48h', {
        service: this.name,
        chain: options.chainConfig.chain,
      });
    }

    this.executeSession.endSession('updated adapter data state', {
      service: this.name,
      chain: options.chainConfig.chain,
      metric: options.chainConfig.metric,
    });

    // we start top update snapshots
    const stateKey = `chainBoard-snapshot-${options.chainConfig.chain}`;
    let runTime = options.fromTime ? options.fromTime : options.chainConfig.birthday;
    if (!options.force) {
      const latestState = await this.storages.database.find({
        collection: EnvConfig.mongodb.collections.cachingStates.name,
        query: {
          name: stateKey,
        },
      });
      if (latestState) {
        runTime = latestState.timestamp > runTime ? latestState.timestamp : runTime;
      }
    }

    const today = getTodayUTCTimestamp();
    logger.info('start to get adapter data snapshots', {
      service: this.name,
      chain: options.chainConfig.chain,
      metric: options.chainConfig.metric,
      fromDate: getDateString(runTime),
      toDate: getDateString(today - TimeUnits.SecondsPerDay),
    });

    while (runTime < today) {
      this.executeSession.startSessionMuted();

      const snapshot = await this.getDataTimeframe({
        config: options.chainConfig,
        fromTime: runTime,
        toTime: runTime + TimeUnits.SecondsPerDay - 1,
        debug: true,
      });

      if (snapshot) {
        // save to database
        await this.storages.database.update({
          collection: EnvConfig.mongodb.collections.chainBoardSnapshots.name,
          keys: {
            chain: snapshot.chain,
            timestamp: snapshot.timestamp,
          },
          updates: {
            ...snapshot,
          },
          upsert: true,
        });
      }

      if (!options.force) {
        await this.storages.database.update({
          collection: EnvConfig.mongodb.collections.cachingStates.name,
          keys: {
            name: stateKey,
          },
          updates: {
            name: stateKey,
            timestamp: runTime,
          },
          upsert: true,
        });
      }

      this.executeSession.endSession('updated adapter data snapshot', {
        service: this.name,
        chain: options.chainConfig.chain,
        metric: options.chainConfig.metric,
        date: getDateString(runTime),
        time: runTime,
      });

      runTime += TimeUnits.SecondsPerDay;
    }
  }
}
