import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import CompoundComptrollerAbi from '../../../configs/abi/compound/Comptroller.json';
import CompoundComptrollerV1Abi from '../../../configs/abi/compound/ComptrollerV1.json';
import cErc20Abi from '../../../configs/abi/compound/cErc20.json';
import IronbankComptrollerOldAbi from '../../../configs/abi/ironbank/FirstComptroller.json';
import { ChainBlockPeriods, DAY, YEAR } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { CompoundLendingMarketConfig } from '../../../configs/protocols/compound';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig, Token } from '../../../types/configs';
import { ActivityActions, TokenAmountEntry } from '../../../types/domains/base';
import { CrossLendingMarketSnapshot, CrossLendingMarketState } from '../../../types/domains/lending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import {
  GetAdapterDataOptions,
  GetAdapterEventLogsOptions,
  GetSnapshotDataResult,
  GetStateDataResult,
  TransformEventLogOptions,
  TransformEventLogResult,
} from '../../../types/options';
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
  forLenders: Array<TokenAmountEntry>;
  forBorrowers: Array<TokenAmountEntry>;
}

export default class CompoundAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.compound';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

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
      const blockPerYear = YEAR / ChainBlockPeriods[config.chain];
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
      Math.floor(YEAR / ChainBlockPeriods[chain]),
    );
    const borrowRate = new BigNumber(borrowRatePerBlock).multipliedBy(Math.floor(YEAR / ChainBlockPeriods[chain]));

    return {
      supplyRate: formatBigNumberToString(supplyRate.toString(10), 18),
      borrowRate: formatBigNumberToString(borrowRate.toString(10), 18),
    };
  }

  public async getStateData(options: GetAdapterDataOptions): Promise<GetStateDataResult> {
    const result: GetStateDataResult = {
      crossLending: [],
      cdpLending: null,
    };

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

          const dataState: CrossLendingMarketState = {
            metric: marketConfig.metric,
            chain: marketConfig.chain,
            protocol: marketConfig.protocol,
            address: cTokenContract,
            timestamp: options.timestamp,

            token: token,
            tokenPrice: tokenPrice ? tokenPrice : '0',

            totalDeposited: formatBigNumberToString(totalDeposited.toString(10), token.decimals),
            totalBorrowed: formatBigNumberToString(totalBorrowed.toString(10), token.decimals),

            supplyRate: supplyRate,
            borrowRate: borrowRate,
            loanToValueRate: ltv,

            rewardSupplyRate: rewardSupplyRate,
            rewardBorrowRate: rewardBorrowRate,
          };

          if (result.crossLending) {
            result.crossLending.push(dataState);
          }
        }
      }
    }

    return result;
  }

  public async getEventLogs(options: GetAdapterEventLogsOptions): Promise<Array<any>> {
    let logs: Array<any> = [];

    // get comptroller logs
    logs = await this.services.blockchain.getContractLogs({
      chain: options.config.chain,
      address: options.config.address,
      fromBlock: options.fromBlock,
      toBlock: options.toBlock,
    });

    const allMarkets = await this.getAllMarkets(options.config as CompoundLendingMarketConfig, options.fromBlock);
    if (allMarkets) {
      for (const cToken of allMarkets) {
        logs = logs.concat(
          await this.services.blockchain.getContractLogs({
            chain: options.config.chain,
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

      if (this.supportSignature(signature) && allContracts.indexOf(address) !== -1) {
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
            const user = normalizeAddress(event.args.supplier);
            const tokenAmount = formatBigNumberToString(event.args.compDelta.toString(), token.decimals);
            result.activities.push({
              chain: options.chain,
              protocol: this.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: log.logIndex.toString(),
              blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
              timestamp: log.timestamp,
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
              let borrower: string | undefined = undefined;
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
                  borrower = normalizeAddress(event.args.borrower);
                  tokenAmount = formatBigNumberToString(event.args.repayAmount.toString(), cToken.underlying.decimals);
                  break;
                }
              }

              result.activities.push({
                chain: options.chain,
                protocol: this.config.protocol,
                address: address,
                transactionHash: log.transactionHash,
                logIndex: log.logIndex.toString(),
                blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
                timestamp: log.timestamp,
                action: action,
                user: user,
                token: cToken.underlying,
                tokenAmount: tokenAmount,
                borrower: borrower,
              });
            } else {
              const action = ActivityActions.liquidate;
              const user = normalizeAddress(event.args.liquidator);
              const borrower = normalizeAddress(event.args.borrower);
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
                    protocol: this.config.protocol,
                    address: address,
                    transactionHash: log.transactionHash,
                    logIndex: log.logIndex.toString(),
                    blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
                    timestamp: log.timestamp,
                    action: action,
                    user: user,
                    token: cToken.underlying,
                    tokenAmount: tokenAmount,
                    borrower: borrower,
                    collateralToken: cTokenCollateral.underlying,
                    collateralAmount: collateralAmount,
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

  public async getSnapshotData(
    options: GetAdapterDataOptions,
    storages: ContextStorages,
  ): Promise<GetSnapshotDataResult> {
    const states = (await this.getStateData(options)).crossLending;
    const result: GetSnapshotDataResult = {
      crossLending: [],
      cdpLending: null,
    };

    if (!states) {
      return result;
    }

    // make sure activities were synced
    await this.syncActivities(options, storages);

    const startDayTimestamp = options.timestamp;
    const endDayTimestamp = options.timestamp + DAY - 1;

    for (const stateData of states) {
      const documents = await storages.database.query({
        collection: EnvConfig.mongodb.collections.activities,
        query: {
          chain: stateData.chain,
          protocol: stateData.protocol,
          address: stateData.address,
          'token.address': stateData.token.address,
          timestamp: {
            $gte: startDayTimestamp,
            $lte: endDayTimestamp,
          },
        },
      });

      const activityData = await countCrossLendingDataFromActivities(documents);

      const feesPaidFromBorrow = new BigNumber(stateData.totalBorrowed)
        .multipliedBy(stateData.borrowRate)
        .multipliedBy(DAY)
        .dividedBy(YEAR);

      const snapshotData: CrossLendingMarketSnapshot = {
        ...stateData,
        ...activityData,
        totalFeesPaid: feesPaidFromBorrow.toString(10),
      };

      if (result.crossLending) {
        result.crossLending.push(snapshotData);
      }
    }

    return result;
  }
}
