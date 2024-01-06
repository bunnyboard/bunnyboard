import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import AaveLendingPoolV1Abi from '../../../configs/abi/aave/LendingPoolV1.json';
import { DAY, ONE_RAY, RAY_DECIMALS } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import { BlockTimestamps, tryQueryBlockNumberAtTimestamp, tryQueryBlockTimestamps } from '../../../lib/subsgraph';
import { formatFromDecimals, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig, Token } from '../../../types/configs';
import { LendingActivityAction, TokenRewardEntry } from '../../../types/domains/base';
import { LendingActivityEvent, LendingMarketSnapshot } from '../../../types/domains/lending';
import { ContextServices } from '../../../types/namespaces';
import { GetSnapshotOptions, GetSnapshotResult } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import { AaveEventInterfaces, Aavev1EventSignatures } from './abis';

export interface AaveMarketRewards {
  rewardsForLenders: Array<TokenRewardEntry>;
  rewardsForBorrowers: Array<TokenRewardEntry>;
}

export interface AaveMarketRates {
  supply: string;
  borrow: string;
  borrowStable: string;
}

export default class Aavev1Adapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.aavev1';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = Aavev1EventSignatures;
  }

  // return total deposited (in wei)
  protected getTotalDeposited(reserveData: any): string {
    return reserveData[0].toString();
  }

  // return total borrowed (in wei)
  protected getTotalBorrowed(reserveData: any): string {
    const totalBorrowed = new BigNumber(reserveData[2].toString()).plus(new BigNumber(reserveData[3].toString()));

    return totalBorrowed.toString(10);
  }

  // return total borrowed (in wei)
  protected getTotalFeesCollected(reserveData: any): string {
    const totalBorrowStable = new BigNumber(reserveData[2].toString());
    const totalBorrowVariable = new BigNumber(reserveData[3].toString());

    const borrowRateStable = new BigNumber(reserveData[6].toString());
    const borrowRateVariable = new BigNumber(reserveData[5].toString());

    const feesCollectedStable = totalBorrowStable.multipliedBy(borrowRateStable).dividedBy(ONE_RAY).dividedBy(365);
    const feesCollectedVariable = totalBorrowVariable
      .multipliedBy(borrowRateVariable)
      .dividedBy(ONE_RAY)
      .dividedBy(365);

    return feesCollectedStable.plus(feesCollectedVariable).toString(10);
  }

  protected getMarketRates(reserveData: any): AaveMarketRates {
    return {
      supply: formatFromDecimals(reserveData[4].toString(), RAY_DECIMALS),
      borrow: formatFromDecimals(reserveData[5].toString(), RAY_DECIMALS),
      borrowStable: formatFromDecimals(reserveData[6].toString(), RAY_DECIMALS),
    };
  }

  protected async getReservesList(config: AaveLendingMarketConfig, blockNumber: number): Promise<any> {
    return await this.services.blockchain.readContract({
      chain: config.chain,
      abi: AaveLendingPoolV1Abi,
      target: config.address,
      method: 'getReserves',
      params: [],
      blockNumber,
    });
  }

  protected async getReserveData(config: AaveLendingMarketConfig, reserve: string, blockNumber: number): Promise<any> {
    return await this.services.blockchain.readContract({
      chain: config.chain,
      abi: AaveLendingPoolV1Abi,
      target: config.address,
      method: 'getReserveData',
      params: [reserve],
      blockNumber,
    });
  }

  protected async getIncentiveRewards(
    config: AaveLendingMarketConfig,
    reserve: string,
    timestamp: number,
  ): Promise<AaveMarketRewards> {
    return {
      rewardsForLenders: [],
      rewardsForBorrowers: [],
    };
  }

  protected async transformEventLogs(
    config: AaveLendingMarketConfig,
    logs: Array<any>,
    timestamps: BlockTimestamps,
  ): Promise<Array<LendingActivityEvent>> {
    const activities: Array<LendingActivityEvent> = [];

    const eventSignatures: AaveEventInterfaces = this.abiConfigs.eventSignatures;
    for (const log of logs) {
      const signature = log.topics[0];
      if (Object.values(eventSignatures).indexOf(signature) !== -1) {
        const event: any = decodeEventLog({
          abi: AaveLendingPoolV1Abi,
          data: log.data,
          topics: log.topics,
        });

        if (signature !== eventSignatures.Liquidate) {
          const reserve = await this.services.blockchain.getTokenInfo({
            chain: config.chain,
            address: event.args._reserve.toString(),
          });
          if (reserve) {
            let action: LendingActivityAction = 'deposit';
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

            let amount = '0';
            let user = normalizeAddress(event.args._user.toString());
            let borrower = normalizeAddress(event.args._user.toString());

            if (signature === eventSignatures.Repay) {
              amount = formatFromDecimals(
                new BigNumber(event.args._amountMinusFees.toString())
                  .plus(new BigNumber(event.args._fees.toString()))
                  .toString(10),
                reserve.decimals,
              );
              user = normalizeAddress(event.args._repayer);
              borrower = normalizeAddress(event.args._user);
            } else {
              amount = formatFromDecimals(event.args._amount.toString(), reserve.decimals);
            }

            activities.push({
              chain: config.chain,
              protocol: this.config.protocol,
              address: config.address,
              transactionHash: log.transactionHash,
              logIndex: log.logIndex.toString(),
              blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
              timestamp: timestamps[new BigNumber(log.blockNumber.toString()).toNumber()],
              action: action,
              user: user,
              token: reserve,
              tokenAmount: amount,
              borrower: borrower,
            });
          }
        } else {
          const reserve = await this.services.blockchain.getTokenInfo({
            chain: config.chain,
            address: event.args._reserve.toString(),
          });
          const collateral = await this.services.blockchain.getTokenInfo({
            chain: config.chain,
            address: event.args._collateral.toString(),
          });

          if (reserve && collateral) {
            const user = normalizeAddress(event.args._liquidator.toString());
            const borrower = normalizeAddress(event.args._user.toString());
            const amount = formatFromDecimals(event.args._purchaseAmount.toString(), reserve.decimals);

            const collateralAmount = formatFromDecimals(
              event.args._liquidatedCollateralAmount.toString(),
              collateral.decimals,
            );
            activities.push({
              chain: config.chain,
              protocol: this.config.protocol,
              address: config.address,
              transactionHash: log.transactionHash,
              logIndex: log.logIndex.toString(),
              blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
              timestamp: timestamps[new BigNumber(log.blockNumber.toString()).toNumber()],
              action: 'liquidate',
              user: user,
              token: reserve,
              tokenAmount: amount,

              borrower: borrower,
              collateralToken: collateral,
              collateralAmount: collateralAmount,
            });
          }
        }
      }
    }

    return activities;
  }

  protected async getLendingMarketActivities(options: GetSnapshotOptions): Promise<Array<LendingActivityEvent>> {
    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );
    const blockNumberEndDay = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp + DAY - 1,
    );

    const logs = await this.services.blockchain.getContractLogs({
      chain: options.config.chain,
      address: options.config.address,
      fromBlock: blockNumber,
      toBlock: blockNumberEndDay,
    });
    const timestamps = await tryQueryBlockTimestamps(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      blockNumber,
      blockNumberEndDay,
    );

    console.log(logs);

    return await this.transformEventLogs(options.config as AaveLendingMarketConfig, logs, timestamps);
  }

  public async getLendingMarketSnapshots(options: GetSnapshotOptions): Promise<GetSnapshotResult> {
    const activities = options.collectActivities ? await this.getLendingMarketActivities(options) : [];

    const results: GetSnapshotResult = {
      activities: activities,
      snapshots: [],
    };

    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );

    const marketConfig = options.config as AaveLendingMarketConfig;

    const reservesList: Array<any> = await this.getReservesList(marketConfig, blockNumber);

    for (const reserve of reservesList) {
      const token = await this.services.blockchain.getTokenInfo({
        chain: marketConfig.chain,
        address: reserve,
      });
      if (!token) {
        continue;
      }

      const tokenPrice = await this.services.oracle.getTokenPriceUsd({
        chain: token.chain,
        address: token.address,
        timestamp: options.timestamp,
      });

      const reserveData: any = await this.getReserveData(marketConfig, reserve, blockNumber);

      const totalBorrowed = this.getTotalBorrowed(reserveData);
      const totalDeposited = this.getTotalDeposited(reserveData);
      const totalFeesCollected = this.getTotalFeesCollected(reserveData);
      const rates = this.getMarketRates(reserveData);

      const tokenRewards = await this.getIncentiveRewards(marketConfig, reserve, options.timestamp);

      // count volumes
      let volumeDeposit = new BigNumber(0);
      let volumeWithdraw = new BigNumber(0);
      let volumeBorrow = new BigNumber(0);
      let volumeRepay = new BigNumber(0);

      const volumeLiquidate: {
        [key: string]: {
          collateralToken: Token;
          collateralTokenPrice: string;
          collateralAmount: string;
        };
      } = {};
      for (const event of activities) {
        switch (event.action) {
          case 'deposit': {
            volumeDeposit = volumeDeposit.plus(new BigNumber(event.tokenAmount));
            break;
          }
          case 'withdraw': {
            volumeWithdraw = volumeWithdraw.plus(new BigNumber(event.tokenAmount));
            break;
          }
          case 'borrow': {
            volumeBorrow = volumeBorrow.plus(new BigNumber(event.tokenAmount));
            break;
          }
          case 'repay': {
            volumeRepay = volumeRepay.plus(new BigNumber(event.tokenAmount));
            break;
          }
          case 'liquidate': {
            volumeRepay = volumeRepay.plus(new BigNumber(event.tokenAmount));

            // count liquidate volume
            if (event.collateralToken && event.collateralAmount) {
              if (!volumeLiquidate[event.collateralToken.address]) {
                const collateralTokenPrice = await this.services.oracle.getTokenPriceUsd({
                  chain: options.config.chain,
                  address: event.collateralToken.address,
                  timestamp: options.timestamp,
                });
                volumeLiquidate[event.collateralToken.address] = {
                  collateralToken: event.collateralToken,
                  collateralTokenPrice: collateralTokenPrice ? collateralTokenPrice : '0',
                  collateralAmount: '0',
                };
              }

              volumeLiquidate[event.collateralToken.address].collateralAmount = new BigNumber(
                volumeLiquidate[event.collateralToken.address].collateralAmount,
              )
                .plus(new BigNumber(event.collateralAmount))
                .toString(10);
            }

            break;
          }
        }
      }

      const snapshot: LendingMarketSnapshot = {
        type: 'cross',
        chain: marketConfig.chain,
        protocol: marketConfig.protocol,
        address: normalizeAddress(marketConfig.address),
        timestamp: options.timestamp,

        token: token,
        tokenPrice: tokenPrice ? tokenPrice : '0',

        totalDeposited: formatFromDecimals(totalDeposited, token.decimals),
        totalBorrowed: formatFromDecimals(totalBorrowed, token.decimals),
        totalFeesCollected: formatFromDecimals(totalFeesCollected, token.decimals),

        supplyRate: rates.supply,
        borrowRate: rates.borrow,
        borrowRateStable: rates.borrowStable,

        volumeDeposited: volumeDeposit.toString(10),
        volumeWithdrawn: volumeWithdraw.toString(10),
        volumeBorrowed: volumeBorrow.toString(10),
        volumeRepaid: volumeRepay.toString(10),
        volumeLiquidated: Object.values(volumeLiquidate),

        rewardForLenders: tokenRewards.rewardsForLenders,
        rewardForBorrowers: tokenRewards.rewardsForBorrowers,
      };

      results.snapshots.push(snapshot);
    }

    return results;
  }
}
