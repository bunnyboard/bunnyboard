import BigNumber from 'bignumber.js';

import AaveLendingPoolV1Abi from '../../../configs/abi/aave/LendingPoolV1.json';
import { ONE_RAY } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import logger from '../../../lib/logger';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { compareAddress, formatFromDecimals, getDateString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig, Token } from '../../../types/configs';
import { TokenRewardEntry } from '../../../types/domains/base';
import { LendingCdpSnapshot, LendingMarketSnapshot } from '../../../types/domains/lending';
import { ContextServices } from '../../../types/namespaces';
import { GetLendingMarketSnapshotOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import { AaveEventInterfaces, Aavev1EventAbiMappings, Aavev1EventSignatures } from './abis';

export interface AaveMarketEventStats {
  volumeDeposited: string;
  volumeWithdrawn: string;
  volumeBorrowed: string;
  volumeRepaid: string;
  volumeLiquidated: string;
  counterLenders: number;
  counterBorrowers: number;
  counterLiquidators: number;
  countTransactions: number;
}

export interface AaveMarketRewards {
  rewardsForLenders: Array<TokenRewardEntry>;
  rewardsForBorrowers: Array<TokenRewardEntry>;
}

export default class Aavev1Adapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.aavev1';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = Aavev1EventSignatures;
    this.abiConfigs.eventAbiMappings = Aavev1EventAbiMappings;
  }

  // return total deposited (in wei)
  protected getTotalDeposited(reserveData: any): string {
    return reserveData.totalLiquidity.toString();
  }

  // return total borrowed (in wei)
  protected getTotalBorrowed(reserveData: any): string {
    const totalBorrowed = new BigNumber(reserveData.totalBorrowsStable.toString()).plus(
      new BigNumber(reserveData.totalBorrowsVariable.toString()),
    );

    return totalBorrowed.toString(10);
  }

  // return total borrowed (in wei)
  protected getTotalFeesCollected(reserveData: any): string {
    const totalBorrowStable = new BigNumber(reserveData.totalBorrowsStable.toString());
    const totalBorrowVariable = new BigNumber(reserveData.totalBorrowsVariable.toString());

    const borrowRateStable = new BigNumber(reserveData.stableBorrowRate.toString());
    const borrowRateVariable = new BigNumber(reserveData.variableBorrowRate.toString());

    const feesCollectedStable = totalBorrowStable.multipliedBy(borrowRateStable).dividedBy(ONE_RAY).dividedBy(365);
    const feesCollectedVariable = totalBorrowVariable
      .multipliedBy(borrowRateVariable)
      .dividedBy(ONE_RAY)
      .dividedBy(365);

    return feesCollectedStable.plus(feesCollectedVariable).toString(10);
  }

  protected async getReservesList(config: AaveLendingMarketConfig, blockNumber: number): Promise<any> {
    return await this.services.blockchain.singlecall({
      chain: config.chain,
      abi: AaveLendingPoolV1Abi,
      target: config.address,
      method: 'getReserves',
      params: [],
      blockNumber,
    });
  }

  protected async getReserveData(config: AaveLendingMarketConfig, reserve: string, blockNumber: number): Promise<any> {
    return await this.services.blockchain.singlecall({
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

  protected async getEventStats(
    config: AaveLendingMarketConfig,
    logs: Array<any>,
    token: Token,
    timestamp: number,
  ): Promise<AaveMarketEventStats> {
    const eventSignatures = this.abiConfigs.eventSignatures as AaveEventInterfaces;

    let volumeDeposited = new BigNumber(0);
    let volumeWithdrawn = new BigNumber(0);
    let volumeBorrowed = new BigNumber(0);
    let volumeRepaid = new BigNumber(0);
    let volumeLiquidated = new BigNumber(0);
    let countLenders = 0;
    let countBorrowers = 0;
    let countLiquidators = 0;
    let countTransactions = 0;

    const web3 = this.services.blockchain.getProvider(config.chain);

    const addresses: { [key: string]: boolean } = {};
    const transactions: { [key: string]: boolean } = {};
    for (const log of logs) {
      const signature = log.topics[0];
      const event = web3.eth.abi.decodeLog(this.abiConfigs.eventAbiMappings[signature], log.data, log.topics.slice(1));

      let reserve;
      let collateralAddress = '';
      if (signature === eventSignatures.Liquidate) {
        reserve = normalizeAddress(event._reserve ? event._reserve : event.debtAsset);
        collateralAddress = normalizeAddress(event._collateral ? event._collateral : event.collateralAsset);
      } else {
        reserve = normalizeAddress(event._reserve ? event._reserve : event.reserve);
      }

      if (compareAddress(reserve, token.address) || compareAddress(collateralAddress, token.address)) {
        if (!transactions[log.transactionHash]) {
          transactions[log.transactionHash] = true;
          countTransactions += 1;
        }

        switch (signature) {
          case eventSignatures.Deposit:
          case eventSignatures.Withdraw: {
            const amount = event._amount ? event._amount.toString() : event.amount.toString();
            if (signature === eventSignatures.Deposit) {
              volumeDeposited = volumeDeposited.plus(new BigNumber(amount));
            } else {
              volumeWithdrawn = volumeWithdrawn.plus(new BigNumber(amount));
            }

            const user = normalizeAddress(event[1]);
            await this.booker.saveAddressBookLending({
              chain: config.chain,
              protocol: config.protocol,
              address: user,
              market: config.address,
              token: token.address,
              sector: 'lending',
              role: 'lender',
              firstTime: timestamp,
            });

            if (!addresses[user]) {
              countLenders += 1;
              addresses[user] = true;
            }

            if (event.onBehalfOf) {
              await this.booker.saveAddressBookLending({
                chain: config.chain,
                protocol: config.protocol,
                address: normalizeAddress(event.onBehalfOf),
                market: config.address,
                token: token.address,
                sector: 'lending',
                role: 'lender',
                firstTime: timestamp,
              });
              if (!addresses[normalizeAddress(event.onBehalfOf)]) {
                countLenders += 1;
                addresses[normalizeAddress(event.onBehalfOf)] = true;
              }
            }
            if (event.to) {
              await this.booker.saveAddressBookLending({
                chain: config.chain,
                protocol: config.protocol,
                address: normalizeAddress(event.to),
                market: config.address,
                token: token.address,
                sector: 'lending',
                role: 'lender',
                firstTime: timestamp,
              });
              if (!addresses[normalizeAddress(event.to)]) {
                countLenders += 1;
                addresses[normalizeAddress(event.to)] = true;
              }
            }

            break;
          }

          case eventSignatures.Borrow:
          case eventSignatures.Repay: {
            if (signature === eventSignatures.Borrow) {
              const amount = event._amount ? event._amount.toString() : event.amount.toString();
              volumeBorrowed = volumeBorrowed.plus(new BigNumber(amount));
            } else {
              if (event._amountMinusFees) {
                volumeRepaid = volumeRepaid
                  .plus(new BigNumber(event._amountMinusFees.toString()))
                  .plus(new BigNumber(event._fees.toString()));
              } else {
                volumeRepaid = volumeRepaid.plus(new BigNumber(event.amount.toString()));
              }
            }

            const user = normalizeAddress(event[1]);
            await this.booker.saveAddressBookLending({
              chain: config.chain,
              protocol: config.protocol,
              address: user,
              market: config.address,
              token: token.address,
              sector: 'lending',
              role: 'borrower',
              firstTime: timestamp,
            });
            if (!addresses[user]) {
              countBorrowers += 1;
              addresses[user] = true;
            }

            if (event.onBehalfOf) {
              await this.booker.saveAddressBookLending({
                chain: config.chain,
                protocol: config.protocol,
                address: normalizeAddress(event.onBehalfOf),
                market: config.address,
                token: token.address,
                sector: 'lending',
                role: 'borrower',
                firstTime: timestamp,
              });
              if (!addresses[normalizeAddress(event.onBehalfOf)]) {
                countBorrowers += 1;
                addresses[normalizeAddress(event.onBehalfOf)] = true;
              }
            }
            if (event.to) {
              await this.booker.saveAddressBookLending({
                chain: config.chain,
                protocol: config.protocol,
                address: normalizeAddress(event.to),
                market: config.address,
                token: token.address,
                sector: 'lending',
                role: 'borrower',
                firstTime: timestamp,
              });
              if (!addresses[normalizeAddress(event.to)]) {
                countBorrowers += 1;
                addresses[normalizeAddress(event.to)] = true;
              }
            }

            break;
          }

          case eventSignatures.Liquidate: {
            if (compareAddress(reserve, token.address)) {
              volumeRepaid = volumeRepaid.plus(
                new BigNumber(event._purchaseAmount ? event._purchaseAmount.toString() : event.debtToCover.toString()),
              );

              const user = normalizeAddress(event._user ? event._user : event.user);
              await this.booker.saveAddressBookLending({
                chain: config.chain,
                protocol: config.protocol,
                address: user,
                market: config.address,
                token: token.address,
                sector: 'lending',
                role: 'borrower',
                firstTime: timestamp,
              });
              if (!addresses[user]) {
                countBorrowers += 1;
                addresses[user] = true;
              }
            } else {
              const collateral = event._collateral ? event.collateral : event.collateralAsset;
              if (compareAddress(collateral, token.address)) {
                volumeLiquidated = volumeLiquidated.plus(
                  new BigNumber(
                    event._liquidatedCollateralAmount
                      ? event._liquidatedCollateralAmount.toString()
                      : event.liquidatedCollateralAmount.toString(),
                  ),
                );

                const liquidator = normalizeAddress(event._liquidator ? event._liquidator : event.liquidator);
                await this.booker.saveAddressBookLending({
                  chain: config.chain,
                  protocol: config.protocol,
                  address: liquidator,
                  market: config.address,
                  token: token.address,
                  sector: 'lending',
                  role: 'liquidator',
                  firstTime: timestamp,
                });

                if (!addresses[liquidator]) {
                  countLiquidators += 1;
                  addresses[liquidator] = true;
                }
              }
            }

            break;
          }
        }
      }
    }

    return {
      volumeDeposited: formatFromDecimals(volumeDeposited.toString(10), token.decimals),
      volumeWithdrawn: formatFromDecimals(volumeWithdrawn.toString(10), token.decimals),
      volumeBorrowed: formatFromDecimals(volumeBorrowed.toString(10), token.decimals),
      volumeRepaid: formatFromDecimals(volumeRepaid.toString(10), token.decimals),
      volumeLiquidated: formatFromDecimals(volumeLiquidated.toString(10), token.decimals),
      counterLenders: countLenders,
      counterBorrowers: countBorrowers,
      counterLiquidators: countLiquidators,
      countTransactions: countTransactions,
    };
  }

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot | LendingCdpSnapshot> | null> {
    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );
    if (blockNumber === 0) {
      return null;
    }

    const marketConfig = options.config as AaveLendingMarketConfig;

    const snapshots: Array<LendingMarketSnapshot> = [];

    const eventSignatures = this.abiConfigs.eventSignatures as AaveEventInterfaces;
    const logs = await this.getDayContractLogs({
      chain: marketConfig.chain,
      address: marketConfig.address,
      topics: Object.values(eventSignatures),
      dayStartTimestamp: options.timestamp,
    });
    const reservesList: Array<any> = await this.getReservesList(marketConfig, blockNumber);

    for (const reserve of reservesList) {
      const token = await this.services.blockchain.getTokenInfo({
        chain: marketConfig.chain,
        address: reserve,
      });
      if (!token) {
        return null;
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

      const tokenRewards = await this.getIncentiveRewards(marketConfig, reserve, options.timestamp);

      const eventStats = await this.getEventStats(marketConfig, logs, token, options.timestamp);

      const snapshot: LendingMarketSnapshot = {
        type: 'cross',
        chain: marketConfig.chain,
        protocol: marketConfig.protocol,
        address: normalizeAddress(marketConfig.address),
        timestamp: options.timestamp,

        token: token,
        tokenPrice: tokenPrice ? tokenPrice : '0',

        balances: {
          deposit: formatFromDecimals(totalDeposited, token.decimals),
          borrow: formatFromDecimals(totalBorrowed, token.decimals),
          fees: formatFromDecimals(totalFeesCollected, token.decimals),
        },

        volumes: {
          deposit: eventStats.volumeDeposited,
          withdraw: eventStats.volumeWithdrawn,
          borrow: eventStats.volumeBorrowed,
          repay: eventStats.volumeRepaid,
          liquidate: eventStats.volumeLiquidated,
        },

        rates: {
          supply: formatFromDecimals(reserveData.liquidityRate.toString(), 27),
          borrow: formatFromDecimals(reserveData.variableBorrowRate.toString(), 27),
          borrowStable: formatFromDecimals(reserveData.stableBorrowRate.toString(), 27),
        },

        rewards: {
          forLenders: tokenRewards.rewardsForLenders,
          forBorrowers: tokenRewards.rewardsForBorrowers,
        },

        addressCount: {
          lenders: eventStats.counterLenders,
          borrowers: eventStats.counterBorrowers,
          liquidators: eventStats.counterLiquidators,
        },
        transactionCount: eventStats.countTransactions,
      };

      snapshots.push(snapshot);

      logger.info('updated lending market snapshot', {
        service: this.name,
        protocol: this.config.protocol,
        chain: marketConfig.chain,
        version: marketConfig.version,
        token: `${token.symbol}:${token.address}`,
        date: getDateString(options.timestamp),
      });
    }

    return snapshots;
  }
}
