import { DAY } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { queryBlockNumberAtTimestamp } from '../../lib/subsgraph';
import { sleep } from '../../lib/utils';
import { ContractConfig, ProtocolConfig } from '../../types/configs';
import { AddressSnapshot, LendingCdpSnapshot, LendingMarketSnapshot } from '../../types/domains';
import { ContextServices, IContractLogCollector, IProtocolAdapter } from '../../types/namespaces';
import { AdapterAbiConfigs, GetLendingMarketSnapshotOptions, RunAdapterOptions } from '../../types/options';
import ContractLogCollector from '../collector/contractLog';

export interface GetDayContractLogsOptions {
  chain: string;
  address: string;
  topics: Array<string>;
  dayStartTimestamp: number;
}

export default class ProtocolAdapter implements IProtocolAdapter {
  public readonly name: string = 'adapter';
  public readonly services: ContextServices;
  public readonly config: ProtocolConfig;
  public readonly abiConfigs: AdapterAbiConfigs;
  public readonly contractLogCollector: IContractLogCollector;

  constructor(services: ContextServices, config: ProtocolConfig, abiConfigs: AdapterAbiConfigs) {
    this.services = services;
    this.config = config;
    this.abiConfigs = abiConfigs;

    this.contractLogCollector = new ContractLogCollector(services, []);
  }

  protected async saveAddressSnapshot(options: AddressSnapshot): Promise<void> {
    const existed = await this.services.database.find({
      collection: EnvConfig.mongodb.collections.addressSnapshots,
      query: {
        addressId: options.addressId,
      },
    });
    if (!existed) {
      await this.services.database.update({
        collection: EnvConfig.mongodb.collections.addressSnapshots,
        keys: {
          addressId: options.addressId,
        },
        updates: {
          ...options,
        },
        upsert: true,
      });
      logger.info('saved new address snapshot', {
        service: this.name,
        protocol: options.protocol,
        address: options.address,
        role: options.role,
      });
    }
  }

  protected async getDayContractLogs(options: GetDayContractLogsOptions): Promise<Array<any>> {
    let logs: Array<any> = [];

    const dayStartBlock = await queryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.chain].blockSubgraph,
      options.dayStartTimestamp,
    );
    const dayEndBLock = await queryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.chain].blockSubgraph,
      options.dayStartTimestamp + DAY - 1,
    );
    if (dayStartBlock && dayEndBLock) {
      for (const topic of options.topics) {
        if (topic !== '') {
          logs = logs.concat(
            await this.services.blockchain.getContractLogs({
              chain: options.chain,
              address: options.address,
              fromBlock: dayStartBlock,
              toBlock: dayEndBLock,
              topics: [topic],
            }),
          );
        }
      }
    }

    return logs;
  }

  protected async indexContractLog(config: ContractConfig): Promise<void> {
    let startBlock = 0;
    do {
      startBlock = await queryBlockNumberAtTimestamp(
        EnvConfig.blockchains[config.chain].blockSubgraph,
        config.birthday,
      );

      if (startBlock === 0) {
        logger.warn('failed to query block number from subgraph', {
          service: this.name,
          chain: config.chain,
          timestamp: config.birthday,
        });
        await sleep(10);
      } else {
        break;
      }
    } while (startBlock === 0);

    // get latest block number from database
    // const stateKey = `index-contract-logs-${config.chain}-${normalizeAddress(config.address)}`;
    // const latestState = await this.services.database.find({
    //   collection: EnvConfig.mongodb.collections.states,
    //   query: {
    //
    //   }
    // })
  }

  public async run(options: RunAdapterOptions): Promise<void> {
    // get logs from all contract belong to the adapter
    await this.contractLogCollector.getContractLogs();
  }

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot | LendingCdpSnapshot> | null> {
    return [];
  }
}
