import BigNumber from 'bignumber.js';
import { EthereumEcosystemConfig } from '../../../configs/protocols/ethereum';
import logger from '../../../lib/logger';
import { formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { EthereumMinerStats, EthereumAddressStats } from '../../../types/domains/ecosystem/ethereum';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import envConfig from '../../../configs/envConfig';
import axios from 'axios';

export interface GetChainStatsOptions {
  services: ContextServices;
  storages: ContextStorages;
  ethereumConfig: EthereumEcosystemConfig;
  beginBlock: number;
  endBlock: number;
}

export interface GetChainStatsResult {
  gasLimit: string;
  gasUsed: string;
  totalBeaconWithdrawn: string;
  totalFeesBurnt: string;
  totalFeesPaid: string;
  transactionCount: number;
  transactionTypes: { [key: string]: number };
  senderAddresses: Array<EthereumAddressStats>;
  guzzlerAddresses: Array<EthereumAddressStats>;
  minerAddresses: Array<EthereumMinerStats>;
}

export default class ChainHelper {
  public static async getTransactionReceipts(options: GetChainStatsOptions, blockNumber: number): Promise<any> {
    // we looking from database cache
    const cachingKey = `EthereumBlockWithTxnReceipts-${blockNumber}`;
    const cachingBlock = await options.storages.database.find({
      collection: envConfig.mongodb.collections.cachingData.name,
      query: {
        name: cachingKey,
      },
    });
    if (cachingBlock) {
      return {
        receipts: cachingBlock.receipts,
      };
    }

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
      await options.storages.database.update({
        collection: envConfig.mongodb.collections.cachingData.name,
        keys: {
          name: cachingKey,
        },
        updates: {
          name: cachingKey,
          receipts: response.data.result.receipts,
        },
        upsert: true,
      });

      return response.data.result.receipts;
    }

    return null;
  }

  public static async getChainStats(options: GetChainStatsOptions): Promise<GetChainStatsResult> {
    const { ethereumConfig, beginBlock, endBlock } = options;

    const ethereumData: GetChainStatsResult = {
      gasLimit: '0',
      gasUsed: '0',
      totalBeaconWithdrawn: '0',
      totalFeesBurnt: '0',
      totalFeesPaid: '0',
      transactionCount: 0,
      transactionTypes: {},
      senderAddresses: [],
      guzzlerAddresses: [],
      minerAddresses: [],
    };

    const senderAddresses: { [key: string]: EthereumAddressStats } = {};
    // const guzzlerAddresses: { [key: string]: EthereumAddressStats } = {};
    const minerAddresses: { [key: string]: EthereumMinerStats } = {};
    for (let queryBlock = beginBlock; queryBlock <= endBlock; queryBlock++) {
      // get block and all transaction receipts
      const block = await options.services.blockchain.getBlock(options.ethereumConfig.chain, queryBlock);
      const transactionReceipts = await ChainHelper.getTransactionReceipts(options, queryBlock);

      if (block && transactionReceipts) {
        console.log(block, transactionReceipts);

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
        ethereumData.gasLimit = new BigNumber(ethereumData.gasLimit)
          .plus(new BigNumber(block.gasLimit.toString()))
          .toString(10);
        ethereumData.gasUsed = new BigNumber(ethereumData.gasUsed)
          .plus(new BigNumber(block.gasUsed.toString()))
          .toString(10);

        // count ETH fees burnt
        const feesBurnt = new BigNumber(block.gasUsed.toString())
          .multipliedBy(new BigNumber(block.baseFeePerGas ? block.baseFeePerGas.toString() : '0'))
          .dividedBy(1e18);
        ethereumData.totalFeesBurnt = new BigNumber(ethereumData.totalFeesBurnt).plus(feesBurnt).toString(10);
        ethereumData.transactionCount += block.transactions.length;

        // count beacon withdraw
        if (block.withdrawals) {
          for (const withdrawal of block.withdrawals) {
            ethereumData.totalBeaconWithdrawn = new BigNumber(ethereumData.totalBeaconWithdrawn)
              .plus(formatBigNumberToString(withdrawal.amount.toString(), 9))
              .toString(10);
          }
        }

        for (const transaction of block.transactions) {
          const sender = normalizeAddress(transaction.from);
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

          if (!ethereumData.transactionTypes[transaction.type]) {
            ethereumData.transactionTypes[transaction.type] = 0;
          }
          ethereumData.transactionTypes[transaction.type] += 1;
        }

        for (const receipt of transactionReceipts) {
          const transactionFee = new BigNumber(receipt.gasUsed.toString(), 16)
            .multipliedBy(new BigNumber(receipt.effectiveGasPrice.toString(), 16))
            .dividedBy(1e18);
          const minerEarned = new BigNumber(transactionFee).minus(feesBurnt);

          ethereumData.totalFeesPaid = new BigNumber(ethereumData.totalFeesPaid).plus(transactionFee).toString(10);

          // count ETH earned to minter/validator
          minerAddresses[miner].feesEarned = new BigNumber(minerAddresses[miner].feesEarned)
            .plus(minerEarned)
            .toString(10);
        }

        logger.debug('processed ethereum block data', {
          service: this.name,
          chain: ethereumConfig.chain,
          protocol: ethereumConfig.protocol,
          number: queryBlock,
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
    ethereumData.minerAddresses = Object.values(minerAddresses);

    return ethereumData;
  }
}
