import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import Erc20Abi from '../../../configs/abi/ERC20.json';
import MasterchefAbi from '../../../configs/abi/sushi/Masterchef.json';
import { ChainBlockPeriods, DAY, YEAR } from '../../../configs/constants';
import MasterchefPools from '../../../configs/data/MasterchefPools.json';
import EnvConfig from '../../../configs/envConfig';
import logger from '../../../lib/logger';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { compareAddress, formatFromDecimals, getDateString, normalizeAddress } from '../../../lib/utils';
import { LiquidityPoolConfig, MasterchefConfig, ProtocolConfig } from '../../../types/configs';
import { MasterchefActivityAction } from '../../../types/domains/base';
import { MasterchefActivityEvent, MasterchefPoolSnapshot } from '../../../types/domains/masterchef';
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

  protected async getLpTokenByPoolId(config: MasterchefConfig, poolId: number): Promise<LiquidityPoolConfig | null> {
    const configPool = MasterchefPools.filter(
      (pool) => pool.chain == config.chain && compareAddress(pool.address, config.address) && pool.poolId === poolId,
    )[0];
    if (configPool) {
      return {
        chain: config.chain,
        address: configPool.lpToken.address,
        symbol: configPool.lpToken.symbol,
        decimals: configPool.lpToken.decimals,
        tokens: configPool.lpToken.tokens,
      };
    }

    const [lpTokenAddress] = await this.services.blockchain.readContract({
      chain: config.chain,
      target: config.address,
      abi: MasterchefAbi,
      method: 'poolInfo',
      params: [poolId],
    });

    return UniswapLibs.getPool2Constant(config.chain, lpTokenAddress);
  }

  protected async parseEventLog(config: MasterchefConfig, log: any): Promise<MasterchefActivityEvent | null> {
    const signature = log.topics[0];
    if (
      signature === SushiMasterchefEventSignatures.Deposit ||
      signature === SushiMasterchefEventSignatures.Withdraw ||
      signature === SushiMasterchefEventSignatures.EmergencyWithdraw
    ) {
      const event: any = decodeEventLog({
        abi: MasterchefAbi,
        data: log.data,
        topics: log.topics,
      });

      const poolId = new BigNumber(event.args.pid.toString()).toNumber();
      const lpToken = await this.getLpTokenByPoolId(config, poolId);
      if (lpToken) {
        const address = normalizeAddress(event.args.user);
        let action: MasterchefActivityAction = 'deposit';
        if (signature === SushiMasterchefEventSignatures.Withdraw) {
          action = 'withdraw';
        } else if (signature === SushiMasterchefEventSignatures.EmergencyWithdraw) {
          action = 'emergencyWithdraw';
        }
        const amount = formatFromDecimals(event.args.amount.toString(), lpToken.decimals);

        return {
          protocol: config.protocol,
          chain: config.chain,
          transactionHash: log.transactionHash,
          logIndex: String(log.logIndex),
          action: action,
          user: address,
          token: {
            chain: lpToken.chain,
            decimals: lpToken.decimals,
            address: lpToken.address,
            symbol:
              lpToken.tokens.length === 2
                ? `${lpToken.tokens[0].symbol}-${lpToken.tokens[1].symbol} LP`
                : lpToken.symbol,
          },
          tokenAmount: amount,
          masterchef: normalizeAddress(config.address),
          poolId: poolId,
          blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
        };
      }
    }

    return null;
  }

  protected async getRewardTokenPerSecond(config: MasterchefConfig, blockNumber: number): Promise<string> {
    const sushiPerBlock = await this.services.blockchain.readContract({
      chain: config.chain,
      target: config.address,
      abi: MasterchefAbi,
      method: 'sushiPerBlock',
      params: [],
      blockNumber: blockNumber,
    });

    return new BigNumber(sushiPerBlock)
      .multipliedBy(YEAR / ChainBlockPeriods[config.chain])
      .dividedBy(YEAR)
      .dividedBy(new BigNumber(10).pow(config.rewardToken.decimals))
      .toString(10);
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

    // process activity events
    const logs = await this.services.blockchain.getContractLogs({
      chain: options.config.chain,
      address: options.config.address,
      fromBlock: blockNumber,
      toBlock: blockNumberEndDay,
    });
    for (const log of logs) {
      const activityEvent = await this.parseEventLog(options.config, log);

      if (activityEvent) {
        await this.services.database.update({
          collection: EnvConfig.mongodb.collections.masterchefPoolActivities,
          keys: {
            chain: options.config.chain,
            transactionHash: activityEvent.transactionHash,
            logIndex: activityEvent.logIndex,
          },
          updates: {
            ...activityEvent,
          },
          upsert: true,
        });
      }
    }

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
    const rewardPerSecond = await this.getRewardTokenPerSecond(options.config, blockNumber);
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

      const rewardTokenAmount = new BigNumber(rewardPerSecond)
        .multipliedBy(DAY)
        .multipliedBy(new BigNumber(allocPoint.toString()))
        .dividedBy(new BigNumber(totalAllocationPoint.toString()))
        .toString(10);

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

          rewardToken: options.config.rewardToken,
          rewardTokenPrice: rewardTokenPrice ? rewardTokenPrice : '0',
          rewardTokenAmount: rewardTokenAmount,
          rewardTokenPerSecond: rewardPerSecond,
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
