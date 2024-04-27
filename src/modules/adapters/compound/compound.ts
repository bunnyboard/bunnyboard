import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import CompoundComptrollerAbi from '../../../configs/abi/compound/Comptroller.json';
import CompoundComptrollerV1Abi from '../../../configs/abi/compound/ComptrollerV1.json';
import CompoundOracleAbi from '../../../configs/abi/compound/Oracle.json';
import cErc20Abi from '../../../configs/abi/compound/cErc20.json';
import IronbankComptrollerOldAbi from '../../../configs/abi/ironbank/FirstComptroller.json';
import { ChainBlockPeriods, TimeUnits } from '../../../configs/constants';
import { CompoundLendingMarketConfig } from '../../../configs/protocols/compound';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ActivityActions } from '../../../types/base';
import { ProtocolConfig, Token } from '../../../types/configs';
import { CrossLendingReserveDataState, CrossLendingReserveDataTimeframe } from '../../../types/domains/crossLending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import {
  GetAdapterDataStateOptions,
  GetAdapterDataTimeframeOptions,
  TransformEventLogOptions,
  TransformEventLogResult,
} from '../../../types/options';
import CompoundLibs from '../../libs/compound';
import { AdapterGetEventLogsOptions } from '../adapter';
import CrossLendingProtocolAdapter from '../crossLending';
import { countCrossLendingDataFromActivities } from '../helpers';
import { CompoundEventInterfaces, CompoundEventSignatures } from './abis';

interface Rates {
  supplyRate: string;
  borrowRate: string;
}

interface MarketAndPrice {
  cToken: string;
  underlying: Token;
  underlyingPrice: string | null;
}

