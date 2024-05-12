import BigNumber from 'bignumber.js';

import ERC20Abi from '../../../configs/abi/ERC20.json';
import styETHAbi from '../../../configs/abi/yearn/styETH.json';
import yETHPoolAbi from '../../../configs/abi/yearn/yETHPool.json';
import { TimeUnits } from '../../../configs/constants';
import { SushiBarConfig } from '../../../configs/protocols/sushi';
import { YethStakingConfig } from '../../../configs/protocols/yearn';
import { formatBigNumberToString } from '../../../lib/utils';
import { ContractCall } from '../../../services/blockchains/domains';
import { ProtocolConfig, StakingVersions } from '../../../types/configs';
import { StakingPoolDataTimeframe } from '../../../types/domains/staking';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions } from '../../../types/options';
import { AdapterGetEventLogsOptions } from '../adapter';
import StakingProtocolAdapter from '../staking';

export default class YethAdapter extends StakingProtocolAdapter {
  public readonly name: string = 'adapter.yeth';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  protected async getEventLogs(options: AdapterGetEventLogsOptions): Promise<Array<any>> {
    const config = options.metricConfig as SushiBarConfig;

    // sushi need logs from SUSHI token
    return await this.services.blockchain.getContractLogs({
      chain: config.chain,
      address: config.token.address, // SUSHI token
      fromBlock: options.fromBlock,
      toBlock: options.toBlock,

      blockRange: 100,
    });
  }

  public async getStakingDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<Array<StakingPoolDataTimeframe> | null> {
    const config = options.config as YethStakingConfig;

    if (config.version !== StakingVersions.yeth) {
      return null;
    }

    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    // const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    // calculate staking APY
    // based on weekly reward distributed
    let timestampPreviousWeek = options.fromTime - TimeUnits.SecondsPerDay * 7;
    if (timestampPreviousWeek < config.birthday) {
      timestampPreviousWeek = config.birthday;
    }
    const blockNumberPreviousWeek = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      timestampPreviousWeek,
    );
    const rawLpPriceCurrent = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: styETHAbi,
      target: config.styETH,
      method: 'convertToAssets',
      params: [new BigNumber(1e18).toString(10)],
      blockNumber: beginBlock,
    });
    const rawLpPricePreviousWeek = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: styETHAbi,
      target: config.styETH,
      method: 'convertToAssets',
      params: [new BigNumber(1e18).toString(10)],
      blockNumber: blockNumberPreviousWeek,
    });
    const rawTotalAssetPreviousWeek = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: styETHAbi,
      target: config.styETH,
      method: 'totalAssets',
      params: [],
      blockNumber: blockNumberPreviousWeek,
    });
    const yieldIncreased = new BigNumber(rawLpPriceCurrent.toString())
      .minus(new BigNumber(rawLpPricePreviousWeek.toString()))
      .multipliedBy(new BigNumber(rawTotalAssetPreviousWeek.toString()))
      .dividedBy(1e18);
    const rewardRate = yieldIncreased
      .multipliedBy(48) // 1 year = 48 weeks
      .dividedBy(new BigNumber(rawTotalAssetPreviousWeek.toString()))
      .toString(10);

    // get number of assets
    const numAssets = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: yETHPoolAbi,
      target: config.address,
      method: 'num_assets',
      params: [],
      blockNumber: beginBlock,
    });

    const calls: Array<ContractCall> = [];
    for (let i = 0; i < Number(numAssets.toString()); i++) {
      calls.push({
        abi: yETHPoolAbi,
        target: config.address,
        method: 'assets',
        params: [i],
      });
    }
    const assets = await this.services.blockchain.multicall({
      chain: config.chain,
      blockNumber: beginBlock,
      calls: calls,
    });

    const balanceCalls: Array<ContractCall> = [];
    for (let i = 0; i < Number(numAssets.toString()); i++) {
      balanceCalls.push({
        abi: ERC20Abi,
        target: assets[i],
        method: 'balanceOf',
        params: [config.address],
      });
    }
    const balances = await this.services.blockchain.multicall({
      chain: config.chain,
      blockNumber: beginBlock,
      calls: balanceCalls,
    });

    const pools: Array<StakingPoolDataTimeframe> = [];
    for (let i = 0; i < Number(numAssets.toString()); i++) {
      const token = await this.services.blockchain.getTokenInfo({
        chain: config.chain,
        address: assets[i],
      });
      if (token) {
        const tokenPrice = await this.services.oracle.getTokenPriceUsd({
          chain: token.chain,
          address: token.address,
          timestamp: options.fromTime,
        });

        pools.push({
          protocol: config.protocol,
          chain: config.chain,
          timestamp: options.fromTime,
          timefrom: options.fromTime,
          timeto: options.toTime,
          metric: config.metric,
          address: config.address,
          poolId: i.toString(),
          token: token,
          tokenPrice: tokenPrice ? tokenPrice : '0',

          rewardToken: token,
          rewardTokenPrice: tokenPrice ? tokenPrice : '0',

          totalSupply: '0',
          totalDeposited: formatBigNumberToString(balances[i] ? balances[i].toString() : '0', token.decimals),

          // all asset have the same reward rate on yETH pool
          rateReward: rewardRate,

          volumeDeposited: '0',
          volumeWithdrawn: '0',
          volumeRewardDistributed: '0',
          volumeRewardCollected: '0',

          addresses: [],
          transactions: [],
        });
      }
    }

    return pools;
  }
}
