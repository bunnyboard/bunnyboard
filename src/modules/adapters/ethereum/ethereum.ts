import { AddressZero, TimeUnits } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import {
  formatBigNumberToString,
  formatLittleEndian64ToString,
  getTimestamp,
  normalizeAddress,
  sleep,
} from '../../../lib/utils';
import { DataMetrics, MetricConfig, ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions, RunAdapterOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import { EthereumEcosystemConfig } from '../../../configs/protocols/ethereum';
import logger from '../../../lib/logger';
import axios from 'axios';
import {
  EthereumDataState,
  EthereumDataStateWithTimeframe,
  EthereumDataTimeframe,
  EthereumMinerStats,
  EthereumSenderStats,
} from '../../../types/domains/ecosystem/ethereum';
import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';
import BeaconDepositAbi from '../../../configs/abi/BeaconDeposit.json';
import LsdHelper from './lsdHelper';
import Layer2Helper from './layer2Helper';

const BeaconDepositEvent = '0x649bbc62d0e31342afea4e5cd82d4049e7e1ee912fc0889aa790803be39038c5';

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

    do {
      if (ethereumConfig.etherscanApiKey !== '') {
        const etherscanUrl = `https://api.etherscan.io/api?module=stats&action=ethsupply2&apikey=${ethereumConfig.etherscanApiKey}`;
        try {
          etherscanResponse = (await axios.get(etherscanUrl)).data;
        } catch (e: any) {
          logger.warn('failed to query etherscan api, retrying', {
            service: this.name,
            chain: ethereumConfig.chain,
            protocol: ethereumConfig.protocol,
            error: e.message,
          });
        }
      }

      if (etherscanResponse === null) {
        await sleep(5);
      }
    } while (etherscanResponse === null);

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
      minerAddresses: [],
      beaconDeposits: [],
      layer2: [],
      liquidStaking: [],
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

    logger.debug('getting ethereum blocks data', {
      service: this.name,
      chain: ethereumConfig.chain,
      protocol: ethereumConfig.protocol,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    const senderAddresses: { [key: string]: EthereumSenderStats } = {};
    const minerAddresses: { [key: string]: EthereumMinerStats } = {};
    for (let queryBlock = beginBlock; queryBlock <= endBlock; queryBlock++) {
      const block = await client.getBlock({
        blockNumber: BigInt(queryBlock),
        includeTransactions: true,
      });
      if (block) {
        const miner = normalizeAddress(block.miner);
        if (!minerAddresses[miner]) {
          minerAddresses[miner] = {
            address: miner,
            producedBlockCount: 0,
          };
        }
        minerAddresses[miner].producedBlockCount += 1;

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
          const sender = normalizeAddress(transaction.from);
          if (!senderAddresses[sender]) {
            senderAddresses[sender] = {
              address: sender,
              transactionCount: 0,
            };
          }
          senderAddresses[sender].transactionCount += 1;

          if (!ethereumData.transactuonTypes[transaction.type]) {
            ethereumData.transactuonTypes[transaction.type] = 0;
          }
          ethereumData.transactuonTypes[transaction.type] += 1;
        }
      } else {
        logger.warn('failed to get ethereum block data', {
          service: this.name,
          chain: ethereumConfig.chain,
          protocol: ethereumConfig.protocol,
          number: queryBlock,
        });
      }
    }

    // get layer 2 data
    ethereumData.layer2 = await Layer2Helper.getLayer2Data({
      services: this.services,
      ethereumConfig: ethereumConfig,
      beginBlock,
      endBlock,
      stateBlock,
    });

    // get liquid staking data
    ethereumData.liquidStaking = await LsdHelper.getEthereumLsdData({
      services: this.services,
      ethereumConfig: ethereumConfig,
      timestamp: stateTime,
    });

    ethereumData.senderAddresses = Object.values(senderAddresses);
    ethereumData.minerAddresses = Object.values(minerAddresses);

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
