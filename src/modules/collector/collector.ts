import { ProtocolConfigs } from '../../configs';
import { DAY } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { getDateString, getTodayUTCTimestamp, normalizeAddress } from '../../lib/utils';
import { LendingMarketConfig, MasterchefConfig } from '../../types/configs';
import { ContextServices, IProtocolAdapter, IProtocolCollector } from '../../types/namespaces';
import { RunCollectorOptions } from '../../types/options';
import getProtocolAdapters from '../adapters';

export default class ProtocolCollector implements IProtocolCollector {
  public readonly name: string = 'collector';
  public readonly services: ContextServices;

  private readonly adapters: { [key: string]: IProtocolAdapter };

  constructor(services: ContextServices) {
    this.services = services;
    this.adapters = getProtocolAdapters(services);
  }

  public async run(options: RunCollectorOptions): Promise<void> {
    let protocolConfigs = Object.values(ProtocolConfigs);
    if (options.protocol) {
      protocolConfigs = protocolConfigs.filter((item) => item.protocol === options.protocol);
    }

    let lendingMarketConfigs: Array<LendingMarketConfig> = [];
    let masterchefConfigs: Array<MasterchefConfig> = [];

    for (const protocolConfig of protocolConfigs) {
      if (protocolConfig.lendingMarkets) {
        lendingMarketConfigs = lendingMarketConfigs.concat(
          protocolConfig.lendingMarkets.filter((item) => !options.chain || options.chain === item.chain),
        );
      }

      if (protocolConfig.masterchefs) {
        masterchefConfigs = masterchefConfigs.concat(
          protocolConfig.masterchefs.filter((item) => !options.chain || options.chain === item.chain),
        );
      }
    }

    lendingMarketConfigs = lendingMarketConfigs.map((item) => {
      return {
        ...item,
        address: normalizeAddress(item.address),
      };
    });
    masterchefConfigs = masterchefConfigs.map((item) => {
      return {
        ...item,
        address: normalizeAddress(item.address),
      };
    });

    await this.collectLendingMarketSnapshots(lendingMarketConfigs);
    await this.collectMasterchefPoolSnapshots(masterchefConfigs);
  }

  protected async collectLendingMarketSnapshots(marketConfigs: Array<LendingMarketConfig>): Promise<void> {
    if (marketConfigs.length > 0) {
      logger.info('start to update lending market snapshots', {
        service: this.name,
        total: marketConfigs.length,
      });
    }

    for (const marketConfig of marketConfigs) {
      if (!this.adapters[marketConfig.protocol]) {
        logger.warn('ignored to update lending market snapshots', {
          service: this.name,
          protocol: marketConfig.protocol,
          market: marketConfig.address,
        });
        continue;
      }

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

      logger.info('start to update lending market snapshots', {
        service: this.name,
        protocol: marketConfig.protocol,
        chain: marketConfig.chain,
        address: marketConfig.address,
        fromDate: getDateString(startTimestamp),
        toDate: getDateString(todayTimestamp),
      });

      while (startTimestamp <= todayTimestamp) {
        const snapshots = await this.adapters[marketConfig.protocol].getLendingMarketSnapshots({
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

        startTimestamp += DAY;
      }
    }
  }

  protected async collectMasterchefPoolSnapshots(masterchefConfigs: Array<MasterchefConfig>): Promise<void> {
    if (masterchefConfigs.length > 0) {
      logger.info('start to update masterchef pool snapshots', {
        service: this.name,
        total: masterchefConfigs.length,
      });
    }

    for (const masterchefConfig of masterchefConfigs) {
      if (!this.adapters[masterchefConfig.protocol]) {
        logger.warn('ignored to update masterchef pool snapshots', {
          service: this.name,
          protocol: masterchefConfig.protocol,
          address: masterchefConfig.address,
        });
        continue;
      }

      let startTimestamp = masterchefConfig.birthday;
      const latestSnapshot = await this.services.database.find({
        collection: EnvConfig.mongodb.collections.masterchefPoolSnapshots,
        query: {
          chain: masterchefConfig.chain,
          protocol: masterchefConfig.protocol,
          address: masterchefConfig.address,
        },
      });
      const lastTimestamp = latestSnapshot ? Number(latestSnapshot.timestamp) : 0;
      if (lastTimestamp > startTimestamp) {
        startTimestamp = lastTimestamp;
      }

      const todayTimestamp = getTodayUTCTimestamp();

      logger.info('start to update masterchef pool snapshots', {
        service: this.name,
        protocol: masterchefConfig.protocol,
        chain: masterchefConfig.chain,
        address: masterchefConfig.address,
        fromDate: getDateString(startTimestamp),
        toDate: getDateString(todayTimestamp),
      });

      while (startTimestamp <= todayTimestamp) {
        const snapshots = await this.adapters[masterchefConfig.protocol].getMasterchefSnapshots({
          config: masterchefConfig,
          timestamp: startTimestamp,
        });

        if (snapshots) {
          for (const snapshot of snapshots) {
            await this.services.database.update({
              collection: EnvConfig.mongodb.collections.masterchefPoolSnapshots,
              keys: {
                chain: snapshot.chain,
                address: snapshot.address,
                poolId: snapshot.poolId,
                timestamp: snapshot.timestamp,
              },
              updates: {
                ...snapshot,
              },
              upsert: true,
            });
          }
        }

        startTimestamp += DAY;
      }
    }
  }
}
