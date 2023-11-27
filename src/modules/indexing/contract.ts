import Web3 from 'web3';

import { DefaultQueryLogsBlockRange } from '../../configs';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { queryBlockNumberAtTimestamp, queryBlockTimestamps } from '../../lib/subsgraph';
import { compareAddress, formatTime, sleep } from '../../lib/utils';
import { ContractConfig } from '../../types/configs';
import { ContextServices, IContractIndexing } from '../../types/namespaces';
import { ContractIndexingOptions } from '../../types/options';

// this indexing
export default class ContractIndexing implements IContractIndexing {
  public readonly name: string = 'indexer';
  public readonly services: ContextServices;

  constructor(services: ContextServices) {
    this.services = services;
  }

  private async indexContract(contractConfig: ContractConfig): Promise<void> {
    let startBlock = 0;

    const stateKey = `indexing-contract-${contractConfig.chain}-${contractConfig.address}`;
    const state = await this.services.database.find({
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

    while (startBlock === 0) {
      startBlock = await queryBlockNumberAtTimestamp(
        EnvConfig.blockchains[contractConfig.chain].blockSubgraph,
        contractConfig.birthday,
      );

      if (startBlock === 0) {
        await sleep(5);
      }
    }

    const web3 = new Web3(EnvConfig.blockchains[contractConfig.chain].nodeRpc);
    const oldBlock = await web3.eth.getBlock(startBlock);
    const latestBlock = Number(await web3.eth.getBlockNumber());

    logger.info('start index contract logs', {
      service: this.name,
      chain: contractConfig.chain,
      address: contractConfig.address,
      fromBlock: startBlock,
      age: formatTime(Number(oldBlock.timestamp)),
    });

    while (startBlock <= latestBlock) {
      const startExeTime = Math.floor(new Date().getTime() / 1000);

      const toBlock =
        startBlock + DefaultQueryLogsBlockRange > latestBlock ? latestBlock : startBlock + DefaultQueryLogsBlockRange;

      const blocktimes = await queryBlockTimestamps(
        EnvConfig.blockchains[contractConfig.chain].blockSubgraph as string,
        startBlock,
        toBlock,
      );

      if (blocktimes) {
        const logs: Array<any> = await web3.eth.getPastLogs({
          fromBlock: startBlock,
          toBlock,
          address: contractConfig.address,
        });

        const operations: Array<any> = [];
        for (const log of logs) {
          let matching = false;

          for (const filter of contractConfig.logFilters) {
            if (log.topics[0] === filter.topic0) {
              matching = true;

              matching = !(filter.topic1 && filter.topic1 !== log.topics[1]);
              matching = !(filter.topic2 && filter.topic2 !== log.topics[2]);
              matching = !(filter.topic3 && filter.topic3 !== log.topics[3]);
            }
          }

          if (matching) {
            operations.push({
              updateOne: {
                filter: {
                  chain: contractConfig.chain,
                  transactionHash: log.transactionHash,
                  logIndex: log.logIndex,
                },
                update: {
                  $set: {
                    ...log,
                    timestamp: blocktimes[log.blockNumber] ? blocktimes[log.blockNumber] : 0,
                  },
                },
                upsert: true,
              },
            });
          }
        }

        await this.services.database.bulkWrite({
          collection: EnvConfig.mongodb.collections.rawlogs,
          operations: operations,
        });

        await this.services.database.update({
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

        logger.info('got contract logs', {
          service: this.name,
          chain: contractConfig.chain,
          address: contractConfig.address,
          logs: `${operations.length}/${logs.length}`,
          toBlock: toBlock,
          age: formatTime(blocktimes[toBlock]),
          elapses: `${elapsed}s`,
        });

        startBlock += DefaultQueryLogsBlockRange;
      } else {
        logger.warn('failed to get block timestamp', {
          service: this.name,
          chain: contractConfig.chain,
          fromBlock: startBlock,
          toBlock: toBlock,
        });
        await sleep(5);
      }
    }
  }

  public async run(options: ContractIndexingOptions): Promise<void> {
    const { chain, address } = options;

    if (!EnvConfig.blockchains[chain]) {
      return;
    }

    // get contract configs
    const contractConfigs: Array<ContractConfig> = await this.services.database.query({
      collection: EnvConfig.mongodb.collections.contracts,
      query: {
        chain: chain,
      },
    });

    for (const contractConfig of contractConfigs) {
      if (!address || compareAddress(address, contractConfig.address)) {
        await this.indexContract(contractConfig);
      }
    }
  }
}
