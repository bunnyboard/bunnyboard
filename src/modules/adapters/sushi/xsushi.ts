import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import ERC20Abi from '../../../configs/abi/ERC20.json';
import { Erc20TransferEventSignature, TimeUnits } from '../../../configs/constants';
import { SushiBarConfig } from '../../../configs/protocols/sushi';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig, StakingVersions } from '../../../types/configs';
import { StakingPoolDataTimeframe } from '../../../types/domains/staking';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions } from '../../../types/options';
import { AdapterGetEventLogsOptions } from '../adapter';
import StakingProtocolAdapter from '../staking';

export default class xSushiAdapter extends StakingProtocolAdapter {
  public readonly name: string = 'adapter.sushi 🍣';

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
    const config = options.config as SushiBarConfig;

    if (config.version !== StakingVersions.xsushi) {
      return null;
    }

    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    const tokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: config.chain,
      address: config.token.address,
      timestamp: options.fromTime,
    });

    const [totalStakingTokenSupply, totalDeposited, totalLpSupply] = await this.services.blockchain.multicall({
      chain: config.chain,
      blockNumber: beginBlock,
      calls: [
        {
          abi: ERC20Abi,
          target: config.token.address,
          method: 'totalSupply',
          params: [],
        },
        {
          abi: ERC20Abi,
          target: config.token.address,
          method: 'balanceOf',
          params: [config.address],
        },
        {
          abi: ERC20Abi,
          target: config.address,
          method: 'totalSupply',
          params: [],
        },
      ],
    });

    const logs = await this.getEventLogs({
      metricConfig: config,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    let volumeDeposited = new BigNumber(0);
    let volumeWithdrawn = new BigNumber(0);
    let volumeRewardDistributed = new BigNumber(0);
    const addresses: { [key: string]: boolean } = {};
    const transactions: { [key: string]: boolean } = {};
    for (const log of logs) {
      const signature = log.topics[0];

      if (signature === Erc20TransferEventSignature) {
        const event: any = decodeEventLog({
          abi: ERC20Abi,
          topics: log.topics,
          data: log.data,
        });

        const from = normalizeAddress(event.args.from);
        const to = normalizeAddress(event.args.to);

        // count all transaction with SUSHI-WETH SLP as sender are reward distribution
        // https://thegraph.com/hosted-service/subgraph/sushi-labs/xsushi
        // https://etherscan.io/tx/0xd6898c3b71fbb90a1a49c27774a9ef5b6b37b021e3489897548e5790874333db
        // https://etherscan.io/tx/0x90a2e083a2773ff27c649c769c8896c11e956fcce1f239515b566a2f1bf3b17c
        if (compareAddress(from, config.sushiLp) && compareAddress(to, config.address)) {
          const amount = formatBigNumberToString(event.args.value.toString(), config.token.decimals);
          volumeRewardDistributed = volumeRewardDistributed.plus(new BigNumber(amount));
        } else if (from === config.address || to === config.address) {
          transactions[log.transactionHash] = true;

          const amount = formatBigNumberToString(event.args.value.toString(), config.token.decimals);

          if (from === config.address) {
            // withdrawn
            addresses[to] = true;
            volumeWithdrawn = volumeWithdrawn.plus(new BigNumber(amount));
          } else if (to === config.address) {
            // deposit
            addresses[from] = true;
            volumeDeposited = volumeDeposited.plus(new BigNumber(amount));
          }
        }
      }
    }

    // estimate staking reward APY in the last 90 days
    // to calculate reward APY
    // we get rewards distributed in the last 90 days
    let last90DaysTimestamp = options.fromTime - 90 * TimeUnits.SecondsPerDay;
    if (last90DaysTimestamp < config.birthday) {
      last90DaysTimestamp = config.birthday;
    }
    const blockNumberPrevious90Days = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      config.chain,
      last90DaysTimestamp,
    );
    const [rawTotalDepositedPrevious90Days, rawTotalLpSupplyPrevious90Days] = await this.services.blockchain.multicall({
      chain: config.chain,
      blockNumber: blockNumberPrevious90Days,
      calls: [
        {
          abi: ERC20Abi,
          target: config.token.address,
          method: 'balanceOf',
          params: [config.address],
        },
        {
          abi: ERC20Abi,
          target: config.address,
          method: 'totalSupply',
          params: [],
        },
      ],
    });

    const lpPriceCurrent = new BigNumber(totalDeposited.toString()).dividedBy(new BigNumber(totalLpSupply));
    const lpPricePrevious90Days = new BigNumber(rawTotalDepositedPrevious90Days.toString()).dividedBy(
      new BigNumber(rawTotalLpSupplyPrevious90Days),
    );
    const totalDepositedPrevious90Days = formatBigNumberToString(
      rawTotalDepositedPrevious90Days ? rawTotalDepositedPrevious90Days.toString() : '0',
      config.token.decimals,
    );
    const rewardDistributedLast90Days = lpPriceCurrent
      .minus(lpPricePrevious90Days)
      .multipliedBy(new BigNumber(totalDepositedPrevious90Days));

    // rewardRate = rewardDistributedInLast90Days * 4 / totalDepositedPrevious90Days
    const rewardRate = rewardDistributedLast90Days
      .multipliedBy(4) // 1 year = 90 days * 4
      .dividedBy(new BigNumber(totalDepositedPrevious90Days))
      .toString(10);

    const sushiStakingData: StakingPoolDataTimeframe = {
      protocol: config.protocol,
      chain: config.chain,
      timestamp: options.fromTime,
      timefrom: options.fromTime,
      timeto: options.toTime,
      metric: config.metric,
      address: config.address,
      poolId: config.poolId,
      token: config.token,
      tokenPrice: tokenPrice ? tokenPrice : '0',

      rewardToken: config.token,
      rewardTokenPrice: tokenPrice ? tokenPrice : '0',

      totalSupply: formatBigNumberToString(
        totalStakingTokenSupply ? totalStakingTokenSupply.toString() : '0',
        config.token.decimals,
      ),
      totalDeposited: formatBigNumberToString(totalDeposited ? totalDeposited.toString() : '0', config.token.decimals),

      rateReward: rewardRate,

      volumeDeposited: volumeDeposited.toString(10),
      volumeWithdrawn: volumeWithdrawn.toString(10),
      volumeRewardDistributed: volumeRewardDistributed.toString(10),
      volumeRewardCollected: '0',

      addresses: Object.keys(addresses),
      transactions: Object.keys(transactions),
    };

    return [sushiStakingData];
  }
}
