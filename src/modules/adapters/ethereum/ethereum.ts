import { AddressZero, TimeUnits } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import {
  compareAddress,
  formatBigNumberToString,
  formatLittleEndian64ToString,
  getTimestamp,
  normalizeAddress,
} from '../../../lib/utils';
import { DataMetrics, MetricConfig, ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions, RunAdapterOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import {
  ArbitrumBridgeConfig,
  EthereumEcosystemConfig,
  OptimismBridgeConfig,
} from '../../../configs/protocols/ethereum';
import logger from '../../../lib/logger';
import axios from 'axios';
import {
  EthereumDataState,
  EthereumDataStateWithTimeframe,
  EthereumDataTimeframe,
  EthereumLayer2Stats,
} from '../../../types/domains/ecosystem/ethereum';
import BigNumber from 'bignumber.js';
import { Address, decodeEventLog, decodeFunctionData } from 'viem';
import BeaconDepositAbi from '../../../configs/abi/BeaconDeposit.json';
import OptimismBridgeAbi from '../../../configs/abi/optimism/L1StandardBridge.json';
import BlastYieldManagerAbi from '../../../configs/abi/blast/YieldManager.json';
import ArbitrumInboxAbi from '../../../configs/abi/arbitrum/Inbox.json';
import ArbitrumBridgeAbi from '../../../configs/abi/arbitrum/Bridge.json';
import { ChainNames } from '../../../configs/names';

const BeaconDepositEvent = '0x649bbc62d0e31342afea4e5cd82d4049e7e1ee912fc0889aa790803be39038c5';
const OptimismBridgeDepositEvent = '0x2849b43074093a05396b6f2a937dee8565b15a48a7b3d4bffb732a5017380af5';
const OptimismBridgeWithdrawEvent = '0x31b2166ff604fc5672ea5df08a78081d2bc6d746cadce880747f3643d819e83d';

// deposit to arbitrum
const ArbitrumInboxMessageDeliveredEvent = '0xff64905f73a67fb594e0f940a8075a860db489ad991e032f48c81123eb52d60b';

// for withdraw from arbitrum
const ArbitrumBridgeCallTriggered = '0x2d9d115ef3e4a606d698913b1eae831a3cdfe20d9a83d48007b0526749c3d466';

export default class EthereumAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.ethereum';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getEthereumDataState(options: GetAdapterDataTimeframeOptions): Promise<EthereumDataState | null> {
    const ethereumConfig = options.config as EthereumEcosystemConfig;

    if (ethereumConfig.metric !== DataMetrics.ecosystem) {
      return null;
    }

    // query stats from Etherscan
    let etherscanResponse = null;
    if (ethereumConfig.etherscanApiKey !== '') {
      const etherscanUrl = `https://api.etherscan.io/api?module=stats&action=ethsupply2&apikey=${ethereumConfig.etherscanApiKey}`;
      try {
        etherscanResponse = (await axios.get(etherscanUrl)).data;
      } catch (e: any) {
        logger.warn('failed to query etherscan api', {
          service: this.name,
          chain: ethereumConfig.chain,
          protocol: ethereumConfig.protocol,
          error: e.message,
        });
      }
    }

    const dataTimeframe = await this.getEcosystemDataTimeframe(options);
    if (dataTimeframe) {
      return {
        ...dataTimeframe,
        totalCoinSupply: etherscanResponse
          ? formatBigNumberToString(etherscanResponse.result.EthSupply.toString(), 18)
          : '0',
        totalCoinBurnt: etherscanResponse
          ? formatBigNumberToString(etherscanResponse.result.BurntFees.toString(), 18)
          : '0',
        totalCoinEth2Rewards: etherscanResponse
          ? formatBigNumberToString(etherscanResponse.result.Eth2Staking.toString(), 18)
          : '0',
        totalCoinEth2Withdrawn: etherscanResponse
          ? formatBigNumberToString(etherscanResponse.result.WithdrawnTotal.toString(), 18)
          : '0',
      };
    }

    return null;
  }

  public async getEcosystemDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<EthereumDataTimeframe | null> {
    const ethereumConfig = options.config as EthereumEcosystemConfig;

    if (ethereumConfig.metric !== DataMetrics.ecosystem) {
      return null;
    }

    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    const stateTime = options.latestState ? options.toTime : options.fromTime;
    const stateBlock = options.latestState ? endBlock : beginBlock;

    const ethPrice = await this.services.oracle.getTokenPriceUsd({
      chain: ethereumConfig.chain,
      address: AddressZero,
      timestamp: stateTime,
    });

    const ethereumData: EthereumDataTimeframe = {
      protocol: ethereumConfig.protocol,
      chain: ethereumConfig.chain,
      timestamp: stateTime,
      coinPrice: ethPrice ? ethPrice : '0',

      volumeCoinDeposited: '0',
      volumeCoinWithdrawn: '0',
      volumeCoinBurnt: '0',

      gasLimit: '0',
      gasUsed: '0',

      transactionCount: 0,
      transactuonTypes: {},
      senderAddresses: [],
      beaconDeposits: [],
      layer2: [],
    };

    const client = this.services.blockchain.getPublicClient(ethereumConfig.chain);

    const beacoinEvents = await this.services.blockchain.getContractLogs({
      chain: ethereumConfig.chain,
      address: ethereumConfig.address,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    logger.debug(`processing beacon deposit events logs`, {
      service: this.name,
      chain: ethereumConfig.chain,
      protocol: ethereumConfig.protocol,
      total: beacoinEvents.length,
    });

    const transactions: { [key: string]: any } = {};
    for (const log of beacoinEvents) {
      // BeaconDeposit events
      if (log.topics[0] === BeaconDepositEvent) {
        const event: any = decodeEventLog({
          abi: BeaconDepositAbi,
          topics: log.topics,
          data: log.data,
        });

        if (!transactions[log.transactionHash]) {
          transactions[log.transactionHash] = await client.getTransaction({
            hash: log.transactionHash,
          });
        }

        const depositor = normalizeAddress(transactions[log.transactionHash].from);
        const contract = transactions[log.transactionHash].to
          ? normalizeAddress(transactions[log.transactionHash].to)
          : '';
        const amount = formatLittleEndian64ToString(event.args.amount.toString());

        ethereumData.beaconDeposits.push({
          depositor,
          contract,
          amount,
        });

        ethereumData.volumeCoinDeposited = new BigNumber(ethereumData.volumeCoinDeposited).plus(amount).toString(10);
      }
    }

    logger.debug('processing ethereum blocks data', {
      service: this.name,
      chain: ethereumConfig.chain,
      protocol: ethereumConfig.protocol,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    const senderAddresses: { [key: string]: true } = {};
    for (let queryBlock = beginBlock; queryBlock <= endBlock; queryBlock++) {
      const block = await client.getBlock({
        blockNumber: BigInt(queryBlock),
        includeTransactions: true,
      });
      if (block) {
        ethereumData.gasLimit = new BigNumber(ethereumData.gasLimit)
          .plus(new BigNumber(block.gasLimit.toString()))
          .toString(10);
        ethereumData.gasUsed = new BigNumber(ethereumData.gasUsed)
          .plus(new BigNumber(block.gasUsed.toString()))
          .toString(10);
        ethereumData.volumeCoinBurnt = new BigNumber(ethereumData.volumeCoinBurnt)
          .plus(
            formatBigNumberToString(
              new BigNumber(block.gasUsed.toString())
                .multipliedBy(new BigNumber(block.baseFeePerGas ? block.baseFeePerGas.toString() : '0'))
                .toString(10),
              18,
            ),
          )
          .toString(10);
        ethereumData.transactionCount += block.transactions.length;

        if (block.withdrawals) {
          for (const withdrawal of block.withdrawals) {
            ethereumData.volumeCoinWithdrawn = new BigNumber(ethereumData.volumeCoinWithdrawn)
              .plus(formatBigNumberToString(withdrawal.amount.toString(), 9))
              .toString(10);
          }
        }

        for (const transaction of block.transactions) {
          senderAddresses[normalizeAddress(transaction.from)] = true;

          if (!ethereumData.transactuonTypes[transaction.type]) {
            ethereumData.transactuonTypes[transaction.type] = 0;
          }
          ethereumData.transactuonTypes[transaction.type] += 1;
        }
      } else {
        logger.warn('failed to query ethereum block data', {
          service: this.name,
          chain: ethereumConfig.chain,
          protocol: ethereumConfig.protocol,
          number: queryBlock,
        });
      }
    }

    for (const layer2Config of ethereumConfig.layer2) {
      logger.debug(`processing layer 2 data`, {
        service: this.name,
        chain: ethereumConfig.chain,
        protocol: ethereumConfig.protocol,
        layer2: layer2Config.layer2,
        based: layer2Config.based,
      });

      const layer2Stats: EthereumLayer2Stats = {
        layer2: layer2Config.layer2,
        totalCoinLocked: '0',
        volumeDepositedToLayer2: '0',
        volumeWithdrawnFromLayer2: '0',
      };

      if (layer2Config.based === 'optimism') {
        if (layer2Config.layer2 === ChainNames.blast) {
          const balance = await this.services.blockchain.readContract({
            chain: ethereumConfig.chain,
            target: (layer2Config.bridgeConfig as OptimismBridgeConfig).portal,
            abi: BlastYieldManagerAbi,
            method: 'totalValue',
            params: [],
            blockNumber: stateBlock,
          });
          layer2Stats.totalCoinLocked = formatBigNumberToString(balance.toString(), 18);
        } else {
          const client = this.services.blockchain.getPublicClient(ethereumConfig.chain);
          const balance = await client.getBalance({
            address: (layer2Config.bridgeConfig as OptimismBridgeConfig).portal as Address,
          });
          layer2Stats.totalCoinLocked = formatBigNumberToString(balance.toString(), 18);
        }

        for (const gatewayContract of (layer2Config.bridgeConfig as OptimismBridgeConfig).gateways) {
          const gatewayEvents = await this.services.blockchain.getContractLogs({
            chain: ethereumConfig.chain,
            address: gatewayContract,
            fromBlock: beginBlock,
            toBlock: endBlock,
          });

          for (const log of gatewayEvents) {
            const signature = log.topics[0];
            if (
              (signature === OptimismBridgeDepositEvent || signature === OptimismBridgeWithdrawEvent) &&
              compareAddress(log.address, gatewayContract)
            ) {
              const event: any = decodeEventLog({
                abi: OptimismBridgeAbi,
                topics: log.topics,
                data: log.data,
              });
              const amount = formatBigNumberToString(event.args.amount.toString(), 18);

              if (signature === OptimismBridgeDepositEvent) {
                layer2Stats.volumeDepositedToLayer2 = new BigNumber(layer2Stats.volumeDepositedToLayer2)
                  .plus(amount)
                  .toString(10);
              } else {
                layer2Stats.volumeWithdrawnFromLayer2 = new BigNumber(layer2Stats.volumeWithdrawnFromLayer2)
                  .plus(amount)
                  .toString(10);
              }
            }
          }
        }
      } else if (layer2Config.based === 'arbitrum') {
        const client = this.services.blockchain.getPublicClient(ethereumConfig.chain);
        const balance = await client.getBalance({
          address: (layer2Config.bridgeConfig as ArbitrumBridgeConfig).bridge as Address,
        });
        layer2Stats.totalCoinLocked = formatBigNumberToString(balance.toString(), 18);

        let bridgeLogs = await this.services.blockchain.getContractLogs({
          chain: ethereumConfig.chain,
          address: (layer2Config.bridgeConfig as ArbitrumBridgeConfig).bridge,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        bridgeLogs = bridgeLogs.concat(
          await this.services.blockchain.getContractLogs({
            chain: ethereumConfig.chain,
            address: (layer2Config.bridgeConfig as ArbitrumBridgeConfig).inbox,
            fromBlock: beginBlock,
            toBlock: endBlock,
          }),
        );

        for (const log of bridgeLogs) {
          const signature = log.topics[0];
          if (
            signature === ArbitrumInboxMessageDeliveredEvent &&
            compareAddress(log.address, (layer2Config.bridgeConfig as ArbitrumBridgeConfig).inbox)
          ) {
            if (!transactions[log.transactionHash]) {
              transactions[log.transactionHash] = await client.getTransaction({
                hash: log.transactionHash,
              });
              try {
                const params = decodeFunctionData({
                  abi: ArbitrumInboxAbi,
                  data: transactions[log.transactionHash].input,
                });
                if (params && params.functionName === 'depositEth') {
                  layer2Stats.volumeDepositedToLayer2 = new BigNumber(layer2Stats.volumeDepositedToLayer2)
                    .plus(formatBigNumberToString(transactions[log.transactionHash].value.toString(), 18))
                    .toString(10);
                }
              } catch (e: any) {}
            }
          } else if (
            signature === ArbitrumBridgeCallTriggered &&
            compareAddress(log.address, (layer2Config.bridgeConfig as ArbitrumBridgeConfig).bridge)
          ) {
            const event: any = decodeEventLog({
              abi: ArbitrumBridgeAbi,
              topics: log.topics,
              data: log.data,
            });
            if (event.args.data === '' || event.args.data === '0x') {
              layer2Stats.volumeWithdrawnFromLayer2 = new BigNumber(layer2Stats.volumeWithdrawnFromLayer2)
                .plus(formatBigNumberToString(event.args.value.toString(), 18))
                .toString(10);
            }
          }
        }
      }

      ethereumData.layer2.push(layer2Stats);
    }

    ethereumData.senderAddresses = Object.keys(senderAddresses);

    return ethereumData;
  }

  public async collectDataState(options: RunAdapterOptions): Promise<void> {
    const timestamp = getTimestamp();
    const timestampLast24Hours = timestamp - TimeUnits.SecondsPerDay;
    const timestampLast48Hours = timestamp - TimeUnits.SecondsPerDay * 2;

    const dataCurrent = await this.getEthereumDataState({
      config: options.metricConfig,
      fromTime: timestampLast24Hours,
      toTime: timestamp,
      latestState: true,
    });

    const dataLast24Hours = await this.getEcosystemDataTimeframe({
      config: options.metricConfig,
      fromTime: timestampLast48Hours,
      toTime: timestampLast24Hours,
      latestState: true,
    });

    if (dataCurrent && dataLast24Hours) {
      const stateWithTimeframes: EthereumDataStateWithTimeframe = {
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
    return await this.getEcosystemDataTimeframe({
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

  public async runTest(options: RunAdapterOptions): Promise<void> {
    const timestamp = getTimestamp();
    const data = await this.getEthereumDataState({
      config: options.metricConfig,
      fromTime: timestamp - 60 * 60,
      toTime: timestamp,
      latestState: true,
    });
    console.log(data);
  }
}
