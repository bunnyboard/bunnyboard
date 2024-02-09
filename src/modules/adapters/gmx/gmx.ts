import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import PositionRouterAbi from '../../../configs/abi/gmx/PositionRouter.json';
import VaultAbi from '../../../configs/abi/gmx/Vault.json';
import EnvConfig from '../../../configs/envConfig';
import { GmxPerpetualMarketConfig } from '../../../configs/protocols/gmx';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { formatBigNumberToString } from '../../../lib/utils';
import {
  GetAdapterDataStateOptions,
  GetAdapterDataStateResult,
  GetAdapterDataTimeframeOptions,
  GetAdapterDataTimeframeResult,
  GetAdapterEventLogsOptions,
} from '../../../types/collectors/options';
import { PerpetualMarketDataTimeframe } from '../../../types/collectors/perpetutal';
import { DataMetrics, ProtocolConfig } from '../../../types/configs';
import { ContextServices } from '../../../types/namespaces';
import GmxLibs, { GmxVaultInfo } from '../../libs/gmx';
import ProtocolAdapter from '../adapter';
import { GmxEventInterfaces, GmxEventSignatures } from './abis';

export default class GmxAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.gmx';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = GmxEventSignatures;
    this.abiConfigs.eventAbis = {
      vault: VaultAbi,
      positionRouter: PositionRouterAbi,
    };
  }

  public async getDataState(options: GetAdapterDataStateOptions): Promise<GetAdapterDataStateResult> {
    const result: GetAdapterDataStateResult = {
      perpetual: [],
    };

    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );

    const marketConfig: GmxPerpetualMarketConfig = options.config as GmxPerpetualMarketConfig;
    const vaultInfo: GmxVaultInfo = await GmxLibs.getVaultInfo(marketConfig.chain, marketConfig.address);
    for (const token of vaultInfo.tokens) {
      const tokenPrice = await this.services.oracle.getTokenPriceUsd({
        chain: token.chain,
        address: token.address,
        timestamp: options.timestamp,
      });
      const globalShortSizes = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: this.abiConfigs.eventAbis.vault,
        target: marketConfig.address,
        method: 'globalShortSizes',
        params: [token.address],
        blockNumber: blockNumber,
      });
      const globalLongSizes = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: this.abiConfigs.eventAbis.vault,
        target: marketConfig.address,
        method: 'guaranteedUsd',
        params: [token.address],
        blockNumber: blockNumber,
      });
      const poolAmounts = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: this.abiConfigs.eventAbis.vault,
        target: marketConfig.address,
        method: 'poolAmounts',
        params: [token.address],
        blockNumber: blockNumber,
      });
      const reservedAmounts = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: this.abiConfigs.eventAbis.vault,
        target: marketConfig.address,
        method: 'reservedAmounts',
        params: [token.address],
        blockNumber: blockNumber,
      });

      // gmx contracts return funding rate per hour
      // we calculate borrow rate per year
      const borrowRate =
        poolAmounts.toString() !== '0'
          ? new BigNumber(reservedAmounts.toString())
              .multipliedBy(100)
              .multipliedBy(24 * 365)
              .dividedBy(new BigNumber(poolAmounts.toString()))
              .dividedBy(1e6)
              .toString(10)
          : '0';

      if (result.perpetual) {
        result.perpetual.push({
          chain: marketConfig.chain,
          protocol: marketConfig.protocol,
          metric: DataMetrics.perpetual,
          address: marketConfig.address,
          timestamp: options.timestamp,
          token: token,
          tokenPrice: tokenPrice ? tokenPrice : '0',
          totalDeposited: formatBigNumberToString(poolAmounts.toString(), token.decimals),
          totalOpenInterestShortUsd: formatBigNumberToString(globalShortSizes.toString(), 30),
          totalOpenInterestLongUsd: formatBigNumberToString(globalLongSizes.toString(), 30),
          rateBorrow: borrowRate,
        });
      }
    }

    return result;
  }

  public async getEventLogs(options: GetAdapterEventLogsOptions): Promise<Array<any>> {
    // get all logs from vault
    const logs = await this.services.blockchain.getContractLogs({
      chain: options.config.chain,
      address: options.config.address,
      fromBlock: options.fromBlock,
      toBlock: options.toBlock,
    });

    const eventSignatures = this.abiConfigs.eventSignatures as GmxEventInterfaces;
    if (options.config.metric === DataMetrics.perpetual) {
      return logs.filter(
        (item) =>
          item.topics[0] === eventSignatures.CollectMarginFees ||
          item.topics[0] === eventSignatures.IncreasePosition ||
          item.topics[0] === eventSignatures.DecreasePosition ||
          item.topics[0] === eventSignatures.LiquidatePosition,
      );
    }

    return logs;
  }

  public async getDataTimeframe(options: GetAdapterDataTimeframeOptions): Promise<GetAdapterDataTimeframeResult> {
    const states = (
      await this.getDataState({
        config: options.config,
        timestamp: options.fromTime,
      })
    ).perpetual;

    const result: GetAdapterDataTimeframeResult = {
      perpetual: [],
    };

    if (!states) {
      return result;
    }

    const beginBlock = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.fromTime,
    );
    const endBlock = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.toTime,
    );

    const eventSignatures: GmxEventInterfaces = this.abiConfigs.eventSignatures as GmxEventInterfaces;
    const marketConfig: GmxPerpetualMarketConfig = options.config as GmxPerpetualMarketConfig;

    const marketSnapshots: { [key: string]: PerpetualMarketDataTimeframe } = {};
    for (const state of states) {
      const key = `${state.chain}:${state.address}:${state.token.address}`;
      marketSnapshots[key] = {
        ...state,
        volumeFeesPaidUsd: '0',
        volumeLiquidationLongUsd: '0',
        volumeLiquidationShortUsd: '0',
        volumeOpenInterestShortUsd: '0',
        volumeOpenInterestLongUsd: '0',
        volumeTradingLongUsd: '0',
        volumeTradingShortUsd: '0',
        timefrom: options.fromTime,
        timeto: options.toTime,
        numberOfUsers: 0,
        numberOfTransactions: 0,
      };
    }

    const logs = await this.getEventLogs({
      config: options.config,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of logs) {
      const signature = log.topics[0];
      const event: any = decodeEventLog({
        abi: this.abiConfigs.eventAbis.vault,
        data: log.data,
        topics: log.topics,
      });

      switch (signature) {
        case eventSignatures.CollectMarginFees: {
          const token = await this.services.blockchain.getTokenInfo({
            chain: marketConfig.chain,
            address: event.args.token,
          });
          if (token) {
            const marketKey = `${marketConfig.chain}:${marketConfig.address}:${token.address}`;
            if (marketSnapshots[marketKey]) {
              marketSnapshots[marketKey].volumeFeesPaidUsd = new BigNumber(marketSnapshots[marketKey].volumeFeesPaidUsd)
                .plus(new BigNumber(event.args.feeUsd).dividedBy(1e30))
                .toString(10);
            }
          }

          break;
        }
        case eventSignatures.IncreasePosition:
        case eventSignatures.DecreasePosition: {
          const token = await this.services.blockchain.getTokenInfo({
            chain: marketConfig.chain,
            address: event.args.indexToken,
          });
          const isLong = Boolean(event.args.isLong);
          const sizeDelta = new BigNumber(event.args.sizeDelta.toString()).dividedBy(1e30);

          if (token) {
            const marketKey = `${marketConfig.chain}:${marketConfig.address}:${token.address}`;
            if (marketSnapshots[marketKey]) {
              if (isLong) {
                if (signature === eventSignatures.IncreasePosition) {
                  marketSnapshots[marketKey].volumeOpenInterestLongUsd = new BigNumber(
                    marketSnapshots[marketKey].volumeOpenInterestLongUsd,
                  )
                    .plus(sizeDelta)
                    .toString(10);
                }

                marketSnapshots[marketKey].volumeTradingLongUsd = new BigNumber(
                  marketSnapshots[marketKey].volumeTradingLongUsd,
                )
                  .plus(sizeDelta)
                  .toString(10);
              } else {
                if (signature === eventSignatures.IncreasePosition) {
                  marketSnapshots[marketKey].volumeOpenInterestShortUsd = new BigNumber(
                    marketSnapshots[marketKey].volumeOpenInterestShortUsd,
                  )
                    .plus(sizeDelta)
                    .toString(10);
                }
                marketSnapshots[marketKey].volumeTradingShortUsd = new BigNumber(
                  marketSnapshots[marketKey].volumeTradingShortUsd,
                )
                  .plus(sizeDelta)
                  .toString(10);
              }
            }
          }

          break;
        }
        case eventSignatures.LiquidatePosition: {
          const token = await this.services.blockchain.getTokenInfo({
            chain: marketConfig.chain,
            address: event.args.indexToken,
          });
          const isLong = Boolean(event.args.isLong);
          if (token) {
            const marketKey = `${marketConfig.chain}:${marketConfig.address}:${token.address}`;
            if (marketSnapshots[marketKey]) {
              if (isLong) {
                marketSnapshots[marketKey].volumeLiquidationLongUsd = new BigNumber(
                  marketSnapshots[marketKey].volumeLiquidationLongUsd,
                )
                  .plus(new BigNumber(event.args.size.toString()).dividedBy(1e30))
                  .toString(10);
              } else {
                marketSnapshots[marketKey].volumeLiquidationShortUsd = new BigNumber(
                  marketSnapshots[marketKey].volumeLiquidationShortUsd,
                )
                  .plus(new BigNumber(event.args.size.toString()).dividedBy(1e30))
                  .toString(10);
              }
            }
          }

          break;
        }
      }
    }

    if (result.perpetual) {
      result.perpetual = Object.values(marketSnapshots);
    }

    return result;
  }
}
