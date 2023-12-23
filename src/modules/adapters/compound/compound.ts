import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import { ProtocolConfigs } from '../../../configs';
import CompoundComptrollerAbi from '../../../configs/abi/compound/Comptroller.json';
import cErc20Abi from '../../../configs/abi/compound/cErc20.json';
import { ChainBlockPeriods, DAY, YEAR } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { CompoundLendingMarketConfig, CompoundProtocolConfig } from '../../../configs/protocols/compound';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { compareAddress, formatFromDecimals, normalizeAddress } from '../../../lib/utils';
import { LendingMarketConfig, ProtocolConfig } from '../../../types/configs';
import { LendingActivityAction, TokenRewardEntry } from '../../../types/domains/base';
import { LendingActivityEvent, LendingCdpSnapshot, LendingMarketSnapshot } from '../../../types/domains/lending';
import { ContextServices } from '../../../types/namespaces';
import { GetLendingMarketSnapshotOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import { CompoundEventInterfaces, CompoundEventSignatures } from './abis';

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
  }

  protected async getMarketRates(config: LendingMarketConfig, blockNumber: number): Promise<CompoundMarketRates> {
    const supplyRatePerBlock = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: cErc20Abi,
      target: config.address,
      method: 'supplyRatePerBlock',
      params: [],
      blockNumber,
    });
    const borrowRatePerBlock = await this.services.blockchain.readContract({
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
      const supplySpeed = await this.services.blockchain.readContract({
        chain: config.chain,
        abi: CompoundComptrollerAbi,
        target: comptroller.address,
        method: 'compSupplySpeeds',
        params: [config.address],
        blockNumber: blockNumber,
      });
      const borrowSpeed = await this.services.blockchain.readContract({
        chain: config.chain,
        abi: CompoundComptrollerAbi,
        target: comptroller.address,
        method: 'compBorrowSpeeds',
        params: [config.address],
        blockNumber: blockNumber,
      });

      if (supplySpeed && borrowSpeed) {
        return {
          supplySpeed: supplySpeed.toString(),
          borrowSpeed: borrowSpeed.toString(),
        };
      }
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

  protected async parseEventLogDistributeReward(
    config: LendingMarketConfig,
    log: any,
  ): Promise<LendingActivityEvent | null> {
    const protocolConfig = this.config as CompoundProtocolConfig;
    if (protocolConfig.comptrollers && protocolConfig.comptrollers[config.chain]) {
      const signature = log.topics[0];
      const eventSignatures = this.abiConfigs.eventSignatures as CompoundEventInterfaces;
      if (
        signature === eventSignatures.DistributedSupplierRewards ||
        signature === eventSignatures.DistributedBorrowerRewards
      ) {
        const event: any = decodeEventLog({
          abi: CompoundComptrollerAbi,
          data: log.data,
          topics: log.topics,
        });
        const amount = formatFromDecimals(
          event.args.compDelta.toString(),
          protocolConfig.comptrollers[config.chain].governanceToken.decimals,
        );
        const user = event.args.supplier
          ? normalizeAddress(event.args.supplier)
          : normalizeAddress(event.args.borrower);

        if (amount !== '0') {
          return {
            chain: config.chain,
            protocol: this.config.protocol,
            address: config.address,
            transactionHash: log.transactionHash,
            logIndex: log.logIndex.toString(),
            blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
            action: 'collect',
            user: user,
            token: protocolConfig.comptrollers[config.chain].governanceToken,
            tokenAmount: amount,
          };
        }
      }
    }

    return null;
  }

  protected async parseEventLog(config: LendingMarketConfig, log: any): Promise<LendingActivityEvent | null> {
    const marketConfig = config as CompoundLendingMarketConfig;

    const isCollectAction = await this.parseEventLogDistributeReward(config, log);
    if (isCollectAction) {
      return isCollectAction;
    }

    const signature = log.topics[0];
    const eventSignatures = this.abiConfigs.eventSignatures as CompoundEventInterfaces;

    if (
      signature === eventSignatures.Mint ||
      signature === eventSignatures.Redeem ||
      signature === eventSignatures.Borrow ||
      signature === eventSignatures.Repay ||
      signature === eventSignatures.Liquidate
    ) {
      const event: any = decodeEventLog({
        abi: cErc20Abi,
        data: log.data,
        topics: log.topics,
      });

      let user = null;
      let amount = null;
      let action: LendingActivityAction | null = null;

      let borrower = null;
      let collateralToken = null;
      let collateralAmount = null;

      switch (signature) {
        case eventSignatures.Mint: {
          action = 'deposit';
          user = normalizeAddress(event.args.minter);
          amount = formatFromDecimals(event.args.mintAmount.toString(), marketConfig.underlying.decimals);
          break;
        }
        case eventSignatures.Redeem: {
          action = 'withdraw';
          user = normalizeAddress(event.args.redeemer);
          amount = formatFromDecimals(event.args.redeemAmount.toString(), marketConfig.underlying.decimals);
          break;
        }
        case eventSignatures.Borrow: {
          action = 'borrow';
          user = normalizeAddress(event.args.borrower);
          amount = formatFromDecimals(event.args.borrowAmount.toString(), marketConfig.underlying.decimals);
          break;
        }
        case eventSignatures.Repay: {
          action = 'repay';
          user = normalizeAddress(event.args.payer);
          borrower = normalizeAddress(event.args.borrower);
          amount = formatFromDecimals(event.args.repayAmount.toString(), marketConfig.underlying.decimals);
          break;
        }
        case eventSignatures.Liquidate: {
          action = 'liquidate';
          user = normalizeAddress(event.args.liquidator);
          borrower = normalizeAddress(event.args.borrower);
          amount = formatFromDecimals(event.args.repayAmount.toString(), marketConfig.underlying.decimals);

          let collateralMarket: CompoundLendingMarketConfig | null = null;
          for (const protocolConfig of Object.values(ProtocolConfigs)) {
            if (protocolConfig.lendingMarkets) {
              for (const market of protocolConfig.lendingMarkets) {
                if (market.chain === marketConfig.chain && compareAddress(market.address, marketConfig.address)) {
                  collateralMarket = market as CompoundLendingMarketConfig;
                }
              }
            }
          }
          if (collateralMarket) {
            const exchangeRateCurrent = await this.services.blockchain.readContract({
              chain: marketConfig.chain,
              target: collateralMarket.address,
              abi: cErc20Abi,
              method: 'exchangeRateCurrent',
              params: [],
              blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
            });
            const mantissa = 18 + collateralMarket.underlying.decimals - 8;
            const oneCTokenInUnderlying = new BigNumber(exchangeRateCurrent).dividedBy(new BigNumber(10).pow(mantissa));
            collateralToken = collateralMarket.underlying;
            collateralAmount = new BigNumber(event.args.seizeTokens.toString())
              .multipliedBy(oneCTokenInUnderlying)
              .dividedBy(1e8)
              .toString(10);
          }
          break;
        }
      }

      if (user && amount && action) {
        return {
          chain: config.chain,
          protocol: this.config.protocol,
          address: config.address,
          transactionHash: log.transactionHash,
          logIndex: log.logIndex.toString(),
          blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
          action: action,
          user: user,
          token: marketConfig.underlying,
          tokenAmount: amount,
          borrower: borrower ? borrower : undefined,
          collateralToken: collateralToken ? collateralToken : undefined,
          collateralAmount: collateralAmount ? collateralAmount : undefined,
        };
      }
    }

    return null;
  }

  public async getLendingMarketActivities(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingActivityEvent>> {
    const activities: Array<LendingActivityEvent> = [];

    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );
    const blockNumberEndDay = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp + DAY - 1,
    );

    // now we handle event log, turn them to activities
    let logs = await this.services.blockchain.getContractLogs({
      chain: options.config.chain,
      address: options.config.address,
      fromBlock: blockNumber,
      toBlock: blockNumberEndDay,
    });
    const protocolConfig = this.config as CompoundProtocolConfig;
    if (protocolConfig.comptrollers && protocolConfig.comptrollers[options.config.chain]) {
      logs = logs.concat(
        await this.services.blockchain.getContractLogs({
          chain: options.config.chain,
          address: protocolConfig.comptrollers[options.config.chain].address,
          fromBlock: blockNumber,
          toBlock: blockNumberEndDay,
        }),
      );
    }

    for (const log of logs) {
      const activityEvent = await this.parseEventLog(options.config, log);

      if (activityEvent) {
        activities.push(activityEvent);
      }
    }

    return activities;
  }

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot | LendingCdpSnapshot> | null> {
    const marketConfig = options.config as CompoundLendingMarketConfig;

    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[marketConfig.chain].blockSubgraph,
      options.timestamp,
    );

    const snapshots: Array<LendingMarketSnapshot> = [];

    const totalCash = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: cErc20Abi,
      target: marketConfig.address,
      method: 'getCash',
      params: [],
      blockNumber,
    });
    const totalBorrows = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: cErc20Abi,
      target: marketConfig.address,
      method: 'totalBorrows',
      params: [],
      blockNumber,
    });
    const totalReserves = await this.services.blockchain.readContract({
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

    const rewards = await this.getMarketRewards(options.config, options.timestamp);

    snapshots.push({
      type: 'cross',
      chain: marketConfig.chain,
      protocol: marketConfig.protocol,
      address: normalizeAddress(marketConfig.address),
      timestamp: options.timestamp,

      token: token,
      tokenPrice: tokenPrice ? tokenPrice : '0',

      totalDeposited: formatFromDecimals(totalDeposited.toString(10), token.decimals),
      totalBorrowed: formatFromDecimals(totalBorrowed.toString(10), token.decimals),
      totalFeesCollected: formatFromDecimals(totalFeesCollected.toString(10), token.decimals),

      supplyRate: supplyRate,
      borrowRate: borrowRate,

      rewardForLenders: rewards.lenderTokenRewards,
      rewardForBorrowers: rewards.borrowerTokenRewards,
    });

    return snapshots;
  }
}
