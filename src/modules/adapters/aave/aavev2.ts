import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import AaveDataProviderV2Abi from '../../../configs/abi/aave/DataProviderV2.json';
import AaveIncentiveControllerV2Abi from '../../../configs/abi/aave/IncentiveControllerV2.json';
import AaveLendingPoolV2Abi from '../../../configs/abi/aave/LendingPoolV2.json';
import AaveOracleV2Abi from '../../../configs/abi/aave/OracleV2.json';
import { AddressZero, SolidityUnits } from '../../../configs/constants';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import logger from '../../../lib/logger';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ActivityAction, ActivityActions } from '../../../types/base';
import { DataMetrics, ProtocolConfig } from '../../../types/configs';
import { CrossLendingReserveDataState, CrossLendingReserveDataTimeframe } from '../../../types/domains/crossLending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import {
  GetAdapterDataStateOptions,
  GetAdapterDataTimeframeOptions,
  TransformEventLogOptions,
  TransformEventLogResult,
} from '../../../types/options';
import { AdapterGetEventLogsOptions } from '../adapter';
import CrossLendingProtocolAdapter from '../crossLending';
import { countCrossLendingDataFromActivities } from '../helpers';
import { AaveEventInterfaces, Aavev2EventSignatures } from './abis';

export interface AaveMarketRates {
  supply: string;
  borrow: string;
  borrowStable: string;
}

export interface ReserveAndPrice {
  reserve: string;
  price: string | null;
}

