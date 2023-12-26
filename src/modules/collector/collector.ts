import { ProtocolConfigs } from '../../configs';
import { DAY } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { getDateString, getTimestamp, getTodayUTCTimestamp, normalizeAddress } from '../../lib/utils';
import { LendingMarketConfig, MasterchefConfig } from '../../types/configs';
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
      logger.info('start to update lending market data', {
        service: this.name,
        total: marketConfigs.length,
      });
    }

    for (const marketConfig of marketConfigs) {
      if (!this.adapters[marketConfig.protocol]) {
        logger.warn('ignored to update lending market data', {
          service: this.name,
          protocol: marketConfig.protocol,
          market: marketConfig.address,
        });
        continue;
      }

      // update latest states
      const latestSnapshots = await this.adapters[marketConfig.protocol].getLendingMarketSnapshots({
        config: marketConfig,
        timestamp: getTimestamp(),
      });
      if (latestSnapshots) {
        for (const snapshot of latestSnapshots) {
          if (snapshot.type === 'cross' || !snapshot.collateralToken) {
            await this.storages.database.update({
              collection: EnvConfig.mongodb.collections.lendingMarketStates,
              keys: {
                chain: snapshot.chain,
                protocol: snapshot.protocol,
                address: snapshot.protocol,
                'token.address': snapshot.token.address,
              },
              updates: {
                ...snapshot,
              },
              upsert: true,
            });
          } else {
            // on cdp market, the market id should have collateral token too.
            await this.storages.database.update({
              collection: EnvConfig.mongodb.collections.lendingMarketStates,
              keys: {
                chain: snapshot.chain,
                protocol: snapshot.protocol,
                address: snapshot.protocol,
                'token.address': snapshot.token.address,
                'collateralToken.address': snapshot.collateralToken.address,
              },
              updates: {
                ...snapshot,
              },
              upsert: true,
            });
          }
        }
      }

      let startTimestamp = marketConfig.birthday;
      const latestSnapshot = await this.storages.database.find({
        collection: EnvConfig.mongodb.collections.lendingMarketSnapshots,
        query: {
          chain: marketConfig.chain,
          protocol: marketConfig.protocol,
          address: marketConfig.address,
        },
        options: {
          skip: 0,
          limit: 1,
          order: { timestamp: -1 },
        },
      });
      const lastTimestamp = latestSnapshot ? Number(latestSnapshot.timestamp) : 0;
      if (lastTimestamp > startTimestamp) {
        startTimestamp = lastTimestamp;
      }

      const todayTimestamp = getTodayUTCTimestamp();

      logger.info('start to update lending market data', {
        service: this.name,
        protocol: marketConfig.protocol,
        chain: marketConfig.chain,
        address: marketConfig.address,
        fromDate: getDateString(startTimestamp),
        toDate: getDateString(todayTimestamp),
      });

      while (startTimestamp <= todayTimestamp) {
        const activities = await this.adapters[marketConfig.protocol].getLendingMarketActivities({
          config: marketConfig,
          timestamp: startTimestamp,
        });
        const operations: Array<any> = [];
        for (const activity of activities) {
          operations.push({
            updateOne: {
              filter: {
                chain: activity.chain,
                transactionHash: activity.transactionHash,
                logIndex: activity.logIndex,
              },
              update: {
                $set: {
                  ...activity,
                },
              },
              upsert: true,
            },
          });
        }
        await this.storages.database.bulkWrite({
          collection: EnvConfig.mongodb.collections.lendingMarketActivities,
          operations: operations,
        });

        const snapshots = await this.adapters[marketConfig.protocol].getLendingMarketSnapshots({
          config: marketConfig,
          timestamp: startTimestamp,
        });

        if (snapshots) {
          for (const snapshot of snapshots) {
            await this.storages.database.update({
              collection: EnvConfig.mongodb.collections.lendingMarketSnapshots,
              keys: {
                chain: snapshot.chain,
                protocol: snapshot.protocol,
                address: snapshot.protocol,
                'token.address': snapshot.token.address,
                timestamp: snapshot.timestamp,
              },
              updates: {
                ...snapshot,
              },
              upsert: true,
            });
          }
        }

        logger.info('updated lending market data', {
          service: this.name,
          protocol: marketConfig.protocol,
          chain: marketConfig.chain,
          address: marketConfig.address,
          activities: activities.length,
          snapshots: snapshots ? snapshots.length : 0,
          day: getDateString(startTimestamp),
        });

        startTimestamp += DAY;
      }
    }
  }

  protected async collectMasterchefPoolSnapshots(masterchefConfigs: Array<MasterchefConfig>): Promise<void> {
    if (masterchefConfigs.length > 0) {
      logger.info('start to update masterchef pool data', {
        service: this.name,
        total: masterchefConfigs.length,
      });
    }

    for (const masterchefConfig of masterchefConfigs) {
      if (!this.adapters[masterchefConfig.protocol]) {
        logger.warn('ignored to update masterchef pool data', {
          service: this.name,
          protocol: masterchefConfig.protocol,
          address: masterchefConfig.address,
        });
        continue;
      }

      let startTimestamp = masterchefConfig.birthday;
      const latestSnapshot = await this.storages.database.find({
        collection: EnvConfig.mongodb.collections.masterchefPoolSnapshots,
        query: {
          chain: masterchefConfig.chain,
          protocol: masterchefConfig.protocol,
          address: masterchefConfig.address,
        },
        options: {
          skip: 0,
          limit: 1,
          order: { timestamp: -1 },
        },
      });
      const lastTimestamp = latestSnapshot ? Number(latestSnapshot.timestamp) : 0;
      if (lastTimestamp > startTimestamp) {
        startTimestamp = lastTimestamp;
      }

      const todayTimestamp = getTodayUTCTimestamp();

      logger.info('start to update masterchef pool data', {
        service: this.name,
        protocol: masterchefConfig.protocol,
        chain: masterchefConfig.chain,
        address: masterchefConfig.address,
        fromDate: getDateString(startTimestamp),
        toDate: getDateString(todayTimestamp),
      });

      const latestSnapshots = await this.adapters[masterchefConfig.protocol].getMasterchefSnapshots({
        config: masterchefConfig,
        timestamp: getTimestamp(),
      });

      if (latestSnapshots) {
        for (const snapshot of latestSnapshots) {
          await this.storages.database.update({
            collection: EnvConfig.mongodb.collections.masterchefPoolStates,
            keys: {
              chain: snapshot.chain,
              address: snapshot.address,
              poolId: snapshot.poolId,
            },
            updates: {
              ...snapshot,
            },
            upsert: true,
          });
        }
      }

      while (startTimestamp <= todayTimestamp) {
        const activities = await this.adapters[masterchefConfig.protocol].getMasterchefActivities({
          config: masterchefConfig,
          timestamp: startTimestamp,
        });
        const operations: Array<any> = [];
        for (const activity of activities) {
          operations.push({
            updateOne: {
              filter: {
                chain: activity.chain,
                transactionHash: activity.transactionHash,
                logIndex: activity.logIndex,
              },
              update: {
                $set: {
                  ...activity,
                },
              },
              upsert: true,
            },
          });
        }
        await this.storages.database.bulkWrite({
          collection: EnvConfig.mongodb.collections.masterchefPoolActivities,
          operations: operations,
        });

        const snapshots = await this.adapters[masterchefConfig.protocol].getMasterchefSnapshots({
          config: masterchefConfig,
          timestamp: startTimestamp,
        });

        if (snapshots) {
          for (const snapshot of snapshots) {
            await this.storages.database.update({
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

        logger.info('updated masterchef pool data', {
          service: this.name,
          protocol: masterchefConfig.protocol,
          chain: masterchefConfig.chain,
          address: masterchefConfig.address,
          activities: activities.length,
          snapshots: snapshots ? snapshots.length : 0,
          day: getDateString(startTimestamp),
        });

        startTimestamp += DAY;
      }
    }
  }
}
