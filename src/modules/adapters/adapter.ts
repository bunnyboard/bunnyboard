import { DAY } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import { createDataKeyHash } from '../../lib/crypto';
import logger from '../../lib/logger';
import { tryQueryBlockNumberAtTimestamp } from '../../lib/subsgraph';
import { ProtocolConfig } from '../../types/configs';
import { LendingCdpSnapshot, LendingMarketSnapshot } from '../../types/domains/lending';
import { MasterchefPoolSnapshot } from '../../types/domains/masterchef';
import { ContextServices, IProtocolAdapter } from '../../types/namespaces';
import { AdapterAbiConfigs, GetLendingMarketSnapshotOptions, GetMasterchefSnapshotOptions } from '../../types/options';

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

  public async getMasterchefSnapshots(
    options: GetMasterchefSnapshotOptions,
  ): Promise<Array<MasterchefPoolSnapshot> | null> {
    return [];
  }

  protected async getDayContractLogs(options: GetDayContractLogsOptions): Promise<Array<any>> {
    const cachingKey = createDataKeyHash(JSON.stringify(options));
    const cachingData = await this.services.database.find({
      collection: EnvConfig.mongodb.collections.caching,
      query: {
        name: cachingKey,
      },
    });
    if (cachingData) {
      return cachingData.logs;
    }

    let logs: Array<any> = [];

    const dayStartBlock = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.chain].blockSubgraph,
      options.dayStartTimestamp,
    );
    const dayEndBLock = await tryQueryBlockNumberAtTimestamp(
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

    try {
      await this.services.database.update({
        collection: EnvConfig.mongodb.collections.caching,
        keys: {
          name: cachingKey,
        },
        updates: {
          name: cachingKey,
          logs: logs,
        },
        upsert: true,
      });
    } catch (e: any) {}

    return logs;
  }
}
