import BigNumber from 'bignumber.js';

import { ProtocolConfigs } from '../../../configs';
import CompoundComptrollerAbi from '../../../configs/abi/compound/Comptroller.json';
import cErc20Abi from '../../../configs/abi/compound/cErc20.json';
import { ChainBlockPeriods, DAY, YEAR } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { CompoundLendingMarketConfig, CompoundProtocolConfig } from '../../../configs/protocols/compound';
import logger from '../../../lib/logger';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { compareAddress, formatFromDecimals, getDateString, normalizeAddress } from '../../../lib/utils';
import { LendingMarketConfig, ProtocolConfig } from '../../../types/configs';
import { TokenRewardEntry } from '../../../types/domains/base';
import { LendingCdpSnapshot, LendingMarketSnapshot } from '../../../types/domains/lending';
import { ContextServices } from '../../../types/namespaces';
import { GetLendingMarketSnapshotOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import { CompoundEventAbiMappings, CompoundEventInterfaces, CompoundEventSignatures } from './abis';

export interface CompoundMarketRates {
  borrowRate: string;
  supplyRate: string;
}

export interface CompoundMarketRewards {
  lenderTokenRewards: Array<TokenRewardEntry>;
  borrowerTokenRewards: Array<TokenRewardEntry>;
}

export default class CompoundAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.compound';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = CompoundEventSignatures;
    this.abiConfigs.eventAbiMappings = CompoundEventAbiMappings;
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

  protected async getMarketRewardsSpeed(
    config: LendingMarketConfig,
    blockNumber: number,
  ): Promise<{
    supplySpeed: string;
    borrowSpeed: string;
  } | null> {
    // compound rewards were calculated based on supply and borrow speeds
    const comptroller = ProtocolConfigs[config.protocol]
      ? (ProtocolConfigs[config.protocol] as CompoundProtocolConfig).comptrollers[config.chain]
      : null;
    if (comptroller) {
      const supplySpeed = await this.services.blockchain.singlecall({
        chain: config.chain,
        abi: CompoundComptrollerAbi,
        target: comptroller.address,
        method: 'compSupplySpeeds',
        params: [config.address],
        blockNumber: blockNumber,
      });
      const borrowSpeed = await this.services.blockchain.singlecall({
        chain: config.chain,
        abi: CompoundComptrollerAbi,
        target: comptroller.address,
        method: 'compBorrowSpeeds',
        params: [config.address],
        blockNumber: blockNumber,
      });

      return {
        supplySpeed: supplySpeed.toString(),
        borrowSpeed: borrowSpeed.toString(),
      };
    }

    return null;
  }

  protected async getMarketRewards(config: LendingMarketConfig, timestamp: number): Promise<CompoundMarketRewards> {
    const rewards: CompoundMarketRewards = {
      lenderTokenRewards: [],
      borrowerTokenRewards: [],
    };

    // compound rewards were calculated based on supply and borrow speeds
    const comptroller = ProtocolConfigs[config.protocol]
      ? (ProtocolConfigs[config.protocol] as CompoundProtocolConfig).comptrollers[config.chain]
      : null;

    if (comptroller) {
      const startDayBlock = await tryQueryBlockNumberAtTimestamp(
        EnvConfig.blockchains[config.chain].blockSubgraph,
        timestamp,
      );
      const endDayBlock = await tryQueryBlockNumberAtTimestamp(
        EnvConfig.blockchains[config.chain].blockSubgraph,
        timestamp + DAY - 1,
      );

      const numberOfBlocks = endDayBlock - startDayBlock;
      const speeds = await this.getMarketRewardsSpeed(config, startDayBlock);

      if (speeds) {
        const rewardAmountForLender = new BigNumber(speeds.supplySpeed.toString()).multipliedBy(numberOfBlocks);
        const rewardAmountForBorrower = new BigNumber(speeds.borrowSpeed.toString()).multipliedBy(numberOfBlocks);

        const tokenPrice = await this.services.oracle.getTokenPriceUsd({
          chain: config.chain,
          address: comptroller.governanceToken.address,
          timestamp: timestamp,
        });

        rewards.lenderTokenRewards.push({
          token: comptroller.governanceToken,
          tokenPrice: tokenPrice ? tokenPrice : '0',
          tokenAmount: formatFromDecimals(rewardAmountForLender.toString(10), comptroller.governanceToken.decimals),
        });
        rewards.borrowerTokenRewards.push({
          token: comptroller.governanceToken,
          tokenPrice: tokenPrice ? tokenPrice : '0',
          tokenAmount: formatFromDecimals(rewardAmountForBorrower.toString(10), comptroller.governanceToken.decimals),
        });
      }
    }

    return rewards;
  }

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot | LendingCdpSnapshot> | null> {
    const marketConfig = options.config as CompoundLendingMarketConfig;
    const eventSignatures = this.abiConfigs.eventSignatures as CompoundEventInterfaces;

    const blockNumber = await tryQueryBlockNumberAtTimestamp(
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
    const totalFeesCollected = totalDeposited.multipliedBy(new BigNumber(borrowRate)).dividedBy(365);

    const token = (options.config as CompoundLendingMarketConfig).underlying;
    const tokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: token.chain,
      address: token.address,
      timestamp: options.timestamp,
    });

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
        case eventSignatures.Mint:
        case eventSignatures.Redeem: {
          if (signature === eventSignatures.Mint) {
            volumeDeposited = volumeDeposited.plus(new BigNumber(event[1].toString()));
          } else {
            volumeWithdrawn = volumeWithdrawn.plus(new BigNumber(event[1].toString()));
          }

          const address = normalizeAddress(event[0]);
          if (!lenders[address]) {
            countLenders += 1;
            lenders[address] = true;
          }

          await this.booker.saveAddressBookLending({
            chain: marketConfig.chain,
            protocol: marketConfig.protocol,
            address: address,
            market: marketConfig.address,
            token: token.address,
            sector: 'lending',
            role: 'lender',
            firstTime: options.timestamp,
          });

          break;
        }

        case eventSignatures.Borrow:
        case eventSignatures.Repay: {
          if (signature === eventSignatures.Borrow) {
            volumeBorrowed = volumeBorrowed.plus(new BigNumber(event[1].toString()));
          } else {
            volumeRepaid = volumeRepaid.plus(new BigNumber(event[2].toString()));

            await this.booker.saveAddressBookLending({
              chain: marketConfig.chain,
              protocol: marketConfig.protocol,
              address: normalizeAddress(event[1].toString()),
              market: marketConfig.address,
              token: token.address,
              sector: 'lending',
              role: 'borrower',
              firstTime: options.timestamp,
            });
          }

          const address = normalizeAddress(event[0]);
          if (!borrowers[address]) {
            countBorrowers += 1;
            borrowers[address] = true;
          }

          await this.booker.saveAddressBookLending({
            chain: marketConfig.chain,
            protocol: marketConfig.protocol,
            address: normalizeAddress(event[0].toString()),
            market: marketConfig.address,
            token: token.address,
            sector: 'lending',
            role: 'borrower',
            firstTime: options.timestamp,
          });

          break;
        }

        case eventSignatures.Liquidate: {
          volumeRepaid = volumeRepaid.plus(new BigNumber(event[2].toString()));

          // borrower address
          const borrower = normalizeAddress(event[1]);
          if (!borrowers[borrower]) {
            countBorrowers += 1;
            borrowers[borrower] = true;
          }

          await this.booker.saveAddressBookLending({
            chain: marketConfig.chain,
            protocol: marketConfig.protocol,
            address: normalizeAddress(event[0].toString()),
            market: marketConfig.address,
            token: token.address,
            sector: 'lending',
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

          await this.booker.saveAddressBookLending({
            chain: marketConfig.chain,
            protocol: marketConfig.protocol,
            address: liquidator,
            market: marketConfig.address,
            token: token.address,
            sector: 'lending',
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
      type: 'cross',
      chain: marketConfig.chain,
      protocol: marketConfig.protocol,
      address: normalizeAddress(marketConfig.address),
      timestamp: options.timestamp,

      token: token,
      tokenPrice: tokenPrice ? tokenPrice : '0',

      balances: {
        deposit: formatFromDecimals(totalDeposited.toString(10), token.decimals),
        borrow: formatFromDecimals(totalBorrowed.toString(10), token.decimals),
        fees: formatFromDecimals(totalFeesCollected.toString(10), token.decimals),
      },

      volumes: {
        deposit: formatFromDecimals(volumeDeposited.toString(10), token.decimals),
        withdraw: formatFromDecimals(volumeWithdrawn.toString(10), token.decimals),
        borrow: formatFromDecimals(volumeBorrowed.toString(10), token.decimals),
        repay: formatFromDecimals(volumeRepaid.toString(10), token.decimals),
        liquidate: formatFromDecimals(volumeLiquidated.toString(10), token.decimals),
      },

      rates: {
        supply: supplyRate,
        borrow: borrowRate,
      },

      rewards: {
        forLenders: rewards.lenderTokenRewards,
        forBorrowers: rewards.borrowerTokenRewards,
      },

      addressCount: {
        lenders: countLenders,
        borrowers: countBorrowers,
        liquidators: countLiquidators,
      },

      transactionCount: countTransactions,
    });

    logger.info('updated lending market snapshot', {
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
