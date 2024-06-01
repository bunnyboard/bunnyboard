import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import SocketGatewayAbi from '../../../configs/abi/bungee/SocketGateway.json';
import { TimeUnits } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { BungeeGatewayConfig } from '../../../configs/protocols/bungee';
import { formatBigNumberToString, getTimestamp, normalizeAddress } from '../../../lib/utils';
import { MetricConfig, ProtocolConfig } from '../../../types/configs';
import {
  BungeeGatewayDataStateWithTimeframe,
  BungeeGatewayDataTimeframe,
} from '../../../types/domains/ecosystem/bungee';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions, RunAdapterOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import { BungeeEventSignatures, BungeeKnownBridgeNames, BungeeStargateChainIds } from './abis';

export default class BungeeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.bungee';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getGatewayData(options: GetAdapterDataTimeframeOptions): Promise<BungeeGatewayDataTimeframe | null> {
    const bungeeConfig = options.config as BungeeGatewayConfig;

    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    const stateTime = options.latestState ? options.toTime : options.fromTime;
    // const stateBlock = options.latestState ? endBlock : beginBlock;

    const bungeeData: BungeeGatewayDataTimeframe = {
      protocol: bungeeConfig.protocol,
      chain: bungeeConfig.chain,
      timestamp: stateTime,
      address: normalizeAddress(bungeeConfig.address),

      volumeBridgeUsd: 0,
      volumeBridgeUsdDestinations: {},
      volumeBridgeUsdProtocols: {},
      volumeBridgeTokens: {},

      addresses: [],
      transactions: [],
    };

    const logs = await this.services.blockchain.getContractLogs({
      chain: bungeeConfig.chain,
      address: bungeeConfig.address,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    const addresses: any = {};
    const transactions: any = {};
    for (const log of logs.filter((item) => item.topics[0] === BungeeEventSignatures.SocketBridge)) {
      const event: any = decodeEventLog({
        abi: SocketGatewayAbi,
        data: log.data,
        topics: log.topics,
      });

      transactions[log.transactionHash] = true;
      for (const field of ['sender', 'receiver']) {
        addresses[normalizeAddress(event.args[field])] = true;
      }

      // bungee identity bridge name by unique bytes32 hash
      // to know which bytes32 mapped to which bridge
      // check the Bungee bridge implementation contract
      const bridgeName = BungeeKnownBridgeNames[event.args.bridgeName]
        ? BungeeKnownBridgeNames[event.args.bridgeName]
        : event.args.bridgeName;

      const toChainId = new BigNumber(event.args.toChainId.toString()).toNumber();
      let toChainName = `unknown:${toChainId}`;
      if (bridgeName === 'stargate' && BungeeStargateChainIds[toChainId]) {
        // https://stargateprotocol.gitbook.io/stargate/developers/chain-ids
        toChainName = BungeeStargateChainIds[toChainId];
      } else {
        for (const blockchain of Object.values(EnvConfig.blockchains)) {
          if (blockchain.chainId === toChainId) {
            toChainName = blockchain.name;
          }
        }
      }

      const token = await this.services.blockchain.getTokenInfo({
        chain: bungeeConfig.chain,
        address: event.args.token,
      });
      if (token) {
        const tokenPricePrice = await this.services.oracle.getTokenPriceUsd({
          chain: bungeeConfig.chain,
          address: token.address,
          timestamp: stateTime,
        });

        const tokenPrice = new BigNumber(tokenPricePrice ? tokenPricePrice : '0');
        const usdAmount = new BigNumber(
          formatBigNumberToString(event.args.amount.toString(), token.decimals),
        ).multipliedBy(tokenPrice);

        bungeeData.volumeBridgeUsd += usdAmount.toNumber();

        if (!bungeeData.volumeBridgeUsdDestinations[toChainName]) {
          bungeeData.volumeBridgeUsdDestinations[toChainName] = 0;
        }
        if (!bungeeData.volumeBridgeUsdProtocols[bridgeName]) {
          bungeeData.volumeBridgeUsdProtocols[bridgeName] = 0;
        }
        if (!bungeeData.volumeBridgeTokens[token.address]) {
          bungeeData.volumeBridgeTokens[token.address] = {
            token: token,
            tokenPrice: tokenPrice.toNumber(),
            tokenVolume: 0,
          };
        }

        bungeeData.volumeBridgeUsdDestinations[toChainName] += usdAmount.toNumber();
        bungeeData.volumeBridgeUsdProtocols[bridgeName] += usdAmount.toNumber();
        bungeeData.volumeBridgeTokens[token.address].tokenVolume += usdAmount.toNumber();
      }
    }

    bungeeData.addresses = Object.keys(addresses);
    bungeeData.transactions = Object.keys(transactions);

    return bungeeData;
  }

  public async collectDataState(options: RunAdapterOptions): Promise<void> {
    const timestamp = getTimestamp();
    const timestampLast24Hours = timestamp - TimeUnits.SecondsPerDay;
    const timestampLast48Hours = timestamp - TimeUnits.SecondsPerDay * 2;

    const dataCurrent = await this.getGatewayData({
      config: options.metricConfig,
      fromTime: timestampLast24Hours,
      toTime: timestamp,
      latestState: true,
    });

    const dataLast24Hours = await this.getGatewayData({
      config: options.metricConfig,
      fromTime: timestampLast48Hours,
      toTime: timestampLast24Hours,
      latestState: true,
    });

    if (dataCurrent && dataLast24Hours) {
      const stateWithTimeframes: BungeeGatewayDataStateWithTimeframe = {
        ...dataCurrent,
        last24Hours: dataLast24Hours,
      };

      await this.storages.database.update({
        collection: EnvConfig.mongodb.collections.ecosystemDataStates.name,
        keys: {
          chain: dataCurrent.chain,
          protocol: dataCurrent.protocol,
        },
        updates: {
          ...stateWithTimeframes,
        },
        upsert: true,
      });
    }
  }

  protected async getSnapshot(config: MetricConfig, fromTime: number, toTime: number): Promise<any> {
    return await this.getGatewayData({
      config: config,
      fromTime: fromTime,
      toTime: toTime,
    });
  }

  protected async processSnapshot(config: MetricConfig, snapshot: any): Promise<void> {
    await this.storages.database.update({
      collection: EnvConfig.mongodb.collections.ecosystemDataSnapshots.name,
      keys: {
        chain: snapshot.chain,
        protocol: snapshot.protocol,
        timestamp: snapshot.timestamp,
      },
      updates: {
        ...snapshot,
      },
      upsert: true,
    });
  }
}
