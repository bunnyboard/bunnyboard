import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import AdapterCurveIrmAbi from '../../../configs/abi/morpho/AdapterCurveIrm.json';
import MorphoBlueAbi from '../../../configs/abi/morpho/MorphoBlue.json';
import MorphoOracleAbi from '../../../configs/abi/morpho/MorphoOracle.json';
import { AddressZero, TimeUnits } from '../../../configs/constants';
import envConfig from '../../../configs/envConfig';
import { ChainNames } from '../../../configs/names';
import logger from '../../../lib/logger';
import { formatBigNumberToString, getTimestamp, normalizeAddress } from '../../../lib/utils';
import { IsolatedLendingMarketConfig, ProtocolConfig } from '../../../types/configs';
import { IsolatedLendingPoolDataTimeframe, IsolatedLendingPoolMetadata } from '../../../types/domains/isolatedLending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions, RunAdapterOptions } from '../../../types/options';
import IsolatedLendingProtocolAdapter from '../isolatedLending';
import { MorphoEventSignatures } from './abis';
import MorphoMarkets from '../../../configs/data/statics/MorphoBlueMarkets.json';

interface MorphoBluePoolMetadata extends IsolatedLendingPoolMetadata {
  oracle: string;
  irm: string;
  ltv: string;
}

interface GetMarketInfoOptions {
  marketConfig: IsolatedLendingMarketConfig;

  // contract event log
  log: any;
}

interface GetMarketDataOptions {
  marketConfig: IsolatedLendingMarketConfig;
  poolMetadata: MorphoBluePoolMetadata;

  beginBlock: number;
  endBlock: number;
  stateBlock: number;

  fromTime: number;
  toTime: number;
  stateTime: number;

  morphoBlueLogs: Array<any>;
  morphoBlueDatabaseLogs: Array<any>;
}

export default class MorphoAdapter extends IsolatedLendingProtocolAdapter {
  public readonly name: string = 'adapter.morpho 🦋';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  private async getMarketInfoFromLog(options: GetMarketInfoOptions): Promise<MorphoBluePoolMetadata | null> {
    const event: any = decodeEventLog({
      abi: MorphoBlueAbi,
      topics: options.log.topics,
      data: options.log.data,
    });

    const block = await this.services.blockchain.getBlock(options.marketConfig.chain, Number(options.log.blockNumber));
    const marketId = event.args.id;
    const debtToken = await this.services.blockchain.getTokenInfo({
      chain: options.marketConfig.chain,
      address: event.args.marketParams.loanToken.toString(),
    });
    const collateral = await this.services.blockchain.getTokenInfo({
      chain: options.marketConfig.chain,
      address: event.args.marketParams.collateralToken.toString(),
    });
    if (debtToken && collateral) {
      const lendingPool: MorphoBluePoolMetadata = {
        chain: options.marketConfig.chain,
        protocol: options.marketConfig.protocol,
        version: options.marketConfig.version,
        address: normalizeAddress(options.marketConfig.address),
        poolId: marketId,
        birthblock: Number(options.log.blockNumber),
        birthday: Number(block.timestamp),
        debtToken,
        collaterals: [collateral],
        oracle: normalizeAddress(event.args.marketParams.oracle.toString()),
        irm: normalizeAddress(event.args.marketParams.irm.toString()),
        ltv: event.args.marketParams.lltv.toString(),
      };

      return lendingPool;
    }

    return null;
  }

