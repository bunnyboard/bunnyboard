import { EthereumEcosystemConfig } from '../../../configs/protocols/ethereum';
import logger from '../../../lib/logger';
import { EthereumLiquidStakingData } from '../../../types/domains/ecosystem/ethereum';
import { ContextServices } from '../../../types/namespaces';
import LidoStETHAbi from '../../../configs/abi/lido/stETH.json';
import rETHAbi from '../../../configs/abi/rocketpool/rETH.json';
import RocketpoolManagerAbi from '../../../configs/abi/rocketpool/MiniPoolManager.json';
import wBETHAbi from '../../../configs/abi/binance/wBETH.json';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import MantleLsdStakingAbi from '../../../configs/abi/mantle/LsdStaking.json';
import swETHAbi from '../../../configs/abi/swellnetwork/swETH.json';
import { formatBigNumberToString } from '../../../lib/utils';
import BigNumber from 'bignumber.js';
import { ProtocolNames } from '../../../configs/names';
import axios from 'axios';

export interface GetLsdDataOptions {
  services: ContextServices;

  ethereumConfig: EthereumEcosystemConfig;
  timestamp: number;
}

export default class LsdHelper {
  public static async getEthereumLsdData(options: GetLsdDataOptions): Promise<Array<EthereumLiquidStakingData>> {
    const { services, ethereumConfig, timestamp } = options;

    const data: Array<EthereumLiquidStakingData> = [];

    for (const liquidStakingConfig of ethereumConfig.liquidStaking) {
      logger.debug(`getting liquid staking data`, {
        service: this.name,
        chain: ethereumConfig.chain,
        protocol: ethereumConfig.protocol,
        lsd: liquidStakingConfig.protocol,
      });

      if (liquidStakingConfig.protocol === ProtocolNames.lido) {
        const blockNumber = await services.blockchain.tryGetBlockNumberAtTimestamp(ethereumConfig.chain, timestamp);
        const getTotalPooledEther = await services.blockchain.readContract({
          chain: liquidStakingConfig.contracts.stETH.chain,
          target: liquidStakingConfig.contracts.stETH.address,
          abi: LidoStETHAbi,
          method: 'getTotalPooledEther',
          params: [],
          blockNumber: blockNumber,
        });
        const lidoData: EthereumLiquidStakingData = {
          protocol: liquidStakingConfig.protocol,
          totalDeposited: formatBigNumberToString(getTotalPooledEther.toString(), 18),
        };

        data.push(lidoData);
      } else if (liquidStakingConfig.protocol === ProtocolNames.rocketpool) {
        const blockNumber = await services.blockchain.tryGetBlockNumberAtTimestamp(ethereumConfig.chain, timestamp);
        const [getTotalCollateral, getMinipoolCount] = await services.blockchain.multicall({
          chain: ethereumConfig.chain,
          blockNumber: blockNumber,
          calls: [
            {
              abi: rETHAbi,
              target: liquidStakingConfig.contracts.rETH.address,
              method: 'getTotalCollateral',
              params: [],
            },
            {
              abi: RocketpoolManagerAbi,
              target: liquidStakingConfig.contracts.miniPoolManager.address,
              method: 'getMinipoolCount',
              params: [],
            },
          ],
        });
        data.push({
          protocol: liquidStakingConfig.protocol,
          totalDeposited: new BigNumber(formatBigNumberToString(getTotalCollateral.toString(), 18))
            .plus(new BigNumber(getMinipoolCount.toString()).multipliedBy(32))
            .toString(10),
        });
      } else if (liquidStakingConfig.protocol === ProtocolNames.binanceStakedEth) {
        const wBETHData: EthereumLiquidStakingData = {
          protocol: liquidStakingConfig.protocol,
          totalDeposited: '0',
        };
        for (const contract of Object.values(liquidStakingConfig.contracts)) {
          const blockNumber = await services.blockchain.tryGetBlockNumberAtTimestamp(contract.chain, timestamp);
          const [exchangeRate, totalSupply] = await services.blockchain.multicall({
            chain: contract.chain,
            blockNumber: blockNumber,
            calls: [
              {
                abi: wBETHAbi,
                target: contract.address,
                method: 'exchangeRate',
                params: [],
              },
              {
                abi: wBETHAbi,
                target: contract.address,
                method: 'totalSupply',
                params: [],
              },
            ],
          });
          const amount = formatBigNumberToString(
            new BigNumber(exchangeRate.toString()).multipliedBy(totalSupply.toString()).toString(10),
            36,
          );
          wBETHData.totalDeposited = new BigNumber(wBETHData.totalDeposited).plus(amount).toString(10);
        }

        data.push(wBETHData);
      } else if (liquidStakingConfig.protocol === ProtocolNames.mantleStakedEth) {
        const blockNumber = await services.blockchain.tryGetBlockNumberAtTimestamp(
          liquidStakingConfig.contracts.stakingContract.chain,
          timestamp,
        );
        const [totalControlled] = await services.blockchain.multicall({
          chain: liquidStakingConfig.contracts.stakingContract.chain,
          blockNumber: blockNumber,
          calls: [
            {
              abi: MantleLsdStakingAbi,
              target: liquidStakingConfig.contracts.stakingContract.address,
              method: 'totalControlled',
              params: [],
            },
          ],
        });
        data.push({
          protocol: liquidStakingConfig.protocol,
          totalDeposited: formatBigNumberToString(totalControlled.toString(), 18),
        });
      } else if (liquidStakingConfig.protocol === ProtocolNames.coinbaseStakedEth) {
        // Coinbase is a centralized staked platform fomr Coinbase.com
        // we are unable to get total ETh staked balance on the smart contracts on-chain
        // we only get the data from Coinbase API
        // https://docs.cdp.coinbase.com/exchange/reference/exchangerestapi_getwrappedasset
        const url = 'https://api.exchange.coinbase.com/wrapped-assets/cbETH';
        try {
          const responseData = (await axios.get(url)).data;
          data.push({
            protocol: liquidStakingConfig.protocol,
            totalDeposited: responseData.circulating_supply.toString(),
          });
        } catch (e: any) {
          logger.warn('failed to get lsd data from coinbase api', {
            service: this.name,
            url: url,
            error: e.message,
          });
        }
      } else if (liquidStakingConfig.protocol === ProtocolNames.fraxether) {
        const blockNumber = await services.blockchain.tryGetBlockNumberAtTimestamp(
          liquidStakingConfig.contracts.frxETH.chain,
          timestamp,
        );
        const totalSupply = await services.blockchain.readContract({
          chain: liquidStakingConfig.contracts.frxETH.chain,
          target: liquidStakingConfig.contracts.frxETH.address,
          abi: Erc20Abi,
          method: 'totalSupply',
          params: [],
          blockNumber: blockNumber,
        });
        data.push({
          protocol: liquidStakingConfig.protocol,
          totalDeposited: formatBigNumberToString(totalSupply.toString(), 18),
        });
      } else if (liquidStakingConfig.protocol === ProtocolNames.stakestone) {
        const blockNumber = await services.blockchain.tryGetBlockNumberAtTimestamp(
          liquidStakingConfig.contracts.strategyManager.chain,
          timestamp,
        );
        const getAllStrategiesValue = await services.blockchain.readContract({
          chain: liquidStakingConfig.contracts.strategyManager.chain,
          target: liquidStakingConfig.contracts.strategyManager.address,
          abi: [
            {
              inputs: [],
              name: 'getAllStrategiesValue',
              outputs: [
                {
                  internalType: 'uint256',
                  name: '',
                  type: 'uint256',
                },
              ],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          method: 'getAllStrategiesValue',
          params: [],
          blockNumber: blockNumber,
        });
        const client = services.blockchain.getPublicClient(liquidStakingConfig.contracts.assetValut.chain);
        const balance = await client.getBalance({
          address: liquidStakingConfig.contracts.assetValut.address as any,
        });
        data.push({
          protocol: liquidStakingConfig.protocol,
          totalDeposited: formatBigNumberToString(
            new BigNumber(getAllStrategiesValue.toString()).plus(new BigNumber(balance.toString())).toString(10),
            18,
          ),
        });
      } else if (liquidStakingConfig.protocol === ProtocolNames.swellnetwork) {
        const blockNumber = await services.blockchain.tryGetBlockNumberAtTimestamp(
          liquidStakingConfig.contracts.swETH.chain,
          timestamp,
        );
        const [getRate, totalSupply] = await services.blockchain.multicall({
          chain: liquidStakingConfig.contracts.swETH.chain,
          blockNumber: blockNumber,
          calls: [
            {
              abi: swETHAbi,
              target: liquidStakingConfig.contracts.swETH.address,
              method: 'getRate',
              params: [],
            },
            {
              abi: swETHAbi,
              target: liquidStakingConfig.contracts.swETH.address,
              method: 'totalSupply',
              params: [],
            },
          ],
        });
        data.push({
          protocol: liquidStakingConfig.protocol,
          totalDeposited: formatBigNumberToString(
            new BigNumber(totalSupply.toString()).multipliedBy(new BigNumber(getRate.toString())).toString(10),
            36,
          ),
        });
      } else if (liquidStakingConfig.protocol === ProtocolNames.stader) {
        const blockNumber = await services.blockchain.tryGetBlockNumberAtTimestamp(
          liquidStakingConfig.contracts.stakingPoolManager.chain,
          timestamp,
        );
        const [totalAssets, totalActiveValidatorCount] = await services.blockchain.multicall({
          chain: liquidStakingConfig.contracts.stakingPoolManager.chain,
          blockNumber: blockNumber,
          calls: [
            {
              abi: [
                {
                  inputs: [],
                  name: 'totalAssets',
                  outputs: [
                    {
                      internalType: 'uint256',
                      name: '',
                      type: 'uint256',
                    },
                  ],
                  stateMutability: 'view',
                  type: 'function',
                },
              ],
              target: liquidStakingConfig.contracts.stakingPoolManager.address,
              method: 'totalAssets',
              params: [],
            },
            {
              abi: [
                {
                  inputs: [],
                  name: 'totalActiveValidatorCount',
                  outputs: [
                    {
                      internalType: 'uint256',
                      name: '',
                      type: 'uint256',
                    },
                  ],
                  stateMutability: 'view',
                  type: 'function',
                },
              ],
              target: liquidStakingConfig.contracts.nodeRegistry.address,
              method: 'totalActiveValidatorCount',
              params: [],
            },
          ],
        });
        data.push({
          protocol: liquidStakingConfig.protocol,
          totalDeposited: formatBigNumberToString(
            new BigNumber(totalAssets.toString())
              .plus(new BigNumber(totalActiveValidatorCount.toString()).multipliedBy(4))
              .toString(10),
            18,
          ),
        });
      }
    }

    return data;
  }
}
