import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import CompoundComptrollerAbi from '../../../configs/abi/compound/Comptroller.json';
import CompoundComptrollerV1Abi from '../../../configs/abi/compound/ComptrollerV1.json';
import cErc20Abi from '../../../configs/abi/compound/cErc20.json';
import IronbankComptrollerOldAbi from '../../../configs/abi/ironbank/FirstComptroller.json';
import { ChainBlockPeriods, TimeUnits } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { CompoundLendingMarketConfig } from '../../../configs/protocols/compound';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ActivityActions, TokenValueItem } from '../../../types/collectors/base';
import { CrossLendingReserveDataState, CrossLendingReserveDataTimeframe } from '../../../types/collectors/crossLending';
import {
  GetAdapterDataStateOptions,
  GetAdapterDataTimeframeOptions,
  TransformEventLogOptions,
  TransformEventLogResult,
} from '../../../types/collectors/options';
import { MetricConfig, Token } from '../../../types/configs';
import { ContextServices } from '../../../types/namespaces';
import CompoundLibs from '../../libs/compound';
import ProtocolAdapter from '../adapter';
import { countCrossLendingDataFromActivities } from '../helpers';
import { CompoundEventInterfaces, CompoundEventSignatures } from './abis';

interface Rates {
  supplyRate: string;
  borrowRate: string;
}

interface Speeds {
  supplySpeed: string;
  borrowSpeed: string;
}

interface Rewards {
  forLenders: Array<TokenValueItem>;
  forBorrowers: Array<TokenValueItem>;
}