  private async getMarketData(options: GetMarketDataOptions): Promise<IsolatedLendingPoolDataTimeframe | null> {
    if (
      options.poolMetadata.oracle === AddressZero ||
      options.poolMetadata.irm === AddressZero ||
      options.poolMetadata.birthday > options.stateTime
    ) {
      return null;
    }

    const debtTokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: options.poolMetadata.debtToken.chain,
      address: options.poolMetadata.debtToken.address,
      timestamp: options.stateTime,
    });
    if (debtTokenPrice) {
      const [totalSupplyAssets, totalSupplyShares, totalBorrowAssets, totalBorrowShares, lastUpdate, fee] =
        await this.services.blockchain.readContract({
          chain: options.marketConfig.chain,
          abi: MorphoBlueAbi,
          target: options.marketConfig.address,
          method: 'market',
          params: [options.poolMetadata.poolId],
          blockNumber: options.stateBlock,
        });

      const [borrowRateView, collateralPrice] = await this.services.blockchain.multicall({
        chain: options.marketConfig.chain,
        calls: [
          {
            abi: AdapterCurveIrmAbi,
            target: options.poolMetadata.irm,
            method: 'borrowRateView',
            params: [
              [
                options.poolMetadata.debtToken.address, // loanToken
                options.poolMetadata.collaterals[0].address, // collateralToken
                options.poolMetadata.oracle, // oracle
                options.poolMetadata.irm, // irm
                options.poolMetadata.ltv, // ltv
              ],
              [
                totalSupplyAssets.toString(),
                totalSupplyShares.toString(),
                totalBorrowAssets.toString(),
                totalBorrowShares.toString(),
                lastUpdate.toString(),
                fee.toString(),
              ],
            ],
          },
          {
            abi: MorphoOracleAbi,
            target: options.poolMetadata.oracle,
            method: 'price',
            params: [],
          },
        ],
        blockNumber: options.stateBlock,
      });

      // https://docs.morpho.org/morpho-blue/contracts/oracles/#price
      const collateralPriceUsd = collateralPrice
        ? new BigNumber(
            formatBigNumberToString(
              collateralPrice.toString(),
              36 + options.poolMetadata.debtToken.decimals - options.poolMetadata.collaterals[0].decimals,
            ),
          )
            .multipliedBy(new BigNumber(debtTokenPrice))
            .toString(10)
        : '0';

      // borrowRatePerSecond from Morpho Irm
      const borrowRate = new BigNumber(borrowRateView.toString()).dividedBy(1e18);

      // compound per day
      const borrowAPY = new BigNumber(1)
        .plus(borrowRate.multipliedBy(TimeUnits.SecondsPerYear).dividedBy(TimeUnits.DaysPerYear))
        .pow(TimeUnits.DaysPerYear)
        .minus(1);

      // supplyAPY = borrowAPY x utilization x (1 - fee)
      const supplyApy = new BigNumber(totalBorrowAssets.toString()).gt(0)
        ? borrowAPY.multipliedBy(new BigNumber(totalBorrowAssets.toString()).dividedBy(totalSupplyAssets.toString()))
        : new BigNumber(0);

      let volumeDeposited = new BigNumber(0);
      let volumeWithdrawn = new BigNumber(0);
      let volumeBorrowed = new BigNumber(0);
      let volumeRepaid = new BigNumber(0);
      let volumeCollateralDeposited = new BigNumber(0);
      let volumeCollateralWithdrawn = new BigNumber(0);
      let volumeCollateralLiquidated = new BigNumber(0);
      const addresses: { [key: string]: boolean } = {};
      const transactions: { [key: string]: boolean } = {};
      for (const log of options.morphoBlueLogs) {
        const signature = log.topics[0];
        if (Object.values(MorphoEventSignatures).indexOf(signature) !== -1) {
          const event: any = decodeEventLog({
            abi: MorphoBlueAbi,
            topics: log.topics,
            data: log.data,
          });

          if (options.poolMetadata.poolId === event.args.id) {
            transactions[log.transactionHash] = true;
            for (const field of ['caller', 'onBehalf', 'borrower', 'receiver']) {
              if (event.args[field]) {
                addresses[normalizeAddress(event.args[field])] = true;
              }
            }

            switch (signature) {
              case MorphoEventSignatures.Supply: {
                volumeDeposited = volumeDeposited.plus(
                  new BigNumber(
                    formatBigNumberToString(event.args.assets.toString(), options.poolMetadata.debtToken.decimals),
                  ),
                );
                break;
              }
              case MorphoEventSignatures.Withdraw: {
                volumeWithdrawn = volumeWithdrawn.plus(
                  new BigNumber(
                    formatBigNumberToString(event.args.assets.toString(), options.poolMetadata.debtToken.decimals),
                  ),
                );
                break;
              }
              case MorphoEventSignatures.Borrow: {
                volumeBorrowed = volumeBorrowed.plus(
                  new BigNumber(
                    formatBigNumberToString(event.args.assets.toString(), options.poolMetadata.debtToken.decimals),
                  ),
                );
                break;
              }
              case MorphoEventSignatures.Repay: {
                volumeRepaid = volumeRepaid.plus(
                  new BigNumber(
                    formatBigNumberToString(event.args.assets.toString(), options.poolMetadata.debtToken.decimals),
                  ),
                );
                break;
              }
              case MorphoEventSignatures.SupplyCollateral: {
                volumeCollateralDeposited = volumeCollateralDeposited.plus(
                  new BigNumber(
                    formatBigNumberToString(event.args.assets.toString(), options.poolMetadata.collaterals[0].decimals),
                  ),
                );
                break;
              }
              case MorphoEventSignatures.WithdrawCollateral: {
                volumeCollateralWithdrawn = volumeCollateralWithdrawn.plus(
                  new BigNumber(
                    formatBigNumberToString(event.args.assets.toString(), options.poolMetadata.collaterals[0].decimals),
                  ),
                );
                break;
              }
              case MorphoEventSignatures.Liquidate: {
                volumeRepaid = volumeRepaid.plus(
                  new BigNumber(
                    formatBigNumberToString(
                      event.args.repaidAssets.toString(),
                      options.poolMetadata.debtToken.decimals,
                    ),
                  ),
                );
                volumeCollateralLiquidated = volumeCollateralLiquidated.plus(
                  new BigNumber(
                    formatBigNumberToString(
                      event.args.seizedAssets.toString(),
                      options.poolMetadata.collaterals[0].decimals,
                    ),
                  ),
                );
                break;
              }
            }
          }
        }
      }

      let totalCollateralDeposited = new BigNumber(0);
      for (const log of options.morphoBlueDatabaseLogs) {
        const signature = log.topics[0];

        const event: any = decodeEventLog({
          abi: MorphoBlueAbi,
          topics: log.topics,
          data: log.data,
        });

        if (event.args.id === options.poolMetadata.poolId) {
          switch (signature) {
            case MorphoEventSignatures.SupplyCollateral: {
              totalCollateralDeposited = totalCollateralDeposited.plus(
                new BigNumber(
                  formatBigNumberToString(event.args.assets.toString(), options.poolMetadata.collaterals[0].decimals),
                ),
              );
              break;
            }
            case MorphoEventSignatures.WithdrawCollateral: {
              totalCollateralDeposited = totalCollateralDeposited.minus(
                new BigNumber(
                  formatBigNumberToString(event.args.assets.toString(), options.poolMetadata.collaterals[0].decimals),
                ),
              );
              break;
            }
            case MorphoEventSignatures.Liquidate: {
              totalCollateralDeposited = totalCollateralDeposited.minus(
                new BigNumber(
                  formatBigNumberToString(
                    event.args.seizedAssets.toString(),
                    options.poolMetadata.collaterals[0].decimals,
                  ),
                ),
              );
              break;
            }
          }
        }
      }

      const marketData = {
        timefrom: options.fromTime,
        timeto: options.toTime,
        timestamp: options.stateTime,

        chain: options.marketConfig.chain,
        protocol: options.marketConfig.protocol,
        metric: options.marketConfig.metric,

        // Morpho Blue market ID
        address: options.poolMetadata.poolId,

        token: options.poolMetadata.debtToken,
        tokenPrice: debtTokenPrice,

        totalDeposited: formatBigNumberToString(totalSupplyAssets.toString(), options.poolMetadata.debtToken.decimals),
        totalBorrowed: formatBigNumberToString(totalBorrowAssets.toString(), options.poolMetadata.debtToken.decimals),

        volumeDeposited: volumeDeposited.toString(10),
        volumeWithdrawn: volumeWithdrawn.toString(10),
        volumeBorrowed: volumeBorrowed.toString(10),
        volumeRepaid: volumeRepaid.toString(10),

        rateSupply: supplyApy.toString(10),
        rateBorrow: borrowAPY.toString(10),

        addresses: Object.keys(addresses),
        transactions: Object.keys(transactions),

        collaterals: [
          {
            token: options.poolMetadata.collaterals[0],
            tokenPrice: collateralPriceUsd,
            totalDeposited: totalCollateralDeposited.toString(10),
            rateLoanToValue: formatBigNumberToString(options.poolMetadata.ltv, 18),
            volumeDeposited: volumeCollateralDeposited.toString(10),
            volumeWithdrawn: volumeCollateralWithdrawn.toString(10),
            volumeLiquidated: volumeCollateralLiquidated.toString(10),
          },
        ],
      };

      return marketData;
    }

    return null;
  }

  public async getIsolatedLendingPoolMetadata(
    config: IsolatedLendingMarketConfig,
  ): Promise<Array<MorphoBluePoolMetadata> | null> {
    // marketId => MorphoBluePoolMetadata
    const lendingPools: { [key: string]: MorphoBluePoolMetadata } = {};

    // find the latest block number when events was synced from database
    let startFromBlock = config.birthblock ? config.birthblock : 0;
    const latestBlock = await this.services.blockchain.getLastestBlockNumber(config.chain);

    const databaseConnected = await this.storages.database.isConnected();
    const databaseLatestStateKey = `metadata-isolated-lending-pools-${config.chain}-${config.protocol}-${config.address}`;

    // we have some pool metadata static data collected before
    // we write them into the database - metadata pools collection
    for (const marketStatic of Object.values(MorphoMarkets)) {
      if (marketStatic.chain === config.chain) {
        const poolMetadata: MorphoBluePoolMetadata = {
          chain: marketStatic.chain,
          protocol: config.protocol,
          version: config.version,
          address: normalizeAddress(config.address), // morpho blue contract
          poolId: marketStatic.marketId,
          oracle: marketStatic.oracle,
          irm: marketStatic.irm,
          ltv: marketStatic.ltv,
          debtToken: marketStatic.debtToken,
          collaterals: [marketStatic.collateral],
          birthblock: marketStatic.birthblock,
          birthday: marketStatic.birthday,
        };

        lendingPools[marketStatic.marketId] = poolMetadata;

        if (databaseConnected) {
          await this.storages.database.update({
            collection: envConfig.mongodb.collections.metadataLendingIsolatedPools.name,
            keys: {
              protocol: poolMetadata.protocol,
              chain: poolMetadata.chain,
              address: poolMetadata.address,
              poolId: poolMetadata.poolId,
            },
            updates: {
              ...poolMetadata,
            },
            upsert: true,
          });

          if (startFromBlock < poolMetadata.birthblock) {
            await this.storages.database.update({
              collection: envConfig.mongodb.collections.cachingStates.name,
              keys: {
                name: databaseLatestStateKey,
              },
              updates: {
                name: databaseLatestStateKey,
                blockNumber: marketStatic.birthblock,
              },
              upsert: true,
            });
          }
        }
      }
    }

    if (databaseConnected) {
      // get existed pools from database
      const pools: Array<any> = await this.storages.database.query({
        collection: envConfig.mongodb.collections.metadataLendingIsolatedPools.name,
        query: {
          chain: config.chain,
          protocol: config.protocol,
          address: normalizeAddress(config.address),
        },
      });
      for (const existedPool of pools) {
        lendingPools[existedPool.poolId] = {
          protocol: existedPool.protocol,
          chain: existedPool.chain,
          version: existedPool.version,
          address: existedPool.address,
          poolId: existedPool.poolId,
          birthblock: existedPool.birthblock,
          birthday: existedPool.birthday,
          debtToken: existedPool.debtToken,
          collaterals: existedPool.collaterals,
          oracle: existedPool.oracle,
          irm: existedPool.irm,
          ltv: existedPool.ltv,
        };
      }

      const latestSyncState = await this.storages.database.find({
        collection: envConfig.mongodb.collections.cachingStates.name,
        query: {
          name: databaseLatestStateKey,
        },
      });
      if (latestSyncState) {
        // sync from latest block number from database
        startFromBlock = Number(latestSyncState.blockNumber) + 1;
      }
    }

    logger.info('start to get morpho blue pools metadata', {
      service: this.name,
      protocol: config.protocol,
      chain: config.chain,
      address: config.address,
      fromBlock: startFromBlock,
      toBlock: latestBlock,
    });

    const chunkSize = 5000;
    while (startFromBlock < latestBlock) {
      const toBlock = startFromBlock + chunkSize > latestBlock ? latestBlock : startFromBlock + chunkSize;
      const logs = await this.services.blockchain.getContractLogs({
        chain: config.chain,
        address: config.address,
        fromBlock: startFromBlock,
        toBlock: toBlock,
      });

      for (const log of logs) {
        if (log.topics[0] === MorphoEventSignatures.CreateMarket) {
          const poolMetadata = await this.getMarketInfoFromLog({
            marketConfig: config,
            log: log,
          });
          if (poolMetadata) {
            lendingPools[poolMetadata.poolId] = poolMetadata;

            if (databaseConnected) {
              await this.storages.database.update({
                collection: envConfig.mongodb.collections.metadataLendingIsolatedPools.name,
                keys: {
                  protocol: poolMetadata.protocol,
                  chain: poolMetadata.chain,
                  address: poolMetadata.address,
                  poolId: poolMetadata.poolId,
                },
                updates: {
                  ...poolMetadata,
                },
                upsert: true,
              });
            }

            logger.debug('got morpho blue pool metadata', {
              service: this.name,
              protocol: config.protocol,
              chain: config.chain,
              address: poolMetadata.address,
              debtToken: poolMetadata.debtToken.symbol,
              collateral: poolMetadata.collaterals[0].symbol,
            });
          }
        }
      }

      // update latest block number which indexed logs
      if (databaseConnected) {
        await this.storages.database.update({
          collection: envConfig.mongodb.collections.cachingStates.name,
          keys: {
            name: databaseLatestStateKey,
          },
          updates: {
            name: databaseLatestStateKey,
            blockNumber: toBlock + 1,
          },
          upsert: true,
        });
      }

      startFromBlock = toBlock + 1;
    }

    return Object.values(lendingPools);
  }

  public async getLendingPoolData(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<Array<IsolatedLendingPoolDataTimeframe> | null> {
    const blueConfig = options.config as IsolatedLendingMarketConfig;

    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    const stateTime = options.latestState ? options.toTime : options.fromTime;
    const stateBlock = options.latestState ? endBlock : beginBlock;

    logger.info('indexing historical blue logs to cache', {
      service: this.name,
      protocol: blueConfig.protocol,
      chain: blueConfig.chain,
      address: blueConfig.address,
    });

    // we indexed these collateral supply/withdraw/liquidate events
    // to build current collateral state of the market
    await this.services.blockchain.indexContractLogs(this.storages, {
      chain: blueConfig.chain,
      address: blueConfig.address,
      fromBlock: blueConfig.birthblock as number,
      toBlock: endBlock,
      signatures: [
        MorphoEventSignatures.SupplyCollateral,
        MorphoEventSignatures.WithdrawCollateral,
        MorphoEventSignatures.Liquidate,
      ],
      blockRange: blueConfig.chain === ChainNames.ethereum ? 500 : undefined,
    });

    const logs = await this.services.blockchain.getContractLogs({
      chain: blueConfig.chain,
      address: blueConfig.address,
      fromBlock: beginBlock,
      toBlock: endBlock,
      blockRange: blueConfig.chain === ChainNames.ethereum ? 200 : undefined,
    });
    const databaseLogs = await this.storages.database.query({
      collection: envConfig.mongodb.collections.cachingContractLogs.name,
      query: {
        chain: blueConfig.chain,
        address: blueConfig.address,
        blockNumber: {
          $gte: 0,
          $lte: endBlock,
        },
      },
    });

    const pools: Array<IsolatedLendingPoolDataTimeframe> = [];

    const allPools = await this.getIsolatedLendingPoolMetadata(blueConfig);
    if (allPools) {
      logger.info('getting lending pools data', {
        service: this.name,
        protocol: blueConfig.protocol,
        chain: blueConfig.chain,
        address: blueConfig.address,
        pools: allPools.length,
        logs: logs.length,
        histiricalLogs: databaseLogs.length,
      });
      for (const poolMetadata of allPools) {
        const poolData = await this.getMarketData({
          marketConfig: blueConfig,
          poolMetadata: poolMetadata,

          beginBlock,
          endBlock,
          stateBlock,

          fromTime: options.fromTime,
          toTime: options.toTime,
          stateTime,

          morphoBlueLogs: logs,
          morphoBlueDatabaseLogs: databaseLogs,
        });

        if (poolData) {
          pools.push(poolData);

          logger.debug('got morpho blue lending pool data', {
            service: this.name,
            protocol: blueConfig.protocol,
            chain: blueConfig.chain,
            market: `${poolData.token.symbol}-${poolData.collaterals[0].token.symbol}`,
          });
        }
      }
    }

    return pools;
  }

  public async runTest(options: RunAdapterOptions): Promise<void> {
    const config = options.metricConfig as IsolatedLendingMarketConfig;

    const pools: { [key: string]: MorphoBluePoolMetadata } = {
      ethereum: {
        chain: 'ethereum',
        protocol: config.protocol,
        version: config.version,
        address: '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb',
        poolId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
        debtToken: {
          chain: 'ethereum',
          symbol: 'WETH',
          decimals: 18,
          address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        },
        collaterals: [
          {
            chain: 'ethereum',
            symbol: 'WSTETH',
            decimals: 18,
            address: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
          },
        ],
        oracle: '0x2a01eb9496094da03c4e364def50f5ad1280ad72',
        irm: '0x870ac11d48b15db9a138cf899d20f13f79ba00bc',
        ltv: '945000000000000000',
        birthblock: 18919623,
        birthday: 1704240000,
      },
      base: {
        chain: 'base',
        protocol: config.protocol,
        version: config.version,
        address: '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb',
        poolId: '0x3a4048c64ba1b375330d376b1ce40e4047d03b47ab4d48af484edec9fec801ba',
        debtToken: {
          chain: 'base',
          address: '0x4200000000000000000000000000000000000006',
          symbol: 'WETH',
          decimals: 18,
        },
        collaterals: [
          {
            chain: 'base',
            address: '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452',
            symbol: 'wstETH',
            decimals: 18,
          },
        ],
        oracle: '0x4a11590e5326138b514e08a9b52202d42077ca65',
        irm: '0x46415998764c29ab2a25cbea6254146d50d22687',
        ltv: '945000000000000000',
        birthblock: 15653729,
        birthday: 1718150400,
      },
    };

    if (pools[config.chain]) {
      const currentTime = getTimestamp();
      const last24HoursTime = currentTime - TimeUnits.SecondsPerDay;

      const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(config.chain, last24HoursTime);
      const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(config.chain, currentTime);

      const stateTime = currentTime;
      const stateBlock = endBlock;

      const logs = await this.services.blockchain.getContractLogs({
        chain: config.chain,
        address: config.address,
        fromBlock: beginBlock,
        toBlock: endBlock,
        blockRange: config.chain === ChainNames.ethereum ? 200 : undefined,
      });

      const poolData = await this.getMarketData({
        marketConfig: options.metricConfig as IsolatedLendingMarketConfig,
        poolMetadata: pools[config.chain],
        beginBlock,
        endBlock,
        stateBlock,
        fromTime: last24HoursTime,
        toTime: currentTime,
        stateTime,
        morphoBlueLogs: logs,
        morphoBlueDatabaseLogs: [],
      });

      console.log(poolData);
    }
  }
}
