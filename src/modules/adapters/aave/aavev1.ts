import BigNumber from 'bignumber.js';

import AaveLendingPoolV1Abi from '../../../configs/abi/aave/LendingPoolV1.json';
import { DAY, UNIT_RAY } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import logger from '../../../lib/logger';
import { queryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { compareAddress, formatFromDecimals, getDateString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig, Token } from '../../../types/configs';
import { LendingCdpSnapshot, LendingMarketSnapshot } from '../../../types/domains';
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
  countAddresses: number;
  countTransactions: number;
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

  protected async getEventStats(
    config: AaveLendingMarketConfig,
    token: Token,
    timestamp: number,
  ): Promise<AaveMarketEventStats> {
    const eventSignatures = this.abiConfigs.eventSignatures as AaveEventInterfaces;

    let volumeDeposited = new BigNumber(0);
    let volumeWithdrawn = new BigNumber(0);
    let volumeBorrowed = new BigNumber(0);
    let volumeRepaid = new BigNumber(0);
    let volumeLiquidated = new BigNumber(0);
    let countAddresses = 0;
    let countTransactions = 0;

    const logs = await this.getDayContractLogs({
      chain: config.chain,
      address: config.address,
      topics: Object.values(eventSignatures),
      dayStartTimestamp: timestamp,
    });

    const web3 = this.services.blockchain.getProvider(config.chain);

    const addresses: { [key: string]: boolean } = {};
    const transactions: { [key: string]: boolean } = {};
    for (const log of logs) {
      const signature = log.topics[0];
      const event = web3.eth.abi.decodeLog(this.abiConfigs.eventAbiMappings[signature], log.data, log.topics.slice(1));

      let reserve;
      if (signature === eventSignatures.Liquidate) {
        reserve = normalizeAddress(event._reserve ? event._reserve : event.debtAsset);
      } else {
        reserve = normalizeAddress(event._reserve ? event._reserve : event.reserve);
      }

      if (compareAddress(reserve, token.address)) {
        if (!transactions[log.transactionHash]) {
          transactions[log.transactionHash] = true;
          countTransactions += 1;
        }

        const address = normalizeAddress(signature === eventSignatures.Liquidate ? event[2] : event[1]);
        if (!addresses[address]) {
          addresses[address] = true;
          countAddresses += 1;
        }

        switch (signature) {
          case eventSignatures.Deposit:
          case eventSignatures.Withdraw: {
            if (signature === eventSignatures.Deposit) {
              volumeDeposited = volumeDeposited.plus(new BigNumber(event[0].toString()));
            } else {
              volumeWithdrawn = volumeWithdrawn.plus(new BigNumber(event[0].toString()));
            }

            const user = normalizeAddress(event[1]);
            await this.booker.saveAddressBookLending({
              addressId: '', // filled by booker
              chain: config.chain,
              protocol: config.protocol,
              address: user,
              marketAddress: config.address,
              tokenAddress: token.address,
              role: 'lender',
              firstTime: timestamp,
            });

            if (event.onBehalfOf) {
              await this.booker.saveAddressBookLending({
                addressId: '', // filled by booker
                chain: config.chain,
                protocol: config.protocol,
                address: normalizeAddress(event.onBehalfOf),
                marketAddress: config.address,
                tokenAddress: token.address,
                role: 'lender',
                firstTime: timestamp,
              });
            }
            if (event.to) {
              await this.booker.saveAddressBookLending({
                addressId: '', // filled by booker
                chain: config.chain,
                protocol: config.protocol,
                address: normalizeAddress(event.to),
                marketAddress: config.address,
                tokenAddress: token.address,
                role: 'lender',
                firstTime: timestamp,
              });
            }

            break;
          }

          case eventSignatures.Borrow:
          case eventSignatures.Repay: {
            if (signature === eventSignatures.Borrow) {
              volumeBorrowed = volumeBorrowed.plus(new BigNumber(event[0].toString()));
            } else {
              volumeRepaid = volumeRepaid.plus(new BigNumber(event[0].toString()));
            }

            const user = normalizeAddress(event[1]);
            await this.booker.saveAddressBookLending({
              addressId: '', // filled by booker
              chain: config.chain,
              protocol: config.protocol,
              address: user,
              marketAddress: config.address,
              tokenAddress: token.address,
              role: 'borrower',
              firstTime: timestamp,
            });
            if (event.onBehalfOf) {
              await this.booker.saveAddressBookLending({
                addressId: '', // filled by booker
                chain: config.chain,
                protocol: config.protocol,
                address: normalizeAddress(event.onBehalfOf),
                marketAddress: config.address,
                tokenAddress: token.address,
                role: 'borrower',
                firstTime: timestamp,
              });
            }
            if (event.to) {
              await this.booker.saveAddressBookLending({
                addressId: '', // filled by booker
                chain: config.chain,
                protocol: config.protocol,
                address: normalizeAddress(event.to),
                marketAddress: config.address,
                tokenAddress: token.address,
                role: 'borrower',
                firstTime: timestamp,
              });
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
                addressId: '', // filled by booker
                chain: config.chain,
                protocol: config.protocol,
                address: user,
                marketAddress: config.address,
                tokenAddress: token.address,
                role: 'borrower',
                firstTime: timestamp,
              });
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
                  addressId: '', // filled by booker
                  chain: config.chain,
                  protocol: config.protocol,
                  address: liquidator,
                  marketAddress: config.address,
                  tokenAddress: token.address,
                  role: 'liquidator',
                  firstTime: timestamp,
                });
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
      countAddresses: countAddresses,
      countTransactions: countTransactions,
    };
  }

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot | LendingCdpSnapshot> | null> {
    const blockNumber = await queryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );
    if (blockNumber === 0) {
      return null;
    }

    const marketConfig = options.config as AaveLendingMarketConfig;

    const snapshots: Array<LendingMarketSnapshot> = [];

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

      // calculate liquidity index increase
      let totalFeesCollected = '0';
      const dayEndBlock = await queryBlockNumberAtTimestamp(
        EnvConfig.blockchains[options.config.chain].blockSubgraph,
        options.timestamp + DAY - 1,
      );
      if (dayEndBlock) {
        const reserveDataEndDay: any = await this.getReserveData(marketConfig, reserve, dayEndBlock);
        const liquidityIndexBefore = new BigNumber(reserveData.liquidityIndex.toString());
        const liquidityIndexAfter = new BigNumber(reserveDataEndDay.liquidityIndex.toString());
        const liquidityIndexIncrease = liquidityIndexAfter.minus(liquidityIndexBefore);

        totalFeesCollected = new BigNumber(totalDeposited)
          .multipliedBy(liquidityIndexIncrease)
          .dividedBy(new BigNumber(UNIT_RAY))
          .toString(10);
      }

      const eventStats = await this.getEventStats(marketConfig, token, options.timestamp);

      const snapshot: LendingMarketSnapshot = {
        marketId: `${marketConfig.protocol}-${marketConfig.chain}-${normalizeAddress(
          marketConfig.address,
        )}-${normalizeAddress(token.address)}`,

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

        volumeDeposited: eventStats.volumeDeposited,
        volumeWithdrawn: eventStats.volumeWithdrawn,
        volumeBorrowed: eventStats.volumeBorrowed,
        volumeRepaid: eventStats.volumeRepaid,
        volumeLiquidated: eventStats.volumeLiquidated,

        addressCount: {
          lenders: eventStats.countAddresses,
        },
        transactionCount: eventStats.countTransactions,

        supplyRate: formatFromDecimals(reserveData.liquidityRate.toString(), 27),
        borrowRate: formatFromDecimals(reserveData.variableBorrowRate.toString(), 27),
        borrowRateStable: formatFromDecimals(reserveData.stableBorrowRate.toString(), 27),

        tokenRewards: [],
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
