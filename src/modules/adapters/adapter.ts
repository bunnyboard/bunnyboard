import { DAY } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { queryBlockNumberAtTimestamp } from '../../lib/subsgraph';
import { getTodayUTCTimestamp, normalizeAddress } from '../../lib/utils';
import { ProtocolConfig } from '../../types/configs';
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

    // config market address to lowercase
    if (config.lendingMarkets) {
      this.config.lendingMarkets = config.lendingMarkets.map((market) => {
        return {
          ...market,
          address: normalizeAddress(market.address),
        };
      });
    }
    if (config.lendingCdps) {
      this.config.lendingCdps = config.lendingCdps.map((market) => {
        return {
          ...market,
          address: normalizeAddress(market.address),
        };
      });
    }
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
      logs = await this.services.database.query({
        collection: EnvConfig.mongodb.collections.contractRawlogs,
        query: {
          chain: options.chain,
          address: options.address,
          blockNumber: {
            $gte: dayStartBlock,
            $lte: dayEndBLock,
          },
          'topics.0': {
            $in: options.topics,
          },
        },
      });
    }

    return logs;
  }

  public async run(options: RunAdapterOptions): Promise<void> {
    if (options.contractLogCollector) {
      // get logs from all contract belong to the adapter
      await this.contractLogCollector.getContractLogs(options.contractLogCollector);
    }

    if (options.lendingMarketCollector) {
      // collect lending market snapshot if any
      await this.runLendingCollector();
    }
  }

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot | LendingCdpSnapshot> | null> {
    return [];
  }

  protected async runLendingCollector(): Promise<void> {
    const marketConfigs = this.config.lendingMarkets ? this.config.lendingMarkets : [];

    if (marketConfigs.length > 0) {
      logger.info('start to update lending market snapshots', {
        service: this.name,
        total: marketConfigs.length,
      });

      for (const marketConfig of marketConfigs) {
        let startTimestamp = marketConfig.birthday;
        const latestSnapshot = await this.services.database.find({
          collection: EnvConfig.mongodb.collections.lendingMarketSnapshots,
          query: {
            chain: marketConfig.chain,
            protocol: marketConfig.protocol,
            address: marketConfig.address,
          },
        });
        const lastTimestamp = latestSnapshot ? Number(latestSnapshot.timestamp) : 0;
        if (lastTimestamp > startTimestamp) {
          startTimestamp = lastTimestamp;
        }

        const todayTimestamp = getTodayUTCTimestamp();
        while (startTimestamp <= todayTimestamp) {
          const snapshots = await this.getLendingMarketSnapshots({
            config: marketConfig,
            timestamp: startTimestamp,
          });

          if (snapshots) {
            for (const snapshot of snapshots) {
              await this.services.database.update({
                collection: EnvConfig.mongodb.collections.lendingMarketSnapshots,
                keys: {
                  marketId: snapshot.marketId,
                  timestamp: snapshot.timestamp,
                },
                updates: {
                  ...snapshot,
                },
                upsert: true,
              });
            }
          }

          startTimestamp += 24 * 60 * 60;
        }
      }
    }
  }
}
