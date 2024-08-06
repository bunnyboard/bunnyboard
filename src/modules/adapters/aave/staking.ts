import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import ERC20Abi from '../../../configs/abi/ERC20.json';
import AaveStakedAaveOldAbi from '../../../configs/abi/aave/StakedAave.json';
import AaveStakingAbi from '../../../configs/abi/aave/StakedAaveV3.json';
import BalancerVaultAbi from '../../../configs/abi/balancer/Vault.json';
import { TimeUnits } from '../../../configs/constants';
import { AaveStakingConfig } from '../../../configs/protocols/aave';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig, StakingVersions, Token } from '../../../types/configs';
import { StakingPoolDataTimeframe } from '../../../types/domains/staking';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions } from '../../../types/options';
import { AdapterGetEventLogsOptions } from '../adapter';
import StakingProtocolAdapter from '../staking';
import { AaveStakingEvents } from './abis';
import { TokensBook } from '../../../configs/data';

export default class AaveStakingAdapter extends StakingProtocolAdapter {
  public readonly name: string = 'adapter.aave 👻';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.abiConfigs.eventSignatures = AaveStakingEvents;
    this.abiConfigs.eventAbis = {
      stakedToken: AaveStakingAbi,
    };
  }

  private async getStakingTokenPrice(token: Token, blockNumber: number, timestamp: number): Promise<string | null> {
    if (token.symbol === 'AAVE' || token.symbol === 'GHO') {
      return await this.services.oracle.getTokenPriceUsd({
        chain: token.chain,
        address: token.address,
        timestamp: timestamp,
      });
    } else if (token.symbol === 'ABPT') {
      const bPool = '0xC697051d1C6296C24aE3bceF39acA743861D9A81';
      const wethToken = TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'];
      const aaveToken = TokensBook.ethereum['0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'];
      const [wethBalance, aaveBalance, lpSupply] = await this.services.blockchain.multicall({
        chain: token.chain,
        blockNumber: blockNumber,
        calls: [
          {
            abi: ERC20Abi,
            target: wethToken.address,
            method: 'balanceOf',
            params: [bPool],
          },
          {
            abi: ERC20Abi,
            target: aaveToken.address,
            method: 'balanceOf',
            params: [bPool],
          },
          {
            abi: ERC20Abi,
            target: token.address,
            method: 'totalSupply',
            params: [],
          },
        ],
      });

      const [wethPrice, aavePrice] = await Promise.all([
        this.services.oracle.getTokenPriceUsd({
          chain: wethToken.chain,
          address: wethToken.address,
          timestamp: timestamp,
        }),
        this.services.oracle.getTokenPriceUsd({
          chain: aaveToken.chain,
          address: aaveToken.address,
          timestamp: timestamp,
        }),
      ]);
      const totalSupply = new BigNumber(formatBigNumberToString(lpSupply ? lpSupply.toString() : '0', 18));
      if (totalSupply.gt(0)) {
        const totalLiquidityWeth = new BigNumber(
          formatBigNumberToString(wethBalance.toString(), wethToken.decimals),
        ).multipliedBy(new BigNumber(wethPrice ? wethPrice : '0'));
        const totalLiquidityAave = new BigNumber(
          formatBigNumberToString(aaveBalance.toString(), aaveToken.decimals),
        ).multipliedBy(new BigNumber(aavePrice ? aavePrice : '0'));
        const totalLiquidityUsd = totalLiquidityWeth.plus(totalLiquidityAave);

        return totalLiquidityUsd.dividedBy(totalSupply).toString(10);
      }

      return '0';
    } else if (token.symbol === 'ABPTv2') {
      const poolId = '0x3de27efa2f1aa663ae5d458857e731c129069f29000200000000000000000588';
      const balancerVault = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';
      const [poolTokens, lpSupply] = await this.services.blockchain.multicall({
        chain: token.chain,
        blockNumber: blockNumber,
        calls: [
          {
            abi: BalancerVaultAbi,
            target: balancerVault,
            method: 'getPoolTokens',
            params: [poolId],
          },
          {
            abi: ERC20Abi,
            target: token.address,
            method: 'totalSupply',
            params: [],
          },
        ],
      });

      const wstETHToken = TokensBook.ethereum['0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0'];
      const aaveToken = TokensBook.ethereum['0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'];

      const [wstETHPrice, aavePrice] = await Promise.all([
        this.services.oracle.getTokenPriceUsd({
          chain: wstETHToken.chain,
          address: wstETHToken.address,
          timestamp: timestamp,
        }),
        this.services.oracle.getTokenPriceUsd({
          chain: aaveToken.chain,
          address: aaveToken.address,
          timestamp: timestamp,
        }),
      ]);

      const totalSupply = new BigNumber(lpSupply ? lpSupply.toString() : '0').dividedBy(1e18);
      if (totalSupply.gt(0)) {
        const totalLiquidityWstETH = new BigNumber(
          formatBigNumberToString(poolTokens[1][0].toString(), wstETHToken.decimals),
        ).multipliedBy(new BigNumber(wstETHPrice ? wstETHPrice : '0'));
        const totalLiquidityAave = new BigNumber(
          formatBigNumberToString(poolTokens[1][1].toString(), aaveToken.decimals),
        ).multipliedBy(new BigNumber(aavePrice ? aavePrice : '0'));
        const totalLiquidityUsd = totalLiquidityWstETH.plus(totalLiquidityAave);

        return totalLiquidityUsd.dividedBy(totalSupply).toString(10);
      }
    }

    return null;
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

  public async getStakingDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<Array<StakingPoolDataTimeframe> | null> {
    const config = options.config as AaveStakingConfig;

    if (config.version !== StakingVersions.aave) {
      return null;
    }

    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    const tokenPrice = await this.getStakingTokenPrice(config.stakingToken, beginBlock, options.fromTime);
    const rewardTokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: config.rewardToken.chain,
      address: config.rewardToken.address,
      timestamp: options.fromTime,
    });

    const [totalSupply, totalDeposited, asset] = await this.services.blockchain.multicall({
      chain: config.chain,
      blockNumber: beginBlock,
      calls: [
        {
          abi: this.abiConfigs.eventAbis.stakedToken,
          target: config.stakingToken.address,
          method: 'totalSupply',
          params: [],
        },
        {
          abi: this.abiConfigs.eventAbis.stakedToken,
          target: config.address,
          method: 'totalSupply',
          params: [],
        },
        {
          abi: this.abiConfigs.eventAbis.stakedToken,
          target: config.address,
          method: 'assets',
          params: [config.address],
        },
      ],
    });

    let rewardRate = '0';
    const emissionRate = asset ? asset[0].toString() : '0';
    if (totalDeposited && totalDeposited.toString() !== '0') {
      if (compareAddress(config.stakingToken.address, config.rewardToken.address)) {
        // 1e18 / 1e18
        rewardRate = new BigNumber(emissionRate)
          .multipliedBy(TimeUnits.SecondsPerYear)
          .dividedBy(new BigNumber(totalDeposited.toString()))
          .toString(10);
      } else {
        const totalRewardPerYear = new BigNumber(formatBigNumberToString(emissionRate, 18))
          .multipliedBy(TimeUnits.SecondsPerYear)
          .multipliedBy(rewardTokenPrice ? rewardTokenPrice : '0');
        const totalStakedValue = new BigNumber(
          formatBigNumberToString(totalDeposited.toString(), config.stakingToken.decimals),
        ).multipliedBy(tokenPrice ? tokenPrice : '0');
        rewardRate = totalRewardPerYear.dividedBy(totalStakedValue).toString(10);
      }
    }

    const logs = await this.getEventLogs({
      metricConfig: config,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    let volumeDeposited = new BigNumber(0);
    let volumeWithdrawn = new BigNumber(0);
    let volumeRewardDistributed = new BigNumber(0);
    let volumeRewardCollected = new BigNumber(0);
    const addresses: { [key: string]: boolean } = {};
    const transactions: { [key: string]: boolean } = {};
    for (const log of logs) {
      const signature = log.topics[0];
      if (Object.values(AaveStakingEvents).indexOf(signature) !== -1) {
        transactions[log.transactionHash] = true;

        let event: any;
        if (signature === AaveStakingEvents.Staked || signature === AaveStakingEvents.Redeem) {
          event = decodeEventLog({
            abi: AaveStakedAaveOldAbi,
            topics: log.topics,
            data: log.data,
          });
        } else {
          event = decodeEventLog({
            abi: AaveStakingAbi,
            topics: log.topics,
            data: log.data,
          });
        }

        if (event.args.from) {
          addresses[normalizeAddress(event.args.from)] = true;
        }
        if (event.args.to) {
          addresses[normalizeAddress(event.args.to)] = true;
        }
        if (event.args.user) {
          addresses[normalizeAddress(event.args.user)] = true;
        }
        if (event.args.onBehalfOf) {
          addresses[normalizeAddress(event.args.onBehalfOf)] = true;
        }

        switch (signature) {
          case AaveStakingEvents.Staked:
          case AaveStakingEvents.StakedV2: {
            const amount = formatBigNumberToString(
              event.args.assets ? event.args.assets.toString() : event.args.amount.toString(),
              config.stakingToken.decimals,
            );
            volumeDeposited = volumeDeposited.plus(new BigNumber(amount));
            break;
          }
          case AaveStakingEvents.Redeem:
          case AaveStakingEvents.RedeemV2: {
            const amount = formatBigNumberToString(
              event.args.assets ? event.args.assets.toString() : event.args.amount.toString(),
              config.stakingToken.decimals,
            );
            volumeWithdrawn = volumeWithdrawn.plus(new BigNumber(amount));
            break;
          }
          case AaveStakingEvents.RewardsAccrued: {
            const amount = formatBigNumberToString(event.args.amount.toString(), config.rewardToken.decimals);
            volumeRewardDistributed = volumeRewardDistributed.plus(new BigNumber(amount));
            break;
          }
          case AaveStakingEvents.RewardsClaimed: {
            const amount = formatBigNumberToString(event.args.amount.toString(), config.rewardToken.decimals);
            volumeRewardCollected = volumeRewardCollected.plus(new BigNumber(amount));
            break;
          }
        }
      }
    }

    const aaveStakingData: StakingPoolDataTimeframe = {
      protocol: config.protocol,
      chain: config.chain,
      timestamp: options.fromTime,
      timefrom: options.fromTime,
      timeto: options.toTime,
      metric: config.metric,
      address: config.address,
      poolId: config.poolId,
      token: config.stakingToken,
      tokenPrice: tokenPrice ? tokenPrice : '0',

      rewardToken: config.rewardToken,
      rewardTokenPrice: rewardTokenPrice ? rewardTokenPrice : '0',

      totalSupply: formatBigNumberToString(totalSupply ? totalSupply.toString() : '0', config.stakingToken.decimals),
      totalDeposited: formatBigNumberToString(
        totalDeposited ? totalDeposited.toString() : '0',
        config.stakingToken.decimals,
      ),

      rateReward: rewardRate,

      volumeDeposited: volumeDeposited.toString(10),
      volumeWithdrawn: volumeWithdrawn.toString(10),
      volumeRewardDistributed: volumeRewardDistributed.toString(10),
      volumeRewardCollected: volumeRewardCollected.toString(10),

      addresses: Object.keys(addresses),
      transactions: Object.keys(transactions),
    };

    return [aaveStakingData];
  }
}
