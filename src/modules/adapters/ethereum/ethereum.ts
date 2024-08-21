import {
  formatBigNumberToString,
  formatLittleEndian64ToString,
  formatTime,
  getDateString,
  getStartDayTimestamp,
  getTimestamp,
  getTodayUTCTimestamp,
  normalizeAddress,
} from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions, RunAdapterOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import { EthereumEcosystemConfig } from '../../../configs/protocols/ethereum';
import {
  EthAddressStats,
  EthBlockData,
  EthDataState,
  EthDataTimeframe,
} from '../../../types/domains/ecosystem/ethereum';
import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';
import BeaconDepositAbi from '../../../configs/abi/BeaconDeposit.json';
import envConfig from '../../../configs/envConfig';
import logger from '../../../lib/logger';
import ExecuteSession from '../../../services/executeSession';
import Layer2Helper from './layer2Helper';
import AlchemyLibs from '../../libs/alchemy';
import { AddressZero, TimeUnits } from '../../../configs/constants';
import EtherscanLibs from '../../libs/etherscan';

const BeaconDepositEvent = '0x649bbc62d0e31342afea4e5cd82d4049e7e1ee912fc0889aa790803be39038c5';

export default class EthereumAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.ethereum';

  private executeSession: ExecuteSession;

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.executeSession = new ExecuteSession();
  }

  public async getBlockData(config: EthereumEcosystemConfig, blockNumber: number): Promise<EthBlockData | null> {
    // get block and all transaction receipts
    const block = await this.services.blockchain.getBlock(config.chain, blockNumber);
    const transactionReceipts = await AlchemyLibs.getBlockTransactionReceipts(config.chain, blockNumber);
    if (block && transactionReceipts) {
      const blockData: EthBlockData = {
        chain: config.chain,
        number: blockNumber,
        timestamp: Number(block.timestamp),
        miner: normalizeAddress(block.miner),
        minerEarned: '0',
        beaconDeposited: '0',
        beaconWithdrawn: '0',
        gasLimit: Number(block.gasLimit),
        gasUsed: Number(block.gasUsed),
        totalFeesPaid: '0',
        totalFeesBurnt: '0',
        transactionCount: block.transactions.length,
        transactionTypes: {},
        addressFrom: [],
        addressTo: [],
        beaconDeposits: [],
      };

      // EthBurnt = BlockBaseFeePerGas * GasUsed
      blockData.totalFeesBurnt = new BigNumber(block.baseFeePerGas)
        .multipliedBy(new BigNumber(block.gasUsed.toString()))
        .dividedBy(1e18)
        .toString(10);

      // count beacon withdrawals
      if (block.withdrawals) {
        for (const withdrawal of block.withdrawals) {
          blockData.beaconWithdrawn = new BigNumber(blockData.beaconWithdrawn)
            .plus(formatBigNumberToString(withdrawal.amount.toString(), 9))
            .toString(10);
        }
      }

      // count transaction types
      for (const transaction of block.transactions) {
        if (!blockData.transactionTypes[transaction.type]) {
          blockData.transactionTypes[transaction.type] = 0;
        }
        blockData.transactionTypes[transaction.type] += 1;
      }

      // process receipts
      const addressFrom: { [key: string]: EthAddressStats } = {};
      const addressTo: { [key: string]: EthAddressStats } = {};
      for (const receipt of transactionReceipts) {
        // fees paid and fees burnt
        const transactionFeePaid = new BigNumber(receipt.gasUsed.toString(), 16)
          .multipliedBy(new BigNumber(receipt.effectiveGasPrice.toString(), 16))
          .dividedBy(1e18);
        const transactionFeeBurnt = new BigNumber(receipt.gasUsed.toString(), 16)
          .multipliedBy(block.baseFeePerGas.toString(10))
          .dividedBy(1e18);

        // count transaction fees paid
        blockData.totalFeesPaid = new BigNumber(blockData.totalFeesPaid).plus(transactionFeePaid).toString(10);

        // minerEarned = transactionFeePaid - transactionFeeBurnt
        const minerEarned = new BigNumber(transactionFeePaid).minus(transactionFeeBurnt);
        blockData.minerEarned = new BigNumber(blockData.minerEarned).plus(minerEarned).toString(10);

        // update from addresses
        const sender = normalizeAddress(receipt.from);
        if (!addressFrom[sender]) {
          addressFrom[sender] = {
            address: sender,
            gasUsed: '0',
            feesBurnt: '0',
            feesPaid: '0',
            transactionCount: 0,
          };
        }
        addressFrom[sender].transactionCount += 1;
        addressFrom[sender].gasUsed = new BigNumber(addressFrom[sender].gasUsed)
          .plus(new BigNumber(receipt.gasUsed.toString(), 16))
          .toString(10);
        addressFrom[sender].feesPaid = new BigNumber(addressFrom[sender].feesPaid)
          .plus(transactionFeePaid)
          .toString(10);
        addressFrom[sender].feesBurnt = new BigNumber(addressFrom[sender].feesBurnt)
          .plus(transactionFeeBurnt)
          .toString(10);

        // update to addresses
        const guzzler = normalizeAddress(receipt.to ? receipt.to : '');
        if (guzzler !== '') {
          if (!addressTo[guzzler]) {
            addressTo[guzzler] = {
              address: guzzler,
              gasUsed: '0',
              feesPaid: '0',
              feesBurnt: '0',
              transactionCount: 0,
            };
          }
          addressTo[guzzler].transactionCount += 1;
          addressTo[guzzler].gasUsed = new BigNumber(addressTo[guzzler].gasUsed)
            .plus(new BigNumber(receipt.gasUsed.toString(), 16))
            .toString(10);
          addressTo[guzzler].feesPaid = new BigNumber(addressTo[guzzler].feesPaid)
            .plus(transactionFeePaid)
            .toString(10);
          addressTo[guzzler].feesBurnt = new BigNumber(addressTo[guzzler].feesBurnt)
            .plus(transactionFeeBurnt)
            .toString(10);
        }

        // process transaction logs
        for (const log of receipt.logs) {
          if (log.topics[0] === BeaconDepositEvent) {
            const event: any = decodeEventLog({
              abi: BeaconDepositAbi,
              topics: log.topics,
              data: log.data,
            });

            const depositor = normalizeAddress(receipt.from);
            const contract = receipt.to ? normalizeAddress(receipt.to) : '';
            const amount = formatLittleEndian64ToString(event.args.amount.toString());

            blockData.beaconDeposits.push({
              depositor,
              contract,
              amount,
            });

            // count beacon deposit total ETH
            blockData.beaconDeposited = new BigNumber(blockData.beaconDeposited).plus(amount).toString(10);
          }
        }
      }

      blockData.addressFrom = Object.values(addressFrom);
      blockData.addressTo = Object.values(addressTo);

      return blockData;
    }

    return null;
  }

  public async getDataTimeframe(options: GetAdapterDataTimeframeOptions): Promise<EthDataTimeframe | null> {
    const ethereumConfig = options.config as EthereumEcosystemConfig;
    const stateTime = options.latestState ? options.toTime : options.fromTime;
    const blockNumber = await this.services.blockchain.tryGetBlockNumberAtTimestamp(ethereumConfig.chain, stateTime);
    const ethPrice = await this.services.oracle.getTokenPriceUsd({
      chain: ethereumConfig.chain,
      address: AddressZero,
      timestamp: stateTime,
    });
    return {
      chain: ethereumConfig.chain,
      protocol: ethereumConfig.protocol,
      timestamp: stateTime,
      metric: ethereumConfig.metric,
      ethPrice: ethPrice ? ethPrice : '0',
      layer2Stats: await Layer2Helper.getLayer2Data({
        services: this.services,
        ethereumConfig: options.config as EthereumEcosystemConfig,
        blockNumber: blockNumber,
      }),
    };
  }

  public async getDataState(ethereumConfig: EthereumEcosystemConfig): Promise<EthDataState | null> {
    const timestamp = getTimestamp();

    const ethDataTimeframe = await this.getDataTimeframe({
      config: ethereumConfig,
      fromTime: timestamp,
      toTime: timestamp,
      latestState: true,
    });

    if (ethDataTimeframe) {
      return {
        ...ethDataTimeframe,
        supplyStats: await EtherscanLibs.getEthSupply(),
      };
    }

    return null;
  }

  public async run(options: RunAdapterOptions): Promise<void> {
    if (options.service === undefined || options.service === 'state') {
      // update data states
      await this.updateLatestState(options);
    }

    if (options.service === undefined || options.service === 'snapshot') {
      // sync all blocks
      await this.syncBlocks(options);

      // update snapshots
      await this.updateSnapshots(options);
    }
  }

  protected async syncBlocks(options: RunAdapterOptions): Promise<void> {
    const ethereumConfig = options.metricConfig as EthereumEcosystemConfig;

    const startTime = options.fromTime ? options.fromTime : ethereumConfig.birthday;

    // sync blocks data
    let startBlock = ethereumConfig.birthblock ? ethereumConfig.birthblock : 0;
    if (startBlock === 0) {
      startBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(ethereumConfig.chain, startTime);
    }

    if (!options.force) {
      // find the latest block from database
      const latestBlock = (
        await this.storages.database.query({
          collection: envConfig.mongodb.collections.ethereumBlocks.name,
          query: {
            chain: ethereumConfig.chain,
          },
          options: {
            limit: 1,
            skip: 0,
            order: { number: -1 },
          },
        })
      )[0];
      if (latestBlock && latestBlock.number > startBlock) {
        startBlock = latestBlock.number;
      }
    }

    const latestBlockNumber = await this.services.blockchain.getLastestBlockNumber(ethereumConfig.chain);

    logger.info('start sync ethereum blocks data', {
      service: this.name,
      chain: ethereumConfig.chain,
      fromBlock: startBlock,
      toBlock: latestBlockNumber,
    });

    while (startBlock <= latestBlockNumber) {
      this.executeSession.startSessionMuted();

      const blockData = await this.getBlockData(ethereumConfig, startBlock);
      if (blockData) {
        await this.storages.database.update({
          collection: envConfig.mongodb.collections.ethereumBlocks.name,
          keys: {
            chain: ethereumConfig.chain,
            number: blockData.number,
            timestamp: blockData.timestamp,
          },
          updates: {
            ...blockData,
          },
          upsert: true,
        });
        this.executeSession.endSession('got ethereum block data', {
          service: this.name,
          chain: ethereumConfig.chain,
          number: startBlock,
          age: formatTime(blockData.timestamp),
        });
      } else {
        logger.error('failed to get ethereum block data', {
          service: this.name,
          chain: ethereumConfig.chain,
          number: startBlock,
        });
      }

      startBlock += 1;
    }
  }

  protected async updateLatestState(options: RunAdapterOptions): Promise<void> {
    const ethereumConfig = options.metricConfig as EthereumEcosystemConfig;
    this.executeSession.startSession('start to update ethereum state data', {
      service: this.name,
      protocol: ethereumConfig.protocol,
      chain: ethereumConfig.chain,
      metric: ethereumConfig.metric,
    });
    const dataState = await this.getDataState(ethereumConfig);
    await this.storages.database.update({
      collection: envConfig.mongodb.collections.ecosystemDataStates.name,
      keys: {
        protocol: ethereumConfig.protocol,
        chain: ethereumConfig.chain,
      },
      updates: {
        ...dataState,
      },
      upsert: true,
    });
    this.executeSession.endSession('updated ethereum state data', {
      service: this.name,
      protocol: ethereumConfig.protocol,
      chain: ethereumConfig.chain,
      metric: ethereumConfig.metric,
    });
  }

  protected async updateSnapshots(options: RunAdapterOptions): Promise<void> {
    const ethereumConfig = options.metricConfig as EthereumEcosystemConfig;
    let startTime = options.fromTime ? options.fromTime : ethereumConfig.birthday;
    if (!options.force) {
      const latestSnapshot = (
        await this.storages.database.query({
          collection: envConfig.mongodb.collections.ecosystemDataSnapshots.name,
          query: {
            protocol: ethereumConfig.protocol,
            chain: ethereumConfig.chain,
          },
          options: {
            limit: 1,
            skip: 0,
            order: { timestamp: -1 },
          },
        })
      )[0];
      if (latestSnapshot && latestSnapshot.timestamp > startTime) {
        startTime = latestSnapshot.timestamp;
      }
    }

    const todayTimestamp = getTodayUTCTimestamp();

    // make sure it is a start day timestamp at 00:00 UTC
    startTime = getStartDayTimestamp(startTime);

    logger.info('updating ethereum data snapshots', {
      service: this.name,
      protocol: ethereumConfig.protocol,
      chain: ethereumConfig.chain,
      metric: ethereumConfig.metric,
      fromDate: getDateString(startTime),
      toDate: getDateString(todayTimestamp),
    });

    while (startTime <= todayTimestamp) {
      this.executeSession.startSessionMuted();
      const dataTimeframe = await this.getDataTimeframe({
        config: ethereumConfig,
        fromTime: startTime,
        toTime: startTime + TimeUnits.SecondsPerDay - 1,
        latestState: false,
      });
      if (dataTimeframe) {
        await this.storages.database.update({
          collection: envConfig.mongodb.collections.ecosystemDataSnapshots.name,
          keys: {
            protocol: dataTimeframe.protocol,
            chain: dataTimeframe.chain,
            timestamp: dataTimeframe.timestamp,
          },
          updates: {
            ...dataTimeframe,
          },
          upsert: true,
        });
      }
      this.executeSession.endSession('updated ethereum data snapshot', {
        service: this.name,
        protocol: ethereumConfig.protocol,
        chain: ethereumConfig.chain,
        metric: ethereumConfig.metric,
        date: getDateString(startTime),
      });

      startTime += TimeUnits.SecondsPerDay;
    }
  }

  public async runTest(options: RunAdapterOptions): Promise<void> {
    const blockNumber = 20555719;
    const blockData = await this.getBlockData(options.metricConfig as EthereumEcosystemConfig, blockNumber);
    console.log(blockData);

    const dataState = await this.getDataState(options.metricConfig as EthereumEcosystemConfig);
    console.log(dataState);
  }
}
