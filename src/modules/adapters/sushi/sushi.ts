import BigNumber from 'bignumber.js';

import Erc20Abi from '../../../configs/abi/ERC20.json';
import MasterchefAbi from '../../../configs/abi/sushi/Masterchef.json';
import { DAY } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import logger from '../../../lib/logger';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { formatFromDecimals, getDateString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { MasterchefPoolSnapshot } from '../../../types/domains';
import { ContextServices } from '../../../types/namespaces';
import { GetMasterchefSnapshotOptions } from '../../../types/options';
import UniswapLibs from '../../libs/uniswap';
import ProtocolAdapter from '../adapter';
import {
  SushiMasterchefEventAbiMappings,
  SushiMasterchefEventInterfaces,
  SushiMasterchefEventSignatures,
} from './abis';

export default class SushiAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.sushi';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = SushiMasterchefEventSignatures;
    this.abiConfigs.eventAbiMappings = SushiMasterchefEventAbiMappings;
  }

  public async getMasterchefSnapshots(
    options: GetMasterchefSnapshotOptions,
  ): Promise<Array<MasterchefPoolSnapshot> | null> {
    const poolSnapshots: Array<MasterchefPoolSnapshot> = [];

    const web3 = this.services.blockchain.getProvider(options.config.chain);
    const eventSignatures = this.abiConfigs.eventSignatures as SushiMasterchefEventInterfaces;

    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );
    const blockNumberEndDay = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp + DAY - 1,
    );

    const logs = await this.getDayContractLogs({
      chain: options.config.chain,
      address: options.config.address,
      topics: Object.values(eventSignatures),
      dayStartTimestamp: options.timestamp,
    });

    const poolLength = await this.services.blockchain.singlecall({
      chain: options.config.chain,
      target: options.config.address,
      abi: MasterchefAbi,
      method: 'poolLength',
      params: [],
      blockNumber: blockNumber,
    });
    for (let poolId = 0; poolId < Number(poolLength); poolId++) {
      const poolInfo = await this.services.blockchain.singlecall({
        chain: options.config.chain,
        target: options.config.address,
        abi: MasterchefAbi,
        method: 'poolInfo',
        params: [poolId],
        blockNumber: blockNumber,
      });
      const poolInfoEndDay = await this.services.blockchain.singlecall({
        chain: options.config.chain,
        target: options.config.address,
        abi: MasterchefAbi,
        method: 'poolInfo',
        params: [poolId],
        blockNumber: blockNumberEndDay,
      });

      let lpToken = null;
      let lpAmount = new BigNumber(0);
      let lpAmountEndDay = new BigNumber(0);
      try {
        lpToken = await UniswapLibs.getPool2Constant(options.config.chain, poolInfo.lpToken);
        lpAmount = new BigNumber(
          await this.services.blockchain.singlecall({
            chain: options.config.chain,
            target: poolInfo.lpToken,
            abi: Erc20Abi,
            method: 'balanceOf',
            params: [options.config.address],
            blockNumber: blockNumber,
          }),
        );
        lpAmountEndDay = new BigNumber(
          await this.services.blockchain.singlecall({
            chain: options.config.chain,
            target: poolInfo.lpToken,
            abi: Erc20Abi,
            method: 'balanceOf',
            params: [options.config.address],
            blockNumber: blockNumberEndDay,
          }),
        );
      } catch (e: any) {}

      // reward earned were calculated by
      const rewardEarned = new BigNumber(poolInfo.accSushiPerShare.toString()).multipliedBy(lpAmount);
      const rewardEarnedEndDay = new BigNumber(poolInfoEndDay.accSushiPerShare.toString()).multipliedBy(lpAmountEndDay);
      const rewardEarnedDiff = rewardEarnedEndDay.minus(rewardEarned);

      if (lpToken) {
        const tokenPrice = await this.services.oracle.getUniv2TokenPriceUsd({
          pool2: lpToken,
          timestamp: options.timestamp,
        });

        console.log(lpToken.address, tokenPrice);

        let addressCount = {
          depositor: 0,
          withdrawer: 0,
        };
        let transactionCount = 0;
        let volumeDeposited = new BigNumber(0);
        let volumeWithdrawn = new BigNumber(0);

        const addresses: any = {};
        const transactions: any = {};
        for (const log of logs) {
          const signature = log.topics[0];
          const event = web3.eth.abi.decodeLog(
            this.abiConfigs.eventAbiMappings[signature],
            log.data,
            log.topics.slice(1),
          );

          if (Number(event.pid) === poolId) {
            if (!transactions[log.transactionHash]) {
              transactionCount += 1;
              transactions[log.transactionHash] = true;
            }

            await this.booker.saveAddressBookMasterchef({
              addressId: '', // filled by booker
              chain: options.config.chain,
              protocol: options.config.protocol,
              address: normalizeAddress(event.user),
              role: 'staker',
              firstTime: options.timestamp,

              masterchef: options.config.address,
              poolId: poolId,
            });

            switch (signature) {
              case eventSignatures.Deposit: {
                if (!addresses[normalizeAddress(event.user)]) {
                  addressCount.depositor += 1;
                  addresses[normalizeAddress(event.user)] = true;
                }

                volumeDeposited = volumeDeposited.plus(new BigNumber(event.amount.toString()));
                break;
              }
              case eventSignatures.Withdraw:
              case eventSignatures.EmergencyWithdraw: {
                if (!addresses[normalizeAddress(event.user)]) {
                  addressCount.withdrawer += 1;
                  addresses[normalizeAddress(event.user)] = true;
                }

                volumeWithdrawn = volumeWithdrawn.plus(new BigNumber(event.amount.toString()));
                break;
              }
            }
          }
        }

        poolSnapshots.push({
          chain: options.config.chain,
          protocol: options.config.protocol,
          timestamp: options.timestamp,
          address: options.config.address,
          poolId: poolId,
          token: {
            chain: lpToken.chain,
            symbol: `${lpToken.tokens[0].symbol}-${lpToken.tokens[1].symbol} LP`,
            decimals: 18,
            address: lpToken.address,
          },
          tokenPrice: tokenPrice ? tokenPrice : '0',
          allocationPoint: new BigNumber(poolInfo.allocPoint.toString()).toNumber(),
          totalDeposited: formatFromDecimals(lpAmount.toString(10), 18),
          totalRewardEarned: formatFromDecimals(rewardEarnedDiff.toString(10), 36),

          volumeDeposited: formatFromDecimals(volumeDeposited.toString(10), 18),
          volumeWithdrawn: formatFromDecimals(volumeWithdrawn.toString(10), 18),

          transactionCount: transactionCount,
          addressCount: addressCount,
        });

        logger.info('updated masterchef pool snapshot', {
          service: this.name,
          protocol: options.config.protocol,
          address: options.config.address,
          poolId: poolId,
          lpToken: `${lpToken.tokens[0].symbol}-${lpToken.tokens[1].symbol} LP`,
          date: getDateString(options.timestamp),
        });
      }
    }

    return poolSnapshots;
  }
}
