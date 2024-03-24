import retry from 'async-retry';
import axios from 'axios';
import BigNumber from 'bignumber.js';

import { TimeUnits } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { tryQueryBlockMeta, tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { DexDataState, DexDataTimeframe } from '../../../types/collectors/dex';
import { GetAdapterDataStateOptions, GetAdapterDataTimeframeOptions } from '../../../types/collectors/options';
import { DexConfig, DexSubgraph } from '../../../types/configs';
import { ContextServices } from '../../../types/namespaces';
import ProtocolAdapter from '../adapter';

interface FactoryData {
  totalLiquidity: string;
  feesTrading: string;
  volumeTrading: string;
  volumeTradingCumulative: string;
  numberOfTransactions: number;
  numberOfTransactionsCumulative: number;
}

export default class Uniswapv2Adapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.uniswapv2';

  constructor(services: ContextServices) {
    super(services);
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
            volumeTradingCumulative: totalVolumeTo.toString(10),
            numberOfTransactions: Number(data.dataTo[0][filters.txCount]) - Number(data.dataFrom[0][filters.txCount]),
            numberOfTransactionsCumulative: Number(data.dataTo[0][filters.txCount]),
          };
        } catch (e: any) {}
      }
    }

    return null;
  }

  public async getDataState(options: GetAdapterDataStateOptions): Promise<DexDataState | null> {
    const dexConfig = options.config as DexConfig;
    if (dexConfig.subgraph) {
      const metaBlock = await tryQueryBlockMeta(EnvConfig.blockchains[options.config.chain].blockSubgraph);
      const beginBlock = await tryQueryBlockNumberAtTimestamp(
        EnvConfig.blockchains[options.config.chain].blockSubgraph,
        options.timestamp - TimeUnits.SecondsPerDay,
      );
      const endBlock = await tryQueryBlockNumberAtTimestamp(
        EnvConfig.blockchains[options.config.chain].blockSubgraph,
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
          totalLiquidity: factoryData.totalLiquidity,
        };
      }
    }

    return null;
  }

  public async getDataTimeframe(options: GetAdapterDataTimeframeOptions): Promise<DexDataTimeframe | null> {
    const dexConfig = options.config as DexConfig;

    if (dexConfig.subgraph) {
      const metaBlock = await tryQueryBlockMeta(EnvConfig.blockchains[options.config.chain].blockSubgraph);
      const beginBlock = await tryQueryBlockNumberAtTimestamp(
        EnvConfig.blockchains[options.config.chain].blockSubgraph,
        options.fromTime,
      );
      const endBlock = await tryQueryBlockNumberAtTimestamp(
        EnvConfig.blockchains[options.config.chain].blockSubgraph,
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

        totalLiquidity: '0',
        feesTrading: '0',
        volumeTrading: '0',
        volumeTradingCumulative: '0',
        numberOfTransactions: 0,
        numberOfTransactionsCumulative: 0,
      };
      const factoryData = await this.getFactoryData(
        dexConfig.subgraph,
        beginBlock,
        endBlock > metaBlock ? metaBlock : endBlock,
      );
      if (factoryData) {
        dexData.totalLiquidity = factoryData.totalLiquidity;
        dexData.feesTrading = factoryData.feesTrading;
        dexData.volumeTrading = factoryData.volumeTrading;
        dexData.volumeTradingCumulative = factoryData.volumeTradingCumulative;
        dexData.numberOfTransactions = factoryData.numberOfTransactions;
        dexData.numberOfTransactionsCumulative = factoryData.numberOfTransactionsCumulative;
      }

      return dexData;
    }

    return null;
  }
}
