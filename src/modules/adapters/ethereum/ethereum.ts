import { AddressZero, TimeUnits } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import {
  formatBigNumberToString,
  formatLittleEndian64ToString,
  formatTime,
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
  EthereumAddressStats,
  EthereumDataState,
  EthereumDataStateWithTimeframe,
  EthereumDataTimeframe,
  EthereumMinerStats,
} from '../../../types/domains/ecosystem/ethereum';
import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';
import BeaconDepositAbi from '../../../configs/abi/BeaconDeposit.json';
import LsdHelper from './lsdHelper';
import Layer2Helper from './layer2Helper';
import envConfig from '../../../configs/envConfig';

const BeaconDepositEvent = '0x649bbc62d0e31342afea4e5cd82d4049e7e1ee912fc0889aa790803be39038c5';

export default class EthereumAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.ethereum';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  private async getTransactionReceipts(blockNumber: number): Promise<any> {
    // https://docs.alchemy.com/reference/alchemy-gettransactionreceipts
    const response = await axios.post(`https://eth-mainnet.g.alchemy.com/v2/${envConfig.externalConfigs.alchemyKey}`, {
      id: 1,
      jsonrpc: '2.0',
      method: 'alchemy_getTransactionReceipts',
      params: [
        {
          blockNumber: `0x${blockNumber.toString(16)}`,
        },
      ],
    });
    if (response && response.data) {
      return response.data.result.receipts;
    }

    return null;
  }

  public async getEthereumDataState(options: GetAdapterDataTimeframeOptions): Promise<EthereumDataState | null> {
    const ethereumConfig = options.config as EthereumEcosystemConfig;

    if (ethereumConfig.metric !== DataMetrics.ecosystem) {
      return null;
    }

    // query stats from Etherscan
    let etherscanResponse = null;
    const etherscanUrl = `https://api.etherscan.io/api?module=stats&action=ethsupply2&apikey=${ethereumConfig.etherscanApiKey}`;

    logger.debug('get eth supply data from etherscan', {
      service: this.name,
      queryUrl: etherscanUrl,
    });

    do {
      if (ethereumConfig.etherscanApiKey !== '') {
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

    // const beaconStats = await BeaconHelper.getBeaconData({
    //   services: this.services,
    //   ethereumConfig: ethereumConfig,
    // });

    const dataTimeframe = await this.getEcosystemDataTimeframe(options);
    if (dataTimeframe) {
      return {
        ...dataTimeframe,
        totalEthSupply: etherscanResponse
          ? formatBigNumberToString(etherscanResponse.result.EthSupply.toString(), 18)
          : '0',
        totalEthBurnt: etherscanResponse
          ? formatBigNumberToString(etherscanResponse.result.BurntFees.toString(), 18)
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
      ethPrice: ethPrice ? ethPrice : '0',

      totalBeaconDeposited: '0',
      totalBeaconWithdrawn: '0',
      totalFeesBurnt: '0',
      totalFeesPaid: '0',

      totalGasLimit: '0',
      totalGasUsed: '0',

      transactionCount: 0,
      transactionTypes: {},
      senderAddresses: [],
      guzzlerAddresses: [],
      minerAddresses: [],
      beaconDeposits: [],
      layer2: [],
      liquidStaking: [],
    };

    logger.debug('getting ethereum blocks data', {
      service: this.name,
      chain: ethereumConfig.chain,
      protocol: ethereumConfig.protocol,
      total: endBlock - beginBlock,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    const senderAddresses: { [key: string]: EthereumAddressStats } = {};
    const guzzlerAddresses: { [key: string]: EthereumAddressStats } = {};
    const minerAddresses: { [key: string]: EthereumMinerStats } = {};
    for (let queryBlock = beginBlock; queryBlock <= endBlock; queryBlock++) {
      // get block and all transaction receipts
      const block = await this.services.blockchain.getBlock(ethereumConfig.chain, queryBlock);
      const transactionReceipts = await this.getTransactionReceipts(queryBlock);

      if (block && transactionReceipts) {
        const miner = normalizeAddress(block.miner);
        if (!minerAddresses[miner]) {
          minerAddresses[miner] = {
            address: miner,
            producedBlockCount: 0,
            feesEarned: '0',
          };
        }
        minerAddresses[miner].producedBlockCount += 1;

        // count gas
        ethereumData.totalGasLimit = new BigNumber(ethereumData.totalGasLimit)
          .plus(new BigNumber(block.gasLimit.toString()))
          .toString(10);
        ethereumData.totalGasUsed = new BigNumber(ethereumData.totalGasUsed)
          .plus(new BigNumber(block.gasUsed.toString()))
          .toString(10);

        // count ETH fees burnt
        const feesBurnt = new BigNumber(block.gasUsed.toString())
          .multipliedBy(new BigNumber(block.baseFeePerGas ? block.baseFeePerGas.toString() : '0'))
          .dividedBy(1e18);
        ethereumData.totalFeesBurnt = new BigNumber(ethereumData.totalFeesBurnt).plus(feesBurnt).toString(10);

        // count number of transactions
        ethereumData.transactionCount += block.transactions.length;

        // count beacon withdraw
        if (block.withdrawals) {
          for (const withdrawal of block.withdrawals) {
            ethereumData.totalBeaconWithdrawn = new BigNumber(ethereumData.totalBeaconWithdrawn)
              .plus(formatBigNumberToString(withdrawal.amount.toString(), 9))
              .toString(10);
          }
        }

        // count transaction types
        for (const transaction of block.transactions) {
          if (!ethereumData.transactionTypes[transaction.type]) {
            ethereumData.transactionTypes[transaction.type] = 0;
          }
          ethereumData.transactionTypes[transaction.type] += 1;
        }

        // process receipts
        for (const receipt of transactionReceipts) {
          // fees paid and fees burnt
          const transactionFeePaid = new BigNumber(receipt.gasUsed.toString(), 16)
            .multipliedBy(new BigNumber(receipt.effectiveGasPrice.toString(), 16))
            .dividedBy(1e18);
          const transactionFeeBurnt = new BigNumber(receipt.gasUsed.toString(), 16)
            .multipliedBy(block.baseFeePerGas.toString(10))
            .dividedBy(1e18);

          // count transaction fees paid
          ethereumData.totalFeesPaid = new BigNumber(ethereumData.totalFeesPaid).plus(transactionFeePaid).toString(10);

          // count ETH earned to minter/validator
          const minerEarned = new BigNumber(transactionFeePaid).minus(transactionFeeBurnt);
          minerAddresses[miner].feesEarned = new BigNumber(minerAddresses[miner].feesEarned)
            .plus(minerEarned)
            .toString(10);

          // update sender addresses
          const sender = normalizeAddress(receipt.from);
          if (!senderAddresses[sender]) {
            senderAddresses[sender] = {
              address: sender,
              totalGasUsed: '0',
              totalFeesBurnt: '0',
              totalFeesPaid: '0',
              transactionCount: 0,
            };
          }
          senderAddresses[sender].transactionCount += 1;
          senderAddresses[sender].totalGasUsed = new BigNumber(senderAddresses[sender].totalGasUsed)
            .plus(new BigNumber(receipt.gasUsed.toString(), 16))
            .toString(10);
          senderAddresses[sender].totalFeesPaid = new BigNumber(senderAddresses[sender].totalFeesPaid)
            .plus(transactionFeePaid)
            .toString(10);
          senderAddresses[sender].totalFeesBurnt = new BigNumber(senderAddresses[sender].totalFeesBurnt)
            .plus(transactionFeeBurnt)
            .toString(10);

          // update guzzler (contract/address called) addresses
          const guzzler = normalizeAddress(receipt.to ? receipt.to : '');
          if (guzzler !== '') {
            if (!guzzlerAddresses[guzzler]) {
              guzzlerAddresses[guzzler] = {
                address: guzzler,
                totalGasUsed: '0',
                totalFeesBurnt: '0',
                totalFeesPaid: '0',
                transactionCount: 0,
              };
            }
            guzzlerAddresses[guzzler].transactionCount += 1;
            guzzlerAddresses[guzzler].totalGasUsed = new BigNumber(guzzlerAddresses[guzzler].totalGasUsed)
              .plus(new BigNumber(receipt.gasUsed.toString(), 16))
              .toString(10);
            guzzlerAddresses[guzzler].totalFeesPaid = new BigNumber(guzzlerAddresses[guzzler].totalFeesPaid)
              .plus(transactionFeePaid)
              .toString(10);
            guzzlerAddresses[guzzler].totalFeesBurnt = new BigNumber(guzzlerAddresses[guzzler].totalFeesBurnt)
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

              ethereumData.beaconDeposits.push({
                depositor,
                contract,
                amount,
              });

              ethereumData.totalBeaconDeposited = new BigNumber(ethereumData.totalBeaconDeposited)
                .plus(amount)
                .toString(10);

              logger.debug('got beacon deposit event', {
                service: this.name,
                chain: ethereumConfig.chain,
                protocol: ethereumConfig.protocol,
                blockNumber: queryBlock,
                depositor,
                amount,
              });
            }
          }
        }

        logger.debug('processed ethereum block data', {
          service: this.name,
          chain: ethereumConfig.chain,
          protocol: ethereumConfig.protocol,
          number: queryBlock,
          age: formatTime(Number(block.timestamp)),
        });
      } else {
        logger.warn('failed to get ethereum block data', {
          service: this.name,
          chain: ethereumConfig.chain,
          protocol: ethereumConfig.protocol,
          number: queryBlock,
        });
      }
    }

    ethereumData.senderAddresses = Object.values(senderAddresses);
    ethereumData.guzzlerAddresses = Object.values(guzzlerAddresses);
    ethereumData.minerAddresses = Object.values(minerAddresses);

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
