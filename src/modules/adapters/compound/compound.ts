import BigNumber from 'bignumber.js';

import { ProtocolConfigs } from '../../../configs';
import cErc20Abi from '../../../configs/abi/compound/cErc20.json';
import { ChainBlockPeriods, YEAR } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { CompoundLendingMarketConfig, CompoundProtocolConfig } from '../../../configs/protocols/compound';
import logger from '../../../lib/logger';
import { queryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { compareAddress, formatFromDecimals, getDateString, normalizeAddress } from '../../../lib/utils';
import { LendingMarketConfig, ProtocolConfig } from '../../../types/configs';
import { LendingCdpSnapshot, LendingMarketSnapshot, TokenRewardEntry } from '../../../types/domains';
import { ContextServices } from '../../../types/namespaces';
import { AdapterAbiConfigs, GetLendingMarketSnapshotOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import { CompoundEventInterfaces } from './abis';

export interface CompoundMarketRates {
  borrowRate: string;
  supplyRate: string;
}

export default class CompoundAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.compound';

  constructor(services: ContextServices, config: ProtocolConfig, abiConfigs: AdapterAbiConfigs) {
    super(services, config, abiConfigs);

    if (config.lendingMarkets && config.lendingMarkets.length > 0) {
      this.contractLogCollector.contracts = config.lendingMarkets.map((market) => {
        return {
          chain: market.chain,
          protocol: market.protocol,
          address: market.address,
          birthday: market.birthday,
          topics: Object.values(this.abiConfigs.eventSignatures),
        };
      });

      const compoundConfig = config as CompoundProtocolConfig;
      for (const comptroller of Object.values(compoundConfig.comptrollers)) {
        // get the oldest birthday of all market
        let comptrollerBirthday = config.lendingMarkets[0].birthday;
        for (const market of config.lendingMarkets) {
          if (market.birthday < comptrollerBirthday) {
            comptrollerBirthday = market.birthday;
          }
        }

        this.contractLogCollector.contracts.push({
          chain: comptroller.chain,
          protocol: config.protocol,
          address: comptroller.address,
          birthday: comptrollerBirthday,
          topics: [
            (this.abiConfigs.eventSignatures as CompoundEventInterfaces).DistributedSupplierRewards,
            (this.abiConfigs.eventSignatures as CompoundEventInterfaces).DistributedBorrowerRewards,
          ],
        });
      }
    }
  }

  protected async getMarketRates(config: LendingMarketConfig, blockNumber: number): Promise<CompoundMarketRates> {
    const supplyRatePerBlock = await this.services.blockchain.singlecall({
      chain: config.chain,
      abi: cErc20Abi,
      target: config.address,
      method: 'supplyRatePerBlock',
      params: [],
      blockNumber,
    });
    const borrowRatePerBlock = await this.services.blockchain.singlecall({
      chain: config.chain,
      abi: cErc20Abi,
      target: config.address,
      method: 'borrowRatePerBlock',
      params: [],
      blockNumber,
    });

    const supplyRate = new BigNumber(supplyRatePerBlock ? supplyRatePerBlock : '0').multipliedBy(
      Math.floor(YEAR / ChainBlockPeriods[config.chain]),
    );
    const borrowRate = new BigNumber(borrowRatePerBlock).multipliedBy(
      Math.floor(YEAR / ChainBlockPeriods[config.chain]),
    );

    return {
      supplyRate: formatFromDecimals(supplyRate.toString(10), 18),
      borrowRate: formatFromDecimals(borrowRate.toString(10), 18),
    };
  }

  protected async getMarketRewards(config: LendingMarketConfig, timestamp: number): Promise<Array<TokenRewardEntry>> {
    const rewards: Array<TokenRewardEntry> = [];

    const comptroller = ProtocolConfigs[config.protocol]
      ? (ProtocolConfigs[config.protocol] as CompoundProtocolConfig).comptrollers[config.chain]
      : null;

    const eventSignatures = this.abiConfigs.eventSignatures as CompoundEventInterfaces;
    if (comptroller) {
      let rewardPaid = new BigNumber(0);
      const web3 = this.services.blockchain.getProvider(config.chain);
      const logs: Array<any> = await this.getDayContractLogs({
        chain: config.chain,
        address: comptroller.address,
        topics: [eventSignatures.DistributedSupplierRewards, eventSignatures.DistributedBorrowerRewards],
        dayStartTimestamp: timestamp,
      });

      for (const log of logs) {
        const signature = log.topics[0];
        const event = web3.eth.abi.decodeLog(
          this.abiConfigs.eventAbiMappings[signature],
          log.data,
          log.topics.slice(1),
        );
        if (compareAddress(event[0], config.address)) {
          rewardPaid = rewardPaid.plus(new BigNumber(event[2].toString()));
        }
      }

      const tokenPrice = await this.services.oracle.getTokenPriceUsd({
        chain: config.chain,
        address: comptroller.governanceToken.address,
        timestamp: timestamp,
      });

      rewards.push({
        token: comptroller.governanceToken,
        tokenPrice: tokenPrice ? tokenPrice : '0',
        tokenAmount: formatFromDecimals(rewardPaid.toString(10), comptroller.governanceToken.decimals),
      });
    }

    return rewards;
  }

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot | LendingCdpSnapshot> | null> {
    const marketConfig = options.config as CompoundLendingMarketConfig;
    const eventSignatures = this.abiConfigs.eventSignatures as CompoundEventInterfaces;

    const blockNumber = await queryBlockNumberAtTimestamp(
      EnvConfig.blockchains[marketConfig.chain].blockSubgraph,
      options.timestamp,
    );
    if (blockNumber === 0) {
      return null;
    }

    const snapshots: Array<LendingMarketSnapshot> = [];

    const totalCash = await this.services.blockchain.singlecall({
      chain: marketConfig.chain,
      abi: cErc20Abi,
      target: marketConfig.address,
      method: 'getCash',
      params: [],
      blockNumber,
    });
    const totalBorrows = await this.services.blockchain.singlecall({
      chain: marketConfig.chain,
      abi: cErc20Abi,
      target: marketConfig.address,
      method: 'totalBorrows',
      params: [],
      blockNumber,
    });
    const totalReserves = await this.services.blockchain.singlecall({
      chain: marketConfig.chain,
      abi: cErc20Abi,
      target: marketConfig.address,
      method: 'totalReserves',
      params: [],
      blockNumber,
    });

    // get market rates
    const { supplyRate, borrowRate } = await this.getMarketRates(options.config, blockNumber);

    const totalDeposited = new BigNumber(totalCash.toString())
      .plus(new BigNumber(totalBorrows.toString()))
      .minus(new BigNumber(totalReserves.toString()));
    const totalBorrowed = new BigNumber(totalBorrows.toString());

    const token = (options.config as CompoundLendingMarketConfig).underlying;
    const tokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: token.chain,
      address: token.address,
      timestamp: options.timestamp,
    });

    let feesCollected = new BigNumber(0);
    let volumeDeposited = new BigNumber(0);
    let volumeWithdrawn = new BigNumber(0);
    let volumeBorrowed = new BigNumber(0);
    let volumeRepaid = new BigNumber(0);
    let volumeLiquidated = new BigNumber(0);
    let countLenders = 0;
    let countBorrowers = 0;
    let countLiquidators = 0;
    let countTransactions = 0;

    const web3 = this.services.blockchain.getProvider(options.config.chain);
    const logs: Array<any> = await this.getDayContractLogs({
      chain: options.config.chain,
      address: options.config.address,
      topics: [
        eventSignatures.Mint,
        eventSignatures.Redeem,
        eventSignatures.Borrow,
        eventSignatures.Repay,
        eventSignatures.Liquidate,
        eventSignatures.AccrueInterest,
        eventSignatures.AccrueInterestEther,
      ],
      dayStartTimestamp: options.timestamp,
    });

    const lenders: { [key: string]: boolean } = {};
    const borrowers: { [key: string]: boolean } = {};
    const liquidators: { [key: string]: boolean } = {};
    const transactions: { [key: string]: boolean } = {};
    for (const log of logs) {
      if (!transactions[log.transactionHash]) {
        transactions[log.transactionHash] = true;
        countTransactions += 1;
      }

      const signature = log.topics[0];
      const event = web3.eth.abi.decodeLog(this.abiConfigs.eventAbiMappings[signature], log.data, log.topics.slice(1));
      switch (signature) {
        case eventSignatures.AccrueInterest:
        case eventSignatures.AccrueInterestEther: {
          feesCollected = feesCollected.plus(new BigNumber(event.interestAccumulated.toString()));
          break;
        }

        case eventSignatures.Mint:
        case eventSignatures.Redeem: {
          if (signature === eventSignatures.Mint) {
            volumeDeposited = volumeDeposited.plus(new BigNumber(event[1].toString()));
          } else {
            volumeWithdrawn = volumeDeposited.plus(new BigNumber(event[1].toString()));
          }

          const address = normalizeAddress(event[0]);
          if (!lenders[address]) {
            countLenders += 1;
            lenders[address] = true;
          }

          await this.saveAddressSnapshot({
            addressId: `${marketConfig.protocol}-${marketConfig.chain}-${normalizeAddress(
              marketConfig.address,
            )}-${normalizeAddress(token.address)}-${address}-lender`,
            protocol: this.config.protocol,
            address: address,
            role: 'lender',
            firstTime: options.timestamp,
          });

          break;
        }

        case eventSignatures.Borrow:
        case eventSignatures.Repay: {
          if (signature === eventSignatures.Borrow) {
            volumeBorrowed = volumeDeposited.plus(new BigNumber(event[1].toString()));
          } else {
            volumeRepaid = volumeDeposited.plus(new BigNumber(event[2].toString()));

            await this.saveAddressSnapshot({
              addressId: `${marketConfig.protocol}-${marketConfig.chain}-${normalizeAddress(
                marketConfig.address,
              )}-${normalizeAddress(token.address)}-${normalizeAddress(event[1])}-borrower`,
              protocol: this.config.protocol,
              address: normalizeAddress(event[1].toString()),
              role: 'borrower',
              firstTime: options.timestamp,
            });
          }

          const address = normalizeAddress(event[0]);
          if (!borrowers[address]) {
            countBorrowers += 1;
            borrowers[address] = true;
          }

          await this.saveAddressSnapshot({
            addressId: `${marketConfig.protocol}-${marketConfig.chain}-${normalizeAddress(
              marketConfig.address,
            )}-${normalizeAddress(token.address)}-${address}-borrower`,
            protocol: this.config.protocol,
            address: normalizeAddress(event[0].toString()),
            role: 'borrower',
            firstTime: options.timestamp,
          });

          break;
        }

        case eventSignatures.Liquidate: {
          volumeRepaid = volumeDeposited.plus(new BigNumber(event[2].toString()));

          // borrower address
          const borrower = normalizeAddress(event[1]);
          if (!borrowers[borrower]) {
            countBorrowers += 1;
            borrowers[borrower] = true;
          }

          await this.saveAddressSnapshot({
            addressId: `${marketConfig.protocol}-${marketConfig.chain}-${normalizeAddress(
              marketConfig.address,
            )}-${normalizeAddress(token.address)}-${borrower}-borrower`,
            protocol: this.config.protocol,
            address: normalizeAddress(event[0].toString()),
            role: 'borrower',
            firstTime: options.timestamp,
          });

          break;
        }
      }
    }

    // count liquidation volume
    const allMarkets = this.config.lendingMarkets
      ? this.config.lendingMarkets.filter(
          (item) =>
            item.chain === marketConfig.chain &&
            !compareAddress(item.address, marketConfig.address) &&
            item.birthday <= options.timestamp,
        )
      : [];
    let liquidationLogs: Array<any> = [];
    for (const otherMarket of allMarkets) {
      liquidationLogs = liquidationLogs.concat(
        await this.getDayContractLogs({
          chain: otherMarket.chain,
          address: otherMarket.address,
          topics: [eventSignatures.Liquidate],
          dayStartTimestamp: options.timestamp,
        }),
      );
    }

    let exchangeRateStored = '0';
    if (liquidationLogs.length > 0) {
      // get exchange rate
      exchangeRateStored = await this.services.blockchain.singlecall({
        chain: marketConfig.chain,
        target: marketConfig.address,
        abi: cErc20Abi,
        method: 'exchangeRateStored',
        params: [],
      });

      for (const liquidationLog of liquidationLogs) {
        const liquidationEvent = web3.eth.abi.decodeLog(
          this.abiConfigs.eventAbiMappings[eventSignatures.Liquidate],
          liquidationLog.data,
          liquidationLog.topics.slice(1),
        );
        if (compareAddress(liquidationEvent[3], marketConfig.address)) {
          // count liquidator address
          const liquidator = normalizeAddress(liquidationEvent[0]);
          if (!liquidators[liquidator]) {
            countLiquidators += 1;
            liquidators[liquidator] = true;
          }

          await this.saveAddressSnapshot({
            addressId: `${marketConfig.protocol}-${marketConfig.chain}-${normalizeAddress(
              marketConfig.address,
            )}-${normalizeAddress(token.address)}-${liquidator}-liquidator`,
            protocol: this.config.protocol,
            address: liquidator,
            role: 'liquidator',
            firstTime: options.timestamp,
          });

          // count volume
          const seizeTokens = new BigNumber(liquidationEvent[4].toString());

          const oneCTokenInUnderlying = new BigNumber(exchangeRateStored.toString());
          const tokenAmount = oneCTokenInUnderlying
            .multipliedBy(seizeTokens)
            .dividedBy(new BigNumber(10).pow(8))
            .dividedBy(new BigNumber(10).pow(8));
          volumeLiquidated = volumeLiquidated.plus(tokenAmount);
        }
      }
    }

    const rewards = await this.getMarketRewards(options.config, options.timestamp);

    snapshots.push({
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

      totalDeposited: formatFromDecimals(totalDeposited.toString(10), token.decimals),
      totalBorrowed: formatFromDecimals(totalBorrowed.toString(10), token.decimals),
      totalFeesCollected: formatFromDecimals(feesCollected.toString(10), token.decimals),

      volumeDeposited: formatFromDecimals(volumeDeposited.toString(10), token.decimals),
      volumeWithdrawn: formatFromDecimals(volumeWithdrawn.toString(10), token.decimals),
      volumeBorrowed: formatFromDecimals(volumeBorrowed.toString(10), token.decimals),
      volumeRepaid: formatFromDecimals(volumeRepaid.toString(10), token.decimals),
      volumeLiquidated: formatFromDecimals(volumeLiquidated.toString(10), token.decimals),

      addressCount: {
        lenders: countLenders,
        borrowers: countBorrowers,
        liquidators: countLiquidators,
      },

      transactionCount: countTransactions,

      supplyRate: supplyRate,
      borrowRate: borrowRate,

      tokenRewards: rewards,
    });

    logger.info('got lending market snapshot', {
      service: this.name,
      protocol: this.config.protocol,
      chain: marketConfig.chain,
      version: marketConfig.version,
      token: `${token.symbol}:${token.address}`,
      date: getDateString(options.timestamp),
    });

    return snapshots;
  }
}