export default class CompoundAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.compound';

  constructor(services: ContextServices) {
    super(services);

    this.abiConfigs.eventSignatures = CompoundEventSignatures;
    this.abiConfigs.eventAbis = {
      cErc20: cErc20Abi,
      comptroller: CompoundComptrollerAbi,
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

  protected async getMarketCompSpeeds(
    config: CompoundLendingMarketConfig,
    cTokenContract: string,
    blockNumber: number,
  ): Promise<Speeds | null> {
    const compSupplySpeeds = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: this.abiConfigs.eventAbis.comptroller,
      target: config.address,
      method: 'compSupplySpeeds',
      params: [cTokenContract],
      blockNumber,
    });
    const compBorrowSpeeds = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: this.abiConfigs.eventAbis.comptroller,
      target: config.address,
      method: 'compBorrowSpeeds',
      params: [cTokenContract],
      blockNumber,
    });

    if (compSupplySpeeds && compBorrowSpeeds) {
      return {
        supplySpeed: formatBigNumberToString(compSupplySpeeds.toString(), 18),
        borrowSpeed: formatBigNumberToString(compBorrowSpeeds.toString(), 18),
      };
    } else {
      return null;
    }
  }

  protected async getMarketRewards(
    config: CompoundLendingMarketConfig,
    cTokenContract: string,
    blockNumber: number,
  ): Promise<Rewards | null> {
    if (!config.governanceToken) {
      return null;
    }

    const speeds = await this.getMarketCompSpeeds(config, cTokenContract, blockNumber);

    if (speeds) {
      const blockPerYear = TimeUnits.SecondsPerYear / ChainBlockPeriods[config.chain];
      const compPerYearForSuppliers = new BigNumber(speeds.supplySpeed).multipliedBy(blockPerYear).toString(10);
      const compPerYearForBorrowers = new BigNumber(speeds.supplySpeed).multipliedBy(blockPerYear).toString(10);

      return {
        forLenders: [
          {
            token: config.governanceToken,
            amount: compPerYearForSuppliers,
          },
        ],
        forBorrowers: [
          {
            token: config.governanceToken,
            amount: compPerYearForBorrowers,
          },
        ],
      };
    }

    return null;
  }

  protected async getMarketRates(chain: string, cTokenContract: string, blockNumber: number): Promise<Rates> {
    const supplyRatePerBlock = await this.services.blockchain.readContract({
      chain: chain,
      abi: this.abiConfigs.eventAbis.cErc20,
      target: cTokenContract,
      method: 'supplyRatePerBlock',
      params: [],
      blockNumber,
    });
    const borrowRatePerBlock = await this.services.blockchain.readContract({
      chain: chain,
      abi: this.abiConfigs.eventAbis.cErc20,
      target: cTokenContract,
      method: 'borrowRatePerBlock',
      params: [],
      blockNumber,
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

  public async getDataState(options: GetAdapterDataStateOptions): Promise<Array<CrossLendingReserveDataState> | null> {
    const result: Array<CrossLendingReserveDataState> = [];

    const marketConfig = options.config as CompoundLendingMarketConfig;
    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[marketConfig.chain].blockSubgraph,
      options.timestamp,
    );

    const allMarket = await this.getAllMarkets(marketConfig, blockNumber);
    if (allMarket) {
      for (let cTokenContract of allMarket) {
        cTokenContract = normalizeAddress(cTokenContract);

        if (marketConfig.blacklists && marketConfig.blacklists[cTokenContract]) {
          continue;
        }

        let token: Token | null = null;
        if (marketConfig.underlying[cTokenContract]) {
          token = marketConfig.underlying[cTokenContract];
        } else {
          const underlying = await this.services.blockchain.readContract({
            chain: marketConfig.chain,
            abi: this.abiConfigs.eventAbis.cErc20,
            target: cTokenContract,
            method: 'underlying',
            params: [],
            blockNumber,
          });
          if (underlying) {
            token = await this.services.blockchain.getTokenInfo({
              chain: marketConfig.chain,
              address: underlying.toString(),
            });
          }
        }

        if (token) {
          const totalCash = await this.services.blockchain.readContract({
            chain: marketConfig.chain,
            abi: this.abiConfigs.eventAbis.cErc20,
            target: cTokenContract,
            method: 'getCash',
            params: [],
            blockNumber,
          });
          const totalBorrows = await this.services.blockchain.readContract({
            chain: marketConfig.chain,
            abi: this.abiConfigs.eventAbis.cErc20,
            target: cTokenContract,
            method: 'totalBorrows',
            params: [],
            blockNumber,
          });
          const totalReserves = await this.services.blockchain.readContract({
            chain: marketConfig.chain,
            abi: this.abiConfigs.eventAbis.cErc20,
            target: cTokenContract,
            method: 'totalReserves',
            params: [],
            blockNumber,
          });
          const ltv = await this.getMarketLoanToValueRate(marketConfig, cTokenContract, blockNumber);

          const totalDeposited = new BigNumber(totalCash.toString())
            .plus(new BigNumber(totalBorrows.toString()))
            .minus(new BigNumber(totalReserves.toString()));
          const totalBorrowed = new BigNumber(totalBorrows.toString());

          // get market rates
          const { supplyRate, borrowRate } = await this.getMarketRates(marketConfig.chain, cTokenContract, blockNumber);

          const tokenPrice = await this.services.oracle.getTokenPriceUsd({
            chain: token.chain,
            address: token.address,
            timestamp: options.timestamp,
          });

          let rewardSupplyRate = '0';
          let rewardBorrowRate = '0';

          if (marketConfig.governanceToken) {
            const compPerYear = await this.getMarketRewards(marketConfig, cTokenContract, blockNumber);
            if (compPerYear) {
              const governanceTokenPrice = await this.services.oracle.getTokenPriceUsd({
                chain: marketConfig.governanceToken.chain,
                address: marketConfig.governanceToken.address,
                timestamp: options.timestamp,
              });
              if (governanceTokenPrice && tokenPrice) {
                rewardSupplyRate = new BigNumber(compPerYear.forLenders[0].amount)
                  .multipliedBy(governanceTokenPrice)
                  .dividedBy(
                    new BigNumber(formatBigNumberToString(totalDeposited.toString(10), token.decimals)).multipliedBy(
                      tokenPrice,
                    ),
                  )
                  .toString(10);
                rewardBorrowRate = new BigNumber(compPerYear.forBorrowers[0].amount)
                  .multipliedBy(governanceTokenPrice)
                  .dividedBy(
                    new BigNumber(formatBigNumberToString(totalBorrowed.toString(10), token.decimals)).multipliedBy(
                      tokenPrice,
                    ),
                  )
                  .toString(10);
              }
            }
          }

          const dataState: CrossLendingReserveDataState = {
            metric: marketConfig.metric,
            chain: marketConfig.chain,
            protocol: marketConfig.protocol,
            address: cTokenContract,
            timestamp: options.timestamp,

            token: token,
            tokenPrice: tokenPrice ? tokenPrice : '0',

            totalDeposited: formatBigNumberToString(totalDeposited.toString(10), token.decimals),
            totalBorrowed: formatBigNumberToString(totalBorrowed.toString(10), token.decimals),

            rateSupply: supplyRate,
            rateBorrow: borrowRate,
            rateLoanToValue: ltv,

            rateRewardSupply: rewardSupplyRate,
            rateRewardBorrow: rewardBorrowRate,
          };

          result.push(dataState);
        }
      }
    }

    return result;
  }

  public async getEventLogs(config: MetricConfig, fromBlock: number, toBlock: number): Promise<Array<any>> {
    let logs: Array<any> = [];

    // get comptroller logs
    logs = await this.services.blockchain.getContractLogs({
      chain: config.chain,
      address: config.address,
      fromBlock: fromBlock,
      toBlock: toBlock,
    });

    const allMarkets = await this.getAllMarkets(config as CompoundLendingMarketConfig, fromBlock);
    if (allMarkets) {
      for (const cToken of allMarkets) {
        logs = logs.concat(
          await this.services.blockchain.getContractLogs({
            chain: config.chain,
            address: cToken.toString(),
            fromBlock: fromBlock,
            toBlock: toBlock,
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

  public async getDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<Array<CrossLendingReserveDataTimeframe> | null> {
    const states = await this.getDataState({
      config: options.config,
      timestamp: options.fromTime,
    });
    if (!states) {
      return null;
    }

    const result: Array<CrossLendingReserveDataTimeframe> = [];

    // make sure activities were synced
    const beginBlock = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.fromTime,
    );
    const endBlock = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.toTime,
    );

    const logs = await this.getEventLogs(options.config, beginBlock, endBlock);

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
