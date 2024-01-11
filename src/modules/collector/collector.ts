import { DefaultQueryLogsBlockRange, DefaultQueryLogsRanges } from '../../configs';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { tryQueryBlockTimestamps } from '../../lib/subsgraph';
import { ContextServices, ContextStorages, IProtocolAdapter, IProtocolCollector } from '../../types/namespaces';
import { RunCollectorOptions } from '../../types/options';
import getProtocolAdapters from '../adapters';

export default class ProtocolCollector implements IProtocolCollector {
  public readonly name: string = 'collector';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  private readonly adapters: { [key: string]: IProtocolAdapter };

  constructor(storages: ContextStorages, services: ContextServices) {
    this.services = services;
    this.storages = storages;

    // get all supported adapters
    this.adapters = getProtocolAdapters(services);
  }

  public async run(options: RunCollectorOptions): Promise<void> {
    await this.collectActivities(options);
  }

  protected async collectActivities(options: RunCollectorOptions): Promise<void> {
    let { chain, protocol, fromBlock, force } = options;

    if (!EnvConfig.blockchains[chain]) {
      return;
    }

    const client = this.services.blockchain.getPublicClient(chain);
    const latestBlock = Number(await client.getBlockNumber());
    const stateKey = `collect-activity-${chain}`;

    let startBlock = fromBlock ? fromBlock : 0;
    if (fromBlock && force) {
      startBlock = fromBlock;
    } else {
      const state = await this.storages.database.find({
        collection: EnvConfig.mongodb.collections.states,
        query: {
          name: stateKey,
        },
      });
      if (state) {
        if (startBlock < state.blockNumber) {
          startBlock = state.blockNumber;
        }
      }

      if (startBlock === 0) {
        // sync from latest 1000 blocks
        startBlock = latestBlock - 1000;
      }
    }

    logger.info('start to collect activity events', {
      service: this.name,
      chain: chain,
      fromBlock: startBlock,
      toBlock: latestBlock,
    });

    const blockRange = DefaultQueryLogsRanges[chain] ? DefaultQueryLogsRanges[chain] : DefaultQueryLogsBlockRange;
    while (startBlock <= latestBlock) {
      const startExeTime = Math.floor(new Date().getTime() / 1000);

      const toBlock = startBlock + blockRange > latestBlock ? latestBlock : startBlock + blockRange;
      const logs: Array<any> = await client.getLogs({
        fromBlock: BigInt(startBlock),
        toBlock: BigInt(toBlock),
      });

      const blocktimes = await tryQueryBlockTimestamps(
        EnvConfig.blockchains[chain].blockSubgraph as string,
        startBlock,
        toBlock,
      );

      const actionOperations: Array<any> = [];

      for (const [, adapter] of Object.entries(this.adapters)) {
        if (protocol === undefined || protocol === adapter.config.protocol) {
          const result = await adapter.transformEventLogs({
            chain: chain,
            logs,
          });
          for (const activity of result.activities) {
            actionOperations.push({
              updateOne: {
                filter: {
                  chain: chain,
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
        }
      }

      await this.storages.database.bulkWrite({
        collection: EnvConfig.mongodb.collections.activities,
        operations: actionOperations,
      });

      await this.storages.database.update({
        collection: EnvConfig.mongodb.collections.states,
        keys: {
          name: stateKey,
        },
        updates: {
          name: stateKey,
          blockNumber: toBlock,
        },
        upsert: true,
      });

      const endExeTime = Math.floor(new Date().getTime() / 1000);
      const elapsed = endExeTime - startExeTime;

      logger.info('got activity events', {
        service: this.name,
        chain: chain,
        fromBlock: startBlock,
        toBlock: toBlock,
        logs: logs.length,
        events: actionOperations.length,
        elapses: `${elapsed}s`,
      });

      startBlock += blockRange;
    }
  }
}
