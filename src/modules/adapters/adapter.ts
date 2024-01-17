import { DAY } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { tryQueryBlockNumberAtTimestamp, tryQueryBlockTimestamps } from '../../lib/subsgraph';
import { compareAddress, getDateString } from '../../lib/utils';
import { ProtocolConfig } from '../../types/configs';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';
import {
  AdapterAbiConfigs,
  GetAdapterDataOptions,
  GetAdapterEventLogsOptions,
  GetSnapshotDataResult,
  GetStateDataResult,
  TransformEventLogOptions,
  TransformEventLogResult,
} from '../../types/options';

export default class ProtocolAdapter implements IProtocolAdapter {
  public readonly name: string = 'adapter';
  public readonly services: ContextServices;
  public readonly config: ProtocolConfig;
  public readonly abiConfigs: AdapterAbiConfigs;

  constructor(services: ContextServices, config: ProtocolConfig) {
    this.services = services;
    this.config = config;

    this.abiConfigs = {
      eventSignatures: {},
      eventAbis: {},
    };
  }

  protected supportSignature(signature: string): boolean {
    for (const sig of Object.values(this.abiConfigs.eventSignatures)) {
      if (sig === signature) {
        return true;
      }
    }

    return false;
  }

  protected supportContract(address: string): boolean {
    for (const contract of this.config.configs) {
      if (compareAddress(address, contract.address)) {
        return true;
      }
    }

    return false;
  }

  public async getEventLogs(options: GetAdapterEventLogsOptions): Promise<Array<any>> {
    return [];
  }

  public async transformEventLogs(options: TransformEventLogOptions): Promise<TransformEventLogResult> {
    return {
      activities: [],
    };
  }

  public async getStateData(options: GetAdapterDataOptions): Promise<GetStateDataResult> {
    return {
      data: [],
    };
  }

  public async getSnapshotData(
    options: GetAdapterDataOptions,
    storages: ContextStorages,
  ): Promise<GetSnapshotDataResult> {
    return {
      data: [],
    };
  }

  protected async syncActivities(options: GetAdapterDataOptions, storages: ContextStorages): Promise<void> {
    const startExeTime = Math.floor(new Date().getTime() / 1000);

    const startDayTimestamp = options.timestamp;
    const endDayTimestamp = options.timestamp + DAY - 1;

    const beginBlock = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      startDayTimestamp,
    );
    const endBlock = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      endDayTimestamp,
    );
    const blocktimes = await tryQueryBlockTimestamps(
      EnvConfig.blockchains[options.config.chain].blockSubgraph as string,
      beginBlock,
      endBlock,
    );

    const stateKey = `state-snapshot-${options.config.protocol}-${options.config.chain}-${options.config.metric}-${options.config.address}`;

    const logs = await this.getEventLogs({
      config: options.config,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    const { activities } = await this.transformEventLogs({
      chain: options.config.chain,
      config: options.config,
      logs: logs,
    });

    const activityOperations: Array<any> = [];
    for (const activity of activities) {
      activityOperations.push({
        updateOne: {
          filter: {
            chain: options.config.chain,
            transactionHash: activity.transactionHash,
            logIndex: activity.logIndex,
          },
          update: {
            $set: {
              ...activity,
              timestamp: blocktimes[activity.blockNumber] ? blocktimes[activity.blockNumber] : 0,
            },
          },
          upsert: true,
        },
      });
    }

    await storages.database.bulkWrite({
      collection: EnvConfig.mongodb.collections.activities,
      operations: activityOperations,
    });

    await storages.database.update({
      collection: EnvConfig.mongodb.collections.states,
      keys: {
        name: stateKey,
      },
      updates: {
        name: stateKey,
        timestamp: options.timestamp,
      },
      upsert: true,
    });

    const endExeTime = Math.floor(new Date().getTime() / 1000);
    const elapsed = endExeTime - startExeTime;

    logger.info('sync protocol activities', {
      service: this.name,
      chain: options.config.chain,
      protocol: options.config.protocol,
      metric: options.config.metric,
      address: options.config.address,
      date: getDateString(options.timestamp),
      activities: activityOperations.length,
      elapses: `${elapsed}s`,
    });
  }
}
