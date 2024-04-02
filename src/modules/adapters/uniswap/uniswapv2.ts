import retry from 'async-retry';
import axios from 'axios';
import BigNumber from 'bignumber.js';

import { TimeUnits } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { tryQueryBlockMeta } from '../../../lib/subgraph';
import { normalizeAddress } from '../../../lib/utils';
import { DexDataState, DexDataTimeframe, DexDataTrader } from '../../../types/collectors/dex';
import { GetAdapterDataStateOptions, GetAdapterDataTimeframeOptions } from '../../../types/collectors/options';
import { DexConfig, DexSubgraph, ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import DexProtocolAdapter from '../dex';

export interface FactoryData {
  totalLiquidity: string;
  feesTrading: string;
  volumeTrading: string;
  numberOfTransactions: number;
}

export interface EventData {
  // list of addressed as traders
  // map address with trade volume in USD
  traders: Array<DexDataTrader>;
}

export default class Uniswapv2Adapter extends DexProtocolAdapter {
  public readonly name: string = 'adapter.uniswapv2';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  protected async getFactoryData(
    subgraphConfig: DexSubgraph,
    fromBlock: number,
    toBlock: number,
  ): Promise<FactoryData | null> {
    if (subgraphConfig) {
      const filters = subgraphConfig.filters.factory;
      const factoryQuery = `
        {
          dataFrom: ${filters.factories}(first: 1, block: {number: ${fromBlock}}) {
            ${filters.volume}
            ${filters.liquidity}
            ${filters.txCount}
          }
          dataTo: ${filters.factories}(first: 1, block: {number: ${toBlock}}) {
             ${filters.volume}
            ${filters.liquidity}
            ${filters.txCount}
          }
        }
      `;

      const data = await retry(
        async function () {
          const response = await axios.post(
            subgraphConfig.endpoint,
            {
              query: factoryQuery,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );

          return response.data.data;
        },
        {
          retries: 5,
        },
      );
      if (data) {
        try {
          const totalVolumeFrom = new BigNumber(data.dataFrom[0][filters.volume].toString());
          const totalVolumeTo = new BigNumber(data.dataTo[0][filters.volume].toString());
          const volumeTrading = totalVolumeTo.minus(totalVolumeFrom);
          const feesTrading = volumeTrading
            .multipliedBy(subgraphConfig.fixedFeePercentage ? subgraphConfig.fixedFeePercentage : 0.3)
            .dividedBy(100);

          return {
            totalLiquidity: data.dataTo[0][filters.liquidity].toString(),
            feesTrading: feesTrading.toString(10),
            volumeTrading: volumeTrading.toString(10),
            numberOfTransactions: Number(data.dataTo[0][filters.txCount]) - Number(data.dataFrom[0][filters.txCount]),
          };
        } catch (e: any) {}
      }
    }

    return null;
  }

  protected async getFactoryDayData(subgraphConfig: DexSubgraph, date: number): Promise<FactoryData | null> {
    if (subgraphConfig && subgraphConfig.filters.factoryDayData) {
      const filters = subgraphConfig.filters.factoryDayData;
      const factoryQuery = `
        {
          dayData: ${filters.factories}(first: 1, where: {date: ${date}}) {
            ${filters.volume}
            ${filters.liquidity}
            ${filters.txCount}
          }
        }
      `;

      const data = await retry(
        async function () {
          const response = await axios.post(
            subgraphConfig.endpoint,
            {
              query: factoryQuery,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );

          return response.data.data;
        },
        {
          retries: 5,
        },
      );
      if (data) {
        try {
          const totalLiquidityUsd = new BigNumber(data.dayData[0][filters.liquidity].toString());
          const totalVolumeUsd = new BigNumber(data.dayData[0][filters.volume].toString());
          const feesTrading = totalVolumeUsd
            .multipliedBy(subgraphConfig.fixedFeePercentage ? subgraphConfig.fixedFeePercentage : 0.3)
            .dividedBy(100);

          return {
            totalLiquidity: totalLiquidityUsd.toString(),
            feesTrading: feesTrading.toString(10),
            volumeTrading: totalVolumeUsd.toString(10),
            numberOfTransactions: Number(data.dayData[0][filters.txCount]),
          };
        } catch (e: any) {}
      }
    }

    return null;
  }

  protected async getEventData(dexConfig: DexConfig, fromTime: number, toTime: number): Promise<EventData | null> {
    const subgraphConfig = dexConfig.subgraph;

    if (subgraphConfig && subgraphConfig.filters.eventSwaps) {
      const filters = subgraphConfig.filters.eventSwaps;

      let timestamp = fromTime;
      const transactionIds: { [key: string]: boolean } = {};
      const traders: { [key: string]: DexDataTrader } = {};
      do {
        const eventSwapsQuery = `
          {
            swaps: ${filters.event}(first: 1000, where: { timestamp_gte: ${timestamp}, timestamp_lte: ${toTime} }, orderBy: timestamp, orderDirection: asc) {
              id
              ${filters.trader}
              ${filters.volumeUsd}
              ${filters.timestamp}
            }
          }
        `;

        const data = await retry(
          async function () {
            const response = await axios.post(
              subgraphConfig.endpoint,
              {
                query: eventSwapsQuery,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              },
            );

            return response.data.data;
          },
          {
            retries: 5,
          },
        );

        const swapEvents = data.swaps ? (data.swaps as Array<any>) : [];
        for (const swapEvent of swapEvents) {
          if (!transactionIds[swapEvent.id]) {
            transactionIds[swapEvent.id] = true;

            const trader = normalizeAddress(swapEvent[filters.trader]);
            if (!traders[trader]) {
              traders[trader] = {
                address: trader,
                volumeUsd: '0',
              };
            }

            traders[trader].volumeUsd = new BigNumber(traders[trader].volumeUsd)
              .plus(new BigNumber(swapEvent[filters.volumeUsd].toString()))
              .toString(10);
          }
        }

        timestamp =
          swapEvents.length > 0 ? Number(swapEvents[swapEvents.length - 1][filters.timestamp]) + 1 : toTime + 1;
      } while (timestamp <= toTime);

      return {
        traders: Object.values(traders),
      };
    }

    return null;
  }

  public async getDexDataState(options: GetAdapterDataStateOptions): Promise<DexDataState | null> {
    const dexConfig = options.config as DexConfig;
    if (dexConfig.subgraph) {
      const metaBlock = await tryQueryBlockMeta(EnvConfig.blockchains[options.config.chain].blockSubgraph);
      const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
        options.config.chain,
        options.timestamp - TimeUnits.SecondsPerDay,
      );
      const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
        options.config.chain,
        options.timestamp,
      );

      const factoryData = await this.getFactoryData(
        dexConfig.subgraph,
        beginBlock,
        endBlock > metaBlock ? metaBlock : endBlock,
      );
      if (factoryData) {
        return {
          protocol: dexConfig.protocol,
          chain: dexConfig.chain,
          metric: dexConfig.metric,
          version: dexConfig.version,
          timestamp: options.timestamp,
          totalLiquidityUsd: factoryData.totalLiquidity,
        };
      }
    }

    return null;
  }

  public async getDexDataTimeframe(options: GetAdapterDataTimeframeOptions): Promise<DexDataTimeframe | null> {
    const dexConfig = options.config as DexConfig;

    if (dexConfig.subgraph) {
      const metaBlock = await tryQueryBlockMeta(EnvConfig.blockchains[options.config.chain].blockSubgraph);
      const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
        options.config.chain,
        options.fromTime,
      );
      const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
        options.config.chain,
        options.toTime,
      );

      const dexData: DexDataTimeframe = {
        protocol: dexConfig.protocol,
        chain: dexConfig.chain,
        metric: dexConfig.metric,
        version: dexConfig.version,
        timestamp: options.fromTime,
        timefrom: options.fromTime,
        timeto: options.toTime,

        totalLiquidityUsd: '0',
        feesTradingUsd: '0',
        volumeTradingUsd: '0',
        numberOfTransactions: 0,

        traders: [],
      };
      const factoryData = await this.getFactoryData(
        dexConfig.subgraph,
        beginBlock,
        endBlock > metaBlock ? metaBlock : endBlock,
      );
      if (factoryData) {
        dexData.totalLiquidityUsd = factoryData.totalLiquidity;
        dexData.feesTradingUsd = factoryData.feesTrading;
        dexData.volumeTradingUsd = factoryData.volumeTrading;
        dexData.numberOfTransactions = factoryData.numberOfTransactions;
      } else {
        // try query date data
        const factoryDayData = await this.getFactoryDayData(dexConfig.subgraph, options.fromTime);
        if (factoryDayData) {
          dexData.totalLiquidityUsd = factoryDayData.totalLiquidity;
          dexData.feesTradingUsd = factoryDayData.feesTrading;
          dexData.volumeTradingUsd = factoryDayData.volumeTrading;
          dexData.numberOfTransactions = factoryDayData.numberOfTransactions;
        }
      }

      if (options.props && options.props.disableGetEvents) {
        return dexData;
      }

      // const eventData = await this.getEventData(dexConfig, options.fromTime, options.toTime);
      // if (eventData) {
      //   dexData.traders = eventData.traders;
      // }

      return dexData;
    }

    return null;
  }
}
