import { DefaultQueryLogsBlockRange } from '../../configs';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { queryBlockNumberAtTimestamp } from '../../lib/subsgraph';
import { normalizeAddress, sleep } from '../../lib/utils';
import { ContractConfig } from '../../types/configs';
import { ContextServices, IContractLogCollector } from '../../types/namespaces';

export default class ContractLogCollector implements IContractLogCollector {
  public readonly name: string = 'collector.contractLog';
  public readonly services: ContextServices;
  public readonly contracts: Array<ContractConfig>;

  constructor(services: ContextServices, contracts: Array<ContractConfig>) {
    this.services = services;

    // format address contract address to lowercase
    // safe to set config contract address to any format
    this.contracts = [];
    for (const contract of contracts) {
      contract.address = normalizeAddress(contract.address);
      this.contracts.push(contract);
    }
  }

  public async getContractLogs(): Promise<void> {
    logger.info('getting logs from protocol contracts', {
      service: this.name,
      contracts: this.contracts.length,
    });

    for (const contract of this.contracts) {
      let startBlock = 0;

      const stateKey = `index-contract-event-${contract.chain}-${contract.address}`;
      const lastState = await this.services.database.find({
        collection: EnvConfig.mongodb.collections.states,
        query: {
          name: stateKey,
        },
      });
      if (lastState) {
        startBlock = Number(lastState.blockNumber);
      }

      if (startBlock === 0) {
        do {
          startBlock = await queryBlockNumberAtTimestamp(
            EnvConfig.blockchains[contract.chain].blockSubgraph,
            contract.birthday,
          );

          if (startBlock === 0) {
            logger.warn('failed to query block number from subgraph', {
              service: this.name,
              chain: contract.chain,
              timestamp: contract.birthday,
            });
            await sleep(10);
          } else {
            break;
          }
        } while (startBlock === 0);
      }

      const web3 = this.services.blockchain.getProvider(contract.chain);
      const latestBlockNumber = Number(await web3.eth.getBlockNumber());

      logger.info('getting contract logs', {
        service: this.name,
        chain: contract.chain,
        protocol: contract.protocol,
        contract: contract.address,
        topics: contract.topics.length,
        fromBlock: startBlock,
        toBlock: latestBlockNumber,
      });

      while (startBlock < latestBlockNumber) {
        const toBlock =
          startBlock + DefaultQueryLogsBlockRange > latestBlockNumber
            ? latestBlockNumber
            : startBlock + DefaultQueryLogsBlockRange;

        let logs: Array<any> = [];
        for (const topic of contract.topics) {
          if (topic !== '') {
            logs = logs.concat(
              await web3.eth.getPastLogs({
                address: contract.address,
                fromBlock: startBlock,
                toBlock: toBlock,
                topics: [topic],
              }),
            );
          }
        }

        const operations: Array<any> = [];
        for (const log of logs) {
          operations.push({
            updateOne: {
              filter: {
                chain: contract.chain,
                transactionHash: log.transactionHash,
                logIndex: log.logIndex,
              },
              update: {
                $set: {
                  ...log,
                  chain: contract.chain,
                  protocol: contract.protocol,
                  address: normalizeAddress(log.address),
                },
              },
              upsert: true,
            },
          });
        }

        await this.services.database.bulkWrite({
          collection: EnvConfig.mongodb.collections.contractRawlogs,
          operations: operations,
        });

        startBlock += DefaultQueryLogsBlockRange;

        logger.info('got contract logs', {
          service: this.name,
          chain: contract.chain,
          protocol: contract.protocol,
          contract: contract.address,
          logs: logs.length,
          lastBlock: startBlock,
        });
      }
    }
  }
}
