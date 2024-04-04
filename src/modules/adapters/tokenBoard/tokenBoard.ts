import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import Erc20Abi from '../../../configs/abi/ERC20.json';
import { AddressZero, Erc20TransferEventSignature, TimeUnits } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { compareAddress, formatBigNumberToString, getTimestamp, normalizeAddress } from '../../../lib/utils';
import { DataMetrics, MetricConfig, ProtocolConfig, TokenBoardConfig } from '../../../types/configs';
import {
  TokenBoardDataState,
  TokenBoardDataStateWithTimeframes,
  TokenBoardDataTimeframe,
} from '../../../types/domains/tokenBoard';
import { ContextServices, ContextStorages, ITokenBoardAdapter } from '../../../types/namespaces';
import { GetAdapterDataStateOptions, GetAdapterDataTimeframeOptions, RunAdapterOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';

export default class TokenBoardAdapter extends ProtocolAdapter implements ITokenBoardAdapter {
  public readonly name: string = 'adapter.tokenBoard';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getTokenDataState(options: GetAdapterDataStateOptions): Promise<TokenBoardDataState | null> {
    const erc20Config = options.config as TokenBoardConfig;

    const blockNumber = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.timestamp,
    );

    const dataState: TokenBoardDataState = {
      chain: erc20Config.chain,
      protocol: erc20Config.protocol,
      metric: erc20Config.metric,
      address: erc20Config.address,
      symbol: erc20Config.symbol,
      decimals: erc20Config.decimals,
      stablecoin: erc20Config.stablecoin,
      tokenPrice: '0',
      totalSupply: '0',
      timestamp: options.timestamp,
    };

    const tokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: erc20Config.chain,
      address: erc20Config.address,
      timestamp: options.timestamp,
    });

    if (tokenPrice) {
      dataState.tokenPrice = tokenPrice;
    }

    const totalSupply = await this.services.blockchain.readContract({
      chain: erc20Config.chain,
      abi: Erc20Abi,
      target: erc20Config.address,
      method: 'totalSupply',
      params: [],
      blockNumber,
    });

    dataState.totalSupply = formatBigNumberToString(totalSupply.toString(), erc20Config.decimals);

    return dataState;
  }

  public async getTokenDataTimeframe(options: GetAdapterDataTimeframeOptions): Promise<TokenBoardDataTimeframe | null> {
    const dataState = await this.getTokenDataState({
      config: options.config,
      timestamp: options.fromTime,
    });
    if (!dataState) {
      return null;
    }

    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    const logs = await this.services.blockchain.getContractLogs({
      chain: options.config.chain,
      address: options.config.address,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    let volumeTransfer = new BigNumber(0);
    let volumeMint = new BigNumber(0);
    let volumeBurn = new BigNumber(0);
    for (const log of logs) {
      const signature = log.topics[0];
      const address = normalizeAddress(log.address);

      if (signature === Erc20TransferEventSignature && compareAddress(address, dataState.address)) {
        const event: any = decodeEventLog({
          abi: Erc20Abi,
          data: log.data,
          topics: log.topics,
        });

        const amount = formatBigNumberToString(event.args.value.toString(), dataState.decimals);
        const sender = normalizeAddress(event.args.from);
        const recipient = normalizeAddress(event.args.to);

        if (amount !== '0') {
          volumeTransfer = volumeTransfer.plus(new BigNumber(amount));

          if (compareAddress(sender, AddressZero)) {
            volumeMint = volumeMint.plus(new BigNumber(amount));
          }

          if (compareAddress(recipient, AddressZero)) {
            volumeBurn = volumeBurn.plus(new BigNumber(amount));
          }
        }
      }
    }

    return {
      ...dataState,

      timefrom: options.fromTime,
      timeto: options.toTime,
      volumeTransfer: volumeTransfer.toString(10),
      volumeMint: volumeMint.toString(10),
      volumeBurn: volumeBurn.toString(10),
    };
  }

  public async collectDataState(options: RunAdapterOptions): Promise<void> {
    const config = options.metricConfig;
    if (config.metric === DataMetrics.tokenBoard) {
      const timestamp = getTimestamp();

      const dataState = await this.getTokenDataState({
        config: config,
        timestamp: timestamp,
      });

      const timeframeLast24Hours = await this.getTokenDataTimeframe({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay,
        toTime: timestamp,
      });

      const timeframeLast48Hours = await this.getTokenDataTimeframe({
        config: config,
        fromTime: timestamp - TimeUnits.SecondsPerDay * 2,
        toTime: timestamp - TimeUnits.SecondsPerDay,
      });

      if (dataState) {
        const stateWithTimeframes: TokenBoardDataStateWithTimeframes = {
          ...dataState,
          timefrom: timestamp - TimeUnits.SecondsPerDay,
          timeto: timestamp,
          volumeTransfer: '0',
          volumeMint: '0',
          volumeBurn: '0',
          last24Hours: null,
        };

        if (timeframeLast24Hours) {
          stateWithTimeframes.volumeTransfer = timeframeLast24Hours.volumeTransfer;
          stateWithTimeframes.volumeMint = timeframeLast24Hours.volumeMint;
          stateWithTimeframes.volumeBurn = timeframeLast24Hours.volumeBurn;
        }

        if (timeframeLast48Hours) {
          stateWithTimeframes.last24Hours = timeframeLast48Hours;
        }

        await this.storages.database.update({
          collection: EnvConfig.mongodb.collections.tokenBoardStates.name,
          keys: {
            chain: dataState.chain,
            address: dataState.address,
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
    return await this.getTokenDataTimeframe({
      config: config,
      fromTime: fromTime,
      toTime: toTime,
    });
  }

  protected async processSnapshot(config: MetricConfig, snapshot: any): Promise<void> {
    await this.storages.database.update({
      collection: EnvConfig.mongodb.collections.tokenBoardSnapshots.name,
      keys: {
        chain: snapshot.chain,
        address: snapshot.address,
        timestamp: snapshot.timestamp,
      },
      updates: {
        ...snapshot,
      },
      upsert: true,
    });
  }
}