export default class Aavev2Adapter extends CrossLendingProtocolAdapter {
  public readonly name: string = 'adapter.aavev2';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.abiConfigs.eventSignatures = Aavev2EventSignatures;
    this.abiConfigs.eventAbis = {
      lendingPool: AaveLendingPoolV2Abi,
      oracle: AaveOracleV2Abi,
      dataProvider: AaveDataProviderV2Abi,
      incentiveController: AaveIncentiveControllerV2Abi,
    };
  }

  protected async getEventLogs(options: AdapterGetEventLogsOptions): Promise<Array<any>> {
    // aave need logs from Lending Pool contract only
    return await this.services.blockchain.getContractLogs({
      chain: options.metricConfig.chain,
      address: options.metricConfig.address,
      fromBlock: options.fromBlock,
      toBlock: options.toBlock,
    });
  }

  protected async transformEventLogs(options: TransformEventLogOptions): Promise<TransformEventLogResult> {
    const result: TransformEventLogResult = {
      activities: [],
    };

    const eventSignatures: AaveEventInterfaces = this.abiConfigs.eventSignatures;
    for (const log of options.logs) {
      const signature = log.topics[0];
      const address = normalizeAddress(log.address);

      if (
        Object.values(this.abiConfigs.eventSignatures).indexOf(signature) !== -1 &&
        compareAddress(options.config.address, address)
      ) {
        const event: any = decodeEventLog({
          abi: this.abiConfigs.eventAbis.lendingPool,
          data: log.data,
          topics: log.topics,
        });

        if (signature !== eventSignatures.Liquidate) {
          const reserve = await this.services.blockchain.getTokenInfo({
            chain: options.chain,
            address: event.args.reserve.toString(),
          });
          if (reserve) {
            let action: ActivityAction = 'deposit';
            switch (signature) {
              case eventSignatures.Withdraw: {
                action = 'withdraw';
                break;
              }
              case eventSignatures.Borrow: {
                action = 'borrow';
                break;
              }
              case eventSignatures.Repay: {
                action = 'repay';
                break;
              }
            }

            let user = normalizeAddress(event.args.user.toString());
            if (signature === eventSignatures.Deposit || signature === eventSignatures.Borrow) {
              user = normalizeAddress(event.args.onBehalfOf.toString());
            } else if (signature === eventSignatures.Withdraw) {
              user = normalizeAddress(event.args.to.toString());
            } else if (signature === eventSignatures.Repay) {
              user = normalizeAddress(event.args.repayer.toString());
            }

            const amount = formatBigNumberToString(event.args.amount.toString(), reserve.decimals);

            result.activities.push({
              chain: options.chain,
              protocol: options.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: log.logIndex.toString(),
              blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
              action: action,
              user: user,
              token: reserve,
              tokenAmount: amount,
            });
          }
        } else {
          // on LiquidationCall event, we conduct 2 activities
          // the first one logIndex:0 is the debt repay activity
          // the second one logIndex:1 is the liquidate activity
          const reserve = await this.services.blockchain.getTokenInfo({
            chain: options.chain,
            address: event.args.debtAsset.toString(),
          });

          const collateral = await this.services.blockchain.getTokenInfo({
            chain: options.chain,
            address: event.args.collateralAsset.toString(),
          });

          if (reserve && collateral) {
            const user = normalizeAddress(event.args.liquidator.toString());
            const amount = formatBigNumberToString(event.args.debtToCover.toString(), reserve.decimals);
            const collateralAmount = formatBigNumberToString(
              event.args.liquidatedCollateralAmount.toString(),
              collateral.decimals,
            );

            // debt cover repay activity
            result.activities.push({
              chain: options.chain,
              protocol: options.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: `${log.logIndex.toString()}:0`,
              blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
              action: ActivityActions.repay,
              user: user,
              token: reserve,
              tokenAmount: amount,
            });

            // liquidation activity
            result.activities.push({
              chain: options.chain,
              protocol: options.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: `${log.logIndex.toString()}:1`,
              blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
              action: ActivityActions.liquidate,
              user: user,
              token: collateral,
              tokenAmount: collateralAmount,
            });
          }
        }
      }
    }

    return result;
  }

  public async getLendingReservesDataState(
    options: GetAdapterDataStateOptions,
  ): Promise<Array<CrossLendingReserveDataState> | null> {
    const result: Array<CrossLendingReserveDataState> = [];

    const blockNumber = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.timestamp,
    );

    const marketConfig: AaveLendingMarketConfig = options.config as AaveLendingMarketConfig;

    const reservesAndPrices = await this.getReservesAndPrices(marketConfig, blockNumber, options.timestamp);

    for (const reserveAndPrice of reservesAndPrices) {
      const token = await this.services.blockchain.getTokenInfo({
        chain: marketConfig.chain,
        address: reserveAndPrice.reserve,
      });
      if (!token) {
        continue;
      }

      const tokenPrice = reserveAndPrice.price;

      const [reserveData, reserveConfigData] = await this.getReserveData(
        marketConfig,
        reserveAndPrice.reserve,
        blockNumber,
      );

      const totalBorrowed = this.getTotalBorrowed(reserveData);
      const totalDeposited = this.getTotalDeposited(reserveData);
      const rates = this.getMarketRates(reserveData);

      const dataState: CrossLendingReserveDataState = {
        metric: DataMetrics.crossLending,
        chain: marketConfig.chain,
        protocol: marketConfig.protocol,
        address: normalizeAddress(marketConfig.address),
        timestamp: options.timestamp,

        token: token,
        tokenPrice: tokenPrice ? tokenPrice : '0',

        totalDeposited: formatBigNumberToString(totalDeposited, token.decimals),
        totalBorrowed: formatBigNumberToString(totalBorrowed.variable, token.decimals),
        totalBorrowedStable: formatBigNumberToString(totalBorrowed.stable, token.decimals),

        rateSupply: rates.supply,
        rateBorrow: rates.borrow,
        rateBorrowStable: rates.borrowStable,
        rateLoanToValue: this.getLoanToValueRate(reserveConfigData),
        rateReserveFactor: this.getReserveFactor(reserveConfigData),
      };

      logger.debug('got cross lending reserve data', {
        service: this.name,
        protocol: marketConfig.protocol,
        chain: marketConfig.chain,
        token: token.symbol,
        tokenPrice: tokenPrice,
      });

      result.push(dataState);
    }

    return result;
  }

  public async getLendingReservesDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<Array<CrossLendingReserveDataTimeframe> | null> {
    const states = await this.getLendingReservesDataState({
      config: options.config,
      timestamp: options.latestState ? options.toTime : options.fromTime,
    });

    if (!states) {
      return null;
    }

    const result: Array<CrossLendingReserveDataTimeframe> = [];

    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    const logs = await this.getEventLogs({
      metricConfig: options.config,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    const { activities } = await this.transformEventLogs({
      chain: options.config.chain,
      config: options.config,
      logs: logs,
    });

    for (const stateData of states) {
      const documents = activities.filter(
        (activity) =>
          activity.chain === stateData.chain &&
          activity.protocol === stateData.protocol &&
          activity.address === stateData.address &&
          activity.token.address === stateData.token.address,
      );

      const activityData = countCrossLendingDataFromActivities(documents);

      const snapshotData: CrossLendingReserveDataTimeframe = {
        ...stateData,
        ...activityData,

        timefrom: options.fromTime,
        timeto: options.toTime,
      };

      result.push(snapshotData);
    }

    return result;
  }

  // return total deposited (in wei)
  protected getTotalDeposited(reserveData: any): string {
    const totalBorrowed = new BigNumber(reserveData[1].toString()).plus(new BigNumber(reserveData[2].toString()));
    return new BigNumber(reserveData[0].toString()).plus(totalBorrowed).toString(10);
  }

  // return total borrowed (in wei)
  protected getTotalBorrowed(reserveData: any): {
    stable: string;
    variable: string;
  } {
    return {
      stable: reserveData[1].toString(),
      variable: reserveData[2].toString(),
    };
  }

  protected getMarketRates(reserveData: any): AaveMarketRates {
    return {
      supply: formatBigNumberToString(reserveData[3].toString(), SolidityUnits.RayDecimals),
      borrow: formatBigNumberToString(reserveData[4].toString(), SolidityUnits.RayDecimals),
      borrowStable: formatBigNumberToString(reserveData[5].toString(), SolidityUnits.RayDecimals),
    };
  }

  protected getLoanToValueRate(configData: any): string {
    return formatBigNumberToString(configData[1].toString(), 4);
  }

  protected async getReservesList(config: AaveLendingMarketConfig, blockNumber: number): Promise<any> {
    return await this.services.blockchain.readContract({
      chain: config.chain,
      abi: this.abiConfigs.eventAbis.lendingPool,
      target: config.address,
      method: 'getReservesList',
      params: [],
      blockNumber,
    });
  }

  protected async getReservesAndPrices(
    config: AaveLendingMarketConfig,
    blockNumber: number,
    timestamp: number,
  ): Promise<Array<ReserveAndPrice>> {
    const reservesAndPrices: Array<ReserveAndPrice> = [];

    const reserveList = await this.getReservesList(config, blockNumber);
    if (reserveList && config.oracle) {
      const reservePrices = await this.services.blockchain.readContract({
        chain: config.chain,
        abi: this.abiConfigs.eventAbis.oracle,
        target: config.oracle.address,
        method: 'getAssetsPrices',
        params: [reserveList],
        blockNumber,
      });

      if (reservePrices) {
        for (let i = 0; i < reserveList.length; i++) {
          let price = null;
          if (reservePrices[i]) {
            if (config.oracle.currency === 'eth') {
              const ethPrice = await this.services.oracle.getTokenPriceUsd({
                chain: 'ethereum',
                address: AddressZero,
                timestamp: timestamp,
              });
              if (ethPrice) {
                price = new BigNumber(reservePrices[i].toString())
                  .multipliedBy(new BigNumber(ethPrice))
                  .dividedBy(1e18)
                  .toString(10);
              }
            } else {
              price = formatBigNumberToString(reservePrices[i].toString(), 8);
            }
          }

          reservesAndPrices.push({
            reserve: reserveList[i],
            price: price,
          });
        }
      } else {
        logger.debug('failed to get reserve prices from oracle', {
          service: this.name,
          metric: config.metric,
          protocol: this.protocolConfig.protocol,
          chain: config.chain,
          address: config.address,
          oracle: config.oracle.address,
          blockNumber: blockNumber,
        });

        for (let i = 0; i < reserveList.length; i++) {
          const tokenPrice = await this.services.oracle.getTokenPriceUsd({
            chain: config.chain,
            address: reserveList[i],
            timestamp: timestamp,
          });
          reservesAndPrices.push({
            reserve: reserveList[i],
            price: tokenPrice ? tokenPrice : '0',
          });
        }
      }
    }

    return reservesAndPrices;
  }

  protected getReserveFactor(configData: any): string {
    return formatBigNumberToString(configData[4].toString(), 4);
  }

  protected async getReserveData(config: AaveLendingMarketConfig, reserve: string, blockNumber: number): Promise<any> {
    return await this.services.blockchain.multicall({
      chain: config.chain,
      blockNumber: blockNumber,
      calls: [
        {
          abi: this.abiConfigs.eventAbis.dataProvider,
          target: config.dataProvider,
          method: 'getReserveData',
          params: [reserve],
        },
        {
          abi: this.abiConfigs.eventAbis.dataProvider,
          target: config.dataProvider,
          method: 'getReserveConfigurationData',
          params: [reserve],
        },
      ],
    });
  }
}
