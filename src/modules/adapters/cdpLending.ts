import Erc20Abi from '../../configs/abi/ERC20.json';
import { TimeUnits } from '../../configs/constants';
import EnvConfig from '../../configs/envConfig';
import { formatBigNumberToString, getTimestamp } from '../../lib/utils';
import { CdpLendingMarketConfig, DataMetrics, MetricConfig, ProtocolConfig, Token } from '../../types/configs';
import { CdpLendingAssetDataStateWithTimeframes, CdpLendingAssetDataTimeframe } from '../../types/domains/cdpLending';
import { ContextServices, ContextStorages, ICdpLendingProtocolAdapter } from '../../types/namespaces';
import { GetAdapterDataTimeframeOptions, RunAdapterOptions } from '../../types/options';
import ProtocolAdapter from './adapter';

export interface CdpAdapterInitialDataState {
  beginBlock: number;
  endBlock: number;
  stateTime: number;
  stateBlock: number;
  assetState: CdpLendingAssetDataTimeframe;
}

export default class CdpLendingProtocolAdapter extends ProtocolAdapter implements ICdpLendingProtocolAdapter {
  public readonly name: string = 'adapter.cdpLending';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  protected async initialLendingAssetData(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<CdpAdapterInitialDataState> {
    const marketConfig = options.config as CdpLendingMarketConfig;

    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    const stateTime = options.latestState ? options.toTime : options.fromTime;
    const stateBlock = options.latestState ? endBlock : beginBlock;

    const debtToken = marketConfig.debtToken as Token;
    const debtTokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: debtToken.chain,
      address: debtToken.address,
      timestamp: stateTime,
    });

    const totalSupply = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: Erc20Abi,
      target: marketConfig.debtToken.address,
      method: 'totalSupply',
      params: [],
      blockNumber: stateBlock,
    });

    return {
      beginBlock,
      endBlock,
      stateTime,
      stateBlock,
      assetState: {
        chain: options.config.chain,
        protocol: options.config.protocol,
        metric: options.config.metric,
        timestamp: stateTime,
        timefrom: options.fromTime,
        timeto: options.toTime,

        token: debtToken,
        tokenPrice: debtTokenPrice ? debtTokenPrice : '0',

        totalBorrowed: '0',
        totalSupply: formatBigNumberToString(totalSupply.toString(), debtToken.decimals),
        volumeRepaid: '0',
        volumeBorrowed: '0',
        feesPaid: '0',

        addresses: [],
        transactions: [],
        collaterals: [],
      } as CdpLendingAssetDataTimeframe,
    };
  }

  public async getLendingAssetData(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<CdpLendingAssetDataTimeframe | null> {
    return null;
  }

  public async collectDataState(options: RunAdapterOptions): Promise<void> {
    const config = options.metricConfig;
    if (config.metric === DataMetrics.cdpLending) {
      const timestamp = getTimestamp();

      const dataState = await this.getLendingAssetData({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay,
        toTime: timestamp,
        latestState: true,
      });

      const dataLast24Hours = await this.getLendingAssetData({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay * 2,
        toTime: timestamp - TimeUnits.SecondsPerDay,
        latestState: true,
      });

      if (dataState) {
        const stateWithTimeframes: CdpLendingAssetDataStateWithTimeframes = {
          ...dataState,
          last24Hours: dataLast24Hours,
        };

        await this.storages.database.update({
          collection: EnvConfig.mongodb.collections.cdpLendingAssetStates.name,
          keys: {
            chain: dataState.chain,
            protocol: dataState.protocol,
            address: dataState.token.address, // debt token address
          },
          updates: {
            ...stateWithTimeframes,
          },
          upsert: true,
        });
      }
    }
  }

  protected async getSnapshot(config: MetricConfig, fromTime: number, toTime: number): Promise<any> {
    return await this.getLendingAssetData({
      config: config,
      fromTime: fromTime,
      toTime: toTime,
    });
  }

  protected async processSnapshot(config: MetricConfig, snapshot: any): Promise<void> {
    await this.storages.database.update({
      collection: EnvConfig.mongodb.collections.cdpLendingAssetSnapshots.name,
      keys: {
        chain: snapshot.chain,
        protocol: snapshot.protocol,
        address: snapshot.token.address, // debt token address
        timestamp: snapshot.timestamp,
      },
      updates: {
        ...snapshot,
      },
      upsert: true,
    });
  }

  public async runTest(options: RunAdapterOptions): Promise<void> {
    const currentTime = getTimestamp();
    const last24Hours = currentTime - 24 * 60 * 60;
    console.log(
      await this.getLendingAssetData({
        config: options.metricConfig,
        fromTime: last24Hours,
        toTime: currentTime,
        latestState: true,
      }),
    );
  }
}