export default class CompoundAdapter extends CrossLendingProtocolAdapter {
  public readonly name: string = 'adapter.compound';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.abiConfigs.eventSignatures = CompoundEventSignatures;
    this.abiConfigs.eventAbis = {
      cErc20: cErc20Abi,
      comptroller: CompoundComptrollerAbi,
      oracle: CompoundOracleAbi,
    };
  }

  protected async getMarketLoanToValueRate(
    config: CompoundLendingMarketConfig,
    cTokenContract: string,
    blockNumber: number,
  ): Promise<any> {
    const abis: Array<any> = [
      this.abiConfigs.eventAbis.comptroller,
      CompoundComptrollerV1Abi,
      IronbankComptrollerOldAbi,
    ];

    for (const abi of abis) {
      const marketInfo = await this.services.blockchain.readContract({
        chain: config.chain,
        abi: abi,
        target: config.address,
        method: 'markets',
        params: [cTokenContract],
        blockNumber,
      });
      if (marketInfo) {
        return formatBigNumberToString(marketInfo[1].toString(), 18);
      }
    }

    return '0';
  }

  protected async getMarketReserveFactorRate(
    config: CompoundLendingMarketConfig,
    cTokenContract: string,
    blockNumber: number,
  ): Promise<any> {
    const reserveFactorMantissa = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: this.abiConfigs.eventAbis.cErc20,
      target: cTokenContract,
      method: 'reserveFactorMantissa',
      params: [],
      blockNumber,
    });
    if (reserveFactorMantissa) {
      return formatBigNumberToString(reserveFactorMantissa.toString(), 18);
    }

    return '0';
  }

  protected async getAllMarkets(
    config: CompoundLendingMarketConfig,
    blockNumber: number,
  ): Promise<Array<string> | null> {
    const abis: Array<any> = [
      this.abiConfigs.eventAbis.comptroller,
      CompoundComptrollerV1Abi,
      IronbankComptrollerOldAbi,
    ];

    for (const abi of abis) {
      const allMarkets = await this.services.blockchain.readContract({
        chain: config.chain,
        abi: abi,
        target: config.address,
        method: 'getAllMarkets',
        params: [],
        blockNumber,
      });
      if (allMarkets) {
        return allMarkets as Array<string>;
      }
    }

    return config.preDefinedMarkets ? config.preDefinedMarkets : null;
  }

  protected async getAllMarketsAndPrices(
    config: CompoundLendingMarketConfig,
    blockNumber: number,
    timestamp: number,
  ): Promise<Array<MarketAndPrice>> {
    const markets: Array<MarketAndPrice> = [];

    const allMarkets = await this.getAllMarkets(config, blockNumber);
    if (allMarkets) {
      for (const cTokenAddress of allMarkets) {
        let underlying = null;
        if (config.underlying[normalizeAddress(cTokenAddress)]) {
          underlying = config.underlying[normalizeAddress(cTokenAddress)];
        } else {
          const underlyingAddress = await this.services.blockchain.readContract({
            chain: config.chain,
            abi: this.abiConfigs.eventAbis.cErc20,
            target: cTokenAddress,
            method: 'underlying',
            params: [],
            blockNumber,
          });

          if (underlyingAddress) {
            underlying = await this.services.blockchain.getTokenInfo({
              chain: config.chain,
              address: underlyingAddress.toString(),
            });
          }
        }

        if (underlying) {
          const underlyingPrice = await this.services.oracle.getTokenPriceUsd({
            chain: underlying.chain,
            address: underlying.address,
            timestamp: timestamp,
          });

          markets.push({
            cToken: normalizeAddress(cTokenAddress),
            underlying: underlying,
            underlyingPrice: underlyingPrice,
          });
        }
      }
    }

    return markets;
  }

  protected async getMarketRates(chain: string, cTokenContract: string, blockNumber: number): Promise<Rates> {
    const [supplyRatePerBlock, borrowRatePerBlock] = await this.services.blockchain.multicall({
      chain: chain,
      blockNumber: blockNumber,
      calls: [
        {
          abi: this.abiConfigs.eventAbis.cErc20,
          target: cTokenContract,
          method: 'supplyRatePerBlock',
          params: [],
        },
        {
          abi: this.abiConfigs.eventAbis.cErc20,
          target: cTokenContract,
          method: 'borrowRatePerBlock',
          params: [],
        },
      ],
    });

    const supplyRate = new BigNumber(supplyRatePerBlock ? supplyRatePerBlock : '0').multipliedBy(
      Math.floor(TimeUnits.SecondsPerYear / ChainBlockPeriods[chain]),
    );
    const borrowRate = new BigNumber(borrowRatePerBlock).multipliedBy(
      Math.floor(TimeUnits.SecondsPerYear / ChainBlockPeriods[chain]),
    );

    return {
      supplyRate: formatBigNumberToString(supplyRate.toString(10), 18),
      borrowRate: formatBigNumberToString(borrowRate.toString(10), 18),
    };
  }

  public async getLendingReservesDataState(
    options: GetAdapterDataStateOptions,
  ): Promise<Array<CrossLendingReserveDataState> | null> {
    const result: Array<CrossLendingReserveDataState> = [];

    const marketConfig = options.config as CompoundLendingMarketConfig;
    const blockNumber = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      marketConfig.chain,
      options.timestamp,
    );

    const allMarketsAndPrices = await this.getAllMarketsAndPrices(marketConfig, blockNumber, options.timestamp);
    for (const marketAndPrice of allMarketsAndPrices) {
      if (
        marketConfig.blacklists &&
        (marketConfig.blacklists[marketAndPrice.cToken] || marketConfig.blacklists[marketAndPrice.underlying.address])
      ) {
        continue;
      }

      const tokenPrice = marketAndPrice.underlyingPrice;

      const [totalCash, totalBorrows, totalReserves] = await this.services.blockchain.multicall({
        chain: marketConfig.chain,
        blockNumber: blockNumber,
        calls: [
          {
            abi: this.abiConfigs.eventAbis.cErc20,
            target: marketAndPrice.cToken,
            method: 'getCash',
            params: [],
          },
          {
            abi: this.abiConfigs.eventAbis.cErc20,
            target: marketAndPrice.cToken,
            method: 'totalBorrows',
            params: [],
          },
          {
            abi: this.abiConfigs.eventAbis.cErc20,
            target: marketAndPrice.cToken,
            method: 'totalReserves',
            params: [],
          },
        ],
      });

      const ltv = await this.getMarketLoanToValueRate(marketConfig, marketAndPrice.cToken, blockNumber);
      const reserveFactor = await this.getMarketReserveFactorRate(marketConfig, marketAndPrice.cToken, blockNumber);

      const totalDeposited = new BigNumber(totalCash ? totalCash.toString() : '0')
        .plus(new BigNumber(totalBorrows ? totalBorrows.toString() : '0'))
        .minus(new BigNumber(totalReserves ? totalReserves.toString() : '0'));
      const totalBorrowed = new BigNumber(totalBorrows.toString());

      // get market rates
      const { supplyRate, borrowRate } = await this.getMarketRates(
        marketConfig.chain,
        marketAndPrice.cToken,
        blockNumber,
      );

      const dataState: CrossLendingReserveDataState = {
        metric: marketConfig.metric,
        chain: marketConfig.chain,
        protocol: marketConfig.protocol,
        address: marketAndPrice.cToken,
        timestamp: options.timestamp,

        token: marketAndPrice.underlying,
        tokenPrice: tokenPrice ? tokenPrice : '0',

        totalDeposited: formatBigNumberToString(totalDeposited.toString(10), marketAndPrice.underlying.decimals),
        totalBorrowed: formatBigNumberToString(totalBorrowed.toString(10), marketAndPrice.underlying.decimals),

        rateSupply: supplyRate,
        rateBorrow: borrowRate,
        rateLoanToValue: ltv,
        rateReserveFactor: reserveFactor,
      };

      result.push(dataState);
    }

    return result;
  }

  public async getEventLogs(options: AdapterGetEventLogsOptions): Promise<Array<any>> {
    let logs: Array<any> = [];

    // get comptroller logs
    logs = await this.services.blockchain.getContractLogs({
      chain: options.metricConfig.chain,
      address: options.metricConfig.address,
      fromBlock: options.fromBlock,
      toBlock: options.toBlock,
    });

    const allMarkets = await this.getAllMarkets(options.metricConfig as CompoundLendingMarketConfig, options.fromBlock);
    if (allMarkets) {
      for (const cToken of allMarkets) {
        logs = logs.concat(
          await this.services.blockchain.getContractLogs({
            chain: options.metricConfig.chain,
            address: cToken.toString(),
            fromBlock: options.fromBlock,
            toBlock: options.toBlock,
          }),
        );
      }
    }

    return logs;
  }

  public async transformEventLogs(options: TransformEventLogOptions): Promise<TransformEventLogResult> {
    const result: TransformEventLogResult = {
      activities: [],
    };

    const allCTokens = await CompoundLibs.getComptrollerInfo(options.config as CompoundLendingMarketConfig);
    const allContracts = [...allCTokens.map((item) => normalizeAddress(item.cToken)), options.config.address];
    const eventSignatures: CompoundEventInterfaces = this.abiConfigs.eventSignatures as CompoundEventInterfaces;

    for (const log of options.logs) {
      const signature = log.topics[0];
      const address = normalizeAddress(log.address);

      if (
        Object.values(this.abiConfigs.eventSignatures).indexOf(signature) !== -1 &&
        allContracts.indexOf(address) !== -1
      ) {
        if (
          signature === eventSignatures.DistributedSupplierRewards ||
          signature === eventSignatures.DistributedBorrowerRewards
        ) {
          const event: any = decodeEventLog({
            abi: this.abiConfigs.eventAbis.comptroller,
            data: log.data,
            topics: log.topics,
          });

          const token = (options.config as CompoundLendingMarketConfig).governanceToken;
          const cToken = allCTokens.filter((item) => compareAddress(item.cToken, event.args.cToken.toString()))[0];
          if (cToken && token) {
            const user = normalizeAddress(event.args.supplier ? event.args.supplier : event.args.borrower);
            const tokenAmount = formatBigNumberToString(event.args.compDelta.toString(), token.decimals);
            result.activities.push({
              chain: options.chain,
              protocol: options.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: log.logIndex.toString(),
              blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
              action: 'collect',
              user: user,
              token: token,
              tokenAmount: tokenAmount,
            });
          }
        } else {
          const cToken = allCTokens.filter((item) => compareAddress(item.cToken, address))[0];
          if (cToken) {
            const event: any = decodeEventLog({
              abi: this.abiConfigs.eventAbis.cErc20,
              data: log.data,
              topics: log.topics,
            });

            if (signature !== eventSignatures.Liquidate) {
              let action = '';
              let user = '';
              let tokenAmount = '';

              switch (signature) {
                case eventSignatures.Mint: {
                  action = ActivityActions.deposit;
                  user = normalizeAddress(event.args.minter);
                  tokenAmount = formatBigNumberToString(event.args.mintAmount.toString(), cToken.underlying.decimals);
                  break;
                }
                case eventSignatures.Redeem: {
                  action = ActivityActions.withdraw;
                  user = normalizeAddress(event.args.redeemer);
                  tokenAmount = formatBigNumberToString(event.args.redeemAmount.toString(), cToken.underlying.decimals);
                  break;
                }
                case eventSignatures.Borrow: {
                  action = ActivityActions.borrow;
                  user = normalizeAddress(event.args.borrower);
                  tokenAmount = formatBigNumberToString(event.args.borrowAmount.toString(), cToken.underlying.decimals);
                  break;
                }
                case eventSignatures.Repay: {
                  action = ActivityActions.repay;
                  user = normalizeAddress(event.args.payer);
                  tokenAmount = formatBigNumberToString(event.args.repayAmount.toString(), cToken.underlying.decimals);
                  break;
                }
              }

              result.activities.push({
                chain: options.chain,
                protocol: options.config.protocol,
                address: address,
                transactionHash: log.transactionHash,
                logIndex: log.logIndex.toString(),
                blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
                action: action,
                user: user,
                token: cToken.underlying,
                tokenAmount: tokenAmount,
              });
            } else {
              const user = normalizeAddress(event.args.liquidator);
              const tokenAmount = formatBigNumberToString(
                event.args.repayAmount.toString(),
                cToken.underlying.decimals,
              );

              // get collateral info
              const cTokenCollateral = allCTokens.filter((item) =>
                compareAddress(item.cToken, event.args.cTokenCollateral),
              )[0];
              if (cTokenCollateral) {
                const seizeTokens = new BigNumber(event.args.seizeTokens.toString());

                // we get the current exchange rate
                const exchangeRateCurrent = await this.services.blockchain.readContract({
                  chain: options.chain,
                  abi: this.abiConfigs.eventAbis.cErc20,
                  target: cTokenCollateral.cToken,
                  method: 'exchangeRateCurrent',
                  params: [],
                  blockNumber: log.blockNumber,
                });
                if (exchangeRateCurrent) {
                  const mantissa = 18 + cTokenCollateral.underlying.decimals - 8;
                  const oneCTokenInUnderlying = new BigNumber(exchangeRateCurrent).dividedBy(
                    new BigNumber(10).pow(mantissa),
                  );
                  const collateralAmount = seizeTokens.multipliedBy(oneCTokenInUnderlying).dividedBy(1e8).toString(10);

                  result.activities.push({
                    chain: options.chain,
                    protocol: options.config.protocol,
                    address: address,
                    transactionHash: log.transactionHash,
                    logIndex: log.logIndex.toString(),
                    blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
                    action: ActivityActions.repay,
                    user: user,
                    token: cToken.underlying,
                    tokenAmount: tokenAmount,
                  });

                  result.activities.push({
                    chain: options.chain,
                    protocol: options.config.protocol,
                    address: address,
                    transactionHash: log.transactionHash,
                    logIndex: log.logIndex.toString(),
                    blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
                    action: ActivityActions.liquidate,
                    user: user,
                    token: cTokenCollateral.underlying,
                    tokenAmount: collateralAmount,
                  });
                }
              }
            }
          }
        }
      }
    }

    return result;
  }

  public async getLendingReservesDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<Array<CrossLendingReserveDataTimeframe> | null> {
    const states = await this.getLendingReservesDataState({
      config: options.config,
      timestamp: options.fromTime,
    });
    if (!states) {
      return null;
    }

    const result: Array<CrossLendingReserveDataTimeframe> = [];

    // make sure activities were synced
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

      const activityData = await countCrossLendingDataFromActivities(documents);

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
}
