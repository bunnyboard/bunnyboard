import BigNumber from 'bignumber.js';

import AaveDataProviderV3Abi from '../../../configs/abi/aave/DataProviderV3.json';
import AaveIncentiveControllerV3Abi from '../../../configs/abi/aave/IncentiveControllerV3.json';
import EnvConfig from '../../../configs/envConfig';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { compareAddress, formatFromDecimals, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { TokenRewardEntry } from '../../../types/domains';
import { ContextServices } from '../../../types/namespaces';
import Aavev2Adapter from './aavev2';
import { AaveIncentiveEventInterfaces, Aavev3EventAbiMappings, Aavev3EventSignatures } from './abis';

export default class Aavev3Adapter extends Aavev2Adapter {
  public readonly name: string = 'adapter.aavev3';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = Aavev3EventSignatures;
    this.abiConfigs.eventAbiMappings = Aavev3EventAbiMappings;
  }

  protected async getReserveData(config: AaveLendingMarketConfig, reserve: string, blockNumber: number): Promise<any> {
    return await this.services.blockchain.singlecall({
      chain: config.chain,
      abi: AaveDataProviderV3Abi,
      target: config.dataProvider,
      method: 'getReserveData',
      params: [reserve],
      blockNumber,
    });
  }

  // return total deposited (in wei)
  protected getTotalDeposited(reserveData: any): string {
    return new BigNumber(reserveData.totalAToken.toString()).toString(10);
  }

  // return total borrowed (in wei)
  protected getTotalBorrowed(reserveData: any): string {
    const totalBorrowed = new BigNumber(reserveData.totalStableDebt.toString()).plus(
      new BigNumber(reserveData.totalVariableDebt.toString()),
    );

    return totalBorrowed.toString(10);
  }

  protected async getIncentiveRewards(
    config: AaveLendingMarketConfig,
    reserve: string,
    timestamp: number,
  ): Promise<Array<TokenRewardEntry>> {
    const tokenRewards: { [key: string]: TokenRewardEntry } = {};

    const incentiveController = (config as AaveLendingMarketConfig).incentiveController;
    if (incentiveController) {
      const blockNumber = await tryQueryBlockNumberAtTimestamp(
        EnvConfig.blockchains[config.chain].blockSubgraph,
        timestamp,
      );

      // get reward token list
      const rewardsList = await this.services.blockchain.singlecall({
        chain: config.chain,
        abi: AaveIncentiveControllerV3Abi,
        target: incentiveController.address,
        method: 'getRewardsList',
        params: [],
        blockNumber: blockNumber,
      });
      if (!rewardsList || rewardsList.length === 0) {
        return [];
      }

      for (const rewardTokenAddress of rewardsList) {
        const rewardToken = await this.services.blockchain.getTokenInfo({
          chain: config.chain,
          address: rewardTokenAddress,
        });
        if (rewardToken) {
          const rewardTokenPrice = await this.services.oracle.getTokenPriceUsd({
            chain: config.chain,
            address: rewardTokenAddress,
            timestamp: timestamp,
          });

          tokenRewards[normalizeAddress(rewardTokenAddress)] = {
            token: rewardToken,
            tokenAmount: '0',
            tokenPrice: rewardTokenPrice ? rewardTokenPrice : '0',
          };
        }
      }

      const tokenAddresses = await this.services.blockchain.singlecall({
        chain: config.chain,
        target: config.dataProvider,
        abi: AaveDataProviderV3Abi,
        method: 'getReserveTokensAddresses',
        params: [reserve],
      });
      if (tokenAddresses) {
        const logs = await this.getDayContractLogs({
          chain: config.chain,
          address: config.address,
          topics: Object.values(this.abiConfigs.eventSignatures),
          dayStartTimestamp: timestamp,
        });

        const eventSignature = this.abiConfigs.eventSignatures as AaveIncentiveEventInterfaces;
        const web3 = this.services.blockchain.getProvider(config.chain);

        for (const log of logs) {
          const signature = log.topics[0];
          if (signature === eventSignature.RewardsAccrued) {
            const event = web3.eth.abi.decodeLog(
              this.abiConfigs.eventAbiMappings[signature],
              log.data,
              log.topics.slice(1),
            );
            if (compareAddress(event.asset, tokenAddresses.aTokenAddress)) {
              if (tokenRewards[normalizeAddress(event.reward)]) {
                tokenRewards[normalizeAddress(event.reward)].tokenAmount = new BigNumber(
                  tokenRewards[normalizeAddress(event.reward)].tokenAmount,
                )
                  .plus(
                    formatFromDecimals(
                      event.rewardsAccrued.toString(),
                      tokenRewards[normalizeAddress(event.reward)].token.decimals,
                    ),
                  )
                  .toString(10);
              }
            }
          }
        }
      }
    }

    return Object.values(tokenRewards);
  }
}
