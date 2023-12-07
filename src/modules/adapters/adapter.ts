import { DAY } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { queryBlockNumberAtTimestamp } from '../../lib/subsgraph';
import { ProtocolConfig } from '../../types/configs';
import { AddressSnapshot, LendingCdpSnapshot, LendingMarketSnapshot } from '../../types/domains';
import { ContextServices, IProtocolAdapter } from '../../types/namespaces';
import { AdapterAbiConfigs, GetLendingMarketSnapshotOptions } from '../../types/options';

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

  constructor(services: ContextServices, config: ProtocolConfig) {
    this.services = services;
    this.config = config;

    this.abiConfigs = {
      eventSignatures: {},
      eventAbiMappings: {},
    };
  }

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot | LendingCdpSnapshot> | null> {
    return [];
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
      logger.info('getting contract logs', {
        service: this.name,
        chain: options.chain,
        address: options.address,
        topics: options.topics.length,
        fromBlock: dayStartBlock,
        toBlock: dayEndBLock,
      });

      for (const topic of options.topics) {
        logs = await this.services.blockchain.getContractLogs({
          chain: options.chain,
          address: options.address,
          fromBlock: dayStartBlock,
          toBlock: dayEndBLock,
          topics: [topic],
        });
      }
    }

    return logs;
  }
}
