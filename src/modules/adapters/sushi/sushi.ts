import BigNumber from 'bignumber.js';

import Erc20Abi from '../../../configs/abi/ERC20.json';
import MasterchefAbi from '../../../configs/abi/sushi/Masterchef.json';
import { DAY } from '../../../configs/constants';
import MasterchefPools from '../../../configs/data/MasterchefPools.json';
import EnvConfig from '../../../configs/envConfig';
import logger from '../../../lib/logger';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { compareAddress, formatFromDecimals, getDateString } from '../../../lib/utils';
import { LiquidityPoolConfig, ProtocolConfig } from '../../../types/configs';
import { MasterchefPoolSnapshot } from '../../../types/domains/masterchef';
import { ContextServices } from '../../../types/namespaces';
import { GetMasterchefSnapshotOptions } from '../../../types/options';
import UniswapLibs from '../../libs/uniswap';
import ProtocolAdapter from '../adapter';
import { SushiMasterchefEventAbiMappings, SushiMasterchefEventSignatures } from './abis';

export default class SushiAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.sushi';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = SushiMasterchefEventSignatures;
    this.abiConfigs.eventAbiMappings = SushiMasterchefEventAbiMappings;
  }

  protected async getLpTokenInfo(
    chain: string,
    protocol: string,
    lpToken: string,
  ): Promise<LiquidityPoolConfig | null> {
    const configPool = MasterchefPools.filter(
      (pool) => pool.chain == chain && pool.protocol === protocol && compareAddress(pool.lpToken.address, lpToken),
    )[0];
    if (configPool) {
      return {
        chain: chain,
        address: configPool.lpToken.address,
        symbol: configPool.lpToken.symbol,
        decimals: configPool.lpToken.decimals,
        tokens: configPool.lpToken.tokens,
      };
    }

    return await UniswapLibs.getPool2Constant(chain, lpToken);
  }

  public async getMasterchefSnapshots(
    options: GetMasterchefSnapshotOptions,
  ): Promise<Array<MasterchefPoolSnapshot> | null> {
    const poolSnapshots: Array<MasterchefPoolSnapshot> = [];

    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );
    const blockNumberEndDay = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp + DAY - 1,
    );

    const poolLength = await this.services.blockchain.readContract({
      chain: options.config.chain,
      target: options.config.address,
      abi: MasterchefAbi,
      method: 'poolLength',
      params: [],
      blockNumber: blockNumber,
    });
    const totalAllocationPoint = await this.services.blockchain.readContract({
      chain: options.config.chain,
      target: options.config.address,
      abi: MasterchefAbi,
      method: 'totalAllocPoint',
      params: [],
      blockNumber: blockNumber,
    });
    for (let poolId = 0; poolId < Number(poolLength); poolId++) {
      const [lpTokenAddress, allocPoint] = await this.services.blockchain.readContract({
        chain: options.config.chain,
        target: options.config.address,
        abi: MasterchefAbi,
        method: 'poolInfo',
        params: [poolId],
        blockNumber: blockNumber,
      });

      const lpToken = await this.getLpTokenInfo(options.config.chain, this.config.protocol, lpTokenAddress);

      let lpAmount = new BigNumber(0);
      try {
        lpAmount = new BigNumber(
          await this.services.blockchain.readContract({
            chain: options.config.chain,
            target: lpTokenAddress,
            abi: Erc20Abi,
            method: 'balanceOf',
            params: [options.config.address],
            blockNumber: blockNumber,
          }),
        );
      } catch (e: any) {}

      // reward earned were calculated by
      // RewardEarned = (RewardTokenSupplyGrowth / (1 + DevSharesPercentage)) * (PoolAllocationPoint / TotalAllocationPoint)
      const rewardTokenSupplyBefore = await this.services.blockchain.readContract({
        chain: options.config.chain,
        abi: Erc20Abi,
        target: options.config.rewardToken.address,
        method: 'totalSupply',
        params: [],
        blockNumber: blockNumber,
      });
      const rewardTokenSupplyAfter = await this.services.blockchain.readContract({
        chain: options.config.chain,
        abi: Erc20Abi,
        target: options.config.rewardToken.address,
        method: 'totalSupply',
        params: [],
        blockNumber: blockNumberEndDay,
      });
      const rewardTokenSupplyGrowth = new BigNumber(rewardTokenSupplyAfter.toString()).minus(
        new BigNumber(rewardTokenSupplyBefore.toString()),
      );
      const rewardEarnedByPool = rewardTokenSupplyGrowth
        .multipliedBy(allocPoint.toString())
        .dividedBy(100 + options.config.devRewardSharePercentage / 100)
        .dividedBy(new BigNumber(totalAllocationPoint.toString()));

      if (lpToken) {
        lpToken.symbol =
          lpToken.tokens.length === 2 ? `${lpToken.tokens[0].symbol}-${lpToken.tokens[1].symbol} LP` : lpToken.symbol;

        const tokenPrice = await this.services.oracle.getUniv2TokenPriceUsd({
          pool2: lpToken,
          timestamp: options.timestamp,
        });

        const rewardTokenPrice = await this.services.oracle.getTokenPriceUsd({
          chain: options.config.chain,
          address: options.config.rewardToken.address,
          timestamp: options.timestamp,
        });

        // rate = TotalRewardEarn * 365 / TotalDeposit
        const rewardRate = tokenPrice
          ? new BigNumber(rewardEarnedByPool.toString(10))
              .multipliedBy(rewardTokenPrice ? rewardTokenPrice : '0')
              .multipliedBy(365)
              .dividedBy(lpAmount.multipliedBy(tokenPrice ? tokenPrice : '0'))
              .toString(10)
          : '0';

        poolSnapshots.push({
          chain: options.config.chain,
          protocol: options.config.protocol,
          timestamp: options.timestamp,
          address: options.config.address,
          poolId: poolId,
          token: {
            chain: lpToken.chain,
            symbol: lpToken.symbol,
            decimals: 18,
            address: lpToken.address,
          },
          tokenPrice: tokenPrice ? tokenPrice : '0',
          allocationPoint: new BigNumber(allocPoint.toString()).toNumber(),
          allocationPointTotal: new BigNumber(totalAllocationPoint.toString()).toNumber(),

          totalDeposited: formatFromDecimals(lpAmount.toString(10), 18),

          rewardForStakers: [
            {
              token: options.config.rewardToken,
              tokenPrice: rewardTokenPrice ? rewardTokenPrice : '0',
              tokenAmount: formatFromDecimals(rewardEarnedByPool.toString(10), options.config.rewardToken.decimals),
            },
          ],

          rewardRate: rewardRate,
        });

        logger.info('updated masterchef pool snapshot', {
          service: this.name,
          protocol: options.config.protocol,
          address: options.config.address,
          poolId: poolId,
          lpToken: lpToken.symbol,
          date: getDateString(options.timestamp),
        });
      }
    }

    return poolSnapshots;
  }
}
