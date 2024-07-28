import BigNumber from 'bignumber.js';
import { EthereumEcosystemConfig } from '../../../configs/protocols/ethereum';
import logger from '../../../lib/logger';
import { formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { EthereumMinerStats, EthereumSenderStats } from '../../../types/domains/ecosystem/ethereum';
import { ContextServices } from '../../../types/namespaces';

export interface GetChainStatsOptions {
  services: ContextServices;
  ethereumConfig: EthereumEcosystemConfig;
  beginBlock: number;
  endBlock: number;
}

export interface GetChainStatsResult {
  gasLimit: string;
  gasUsed: string;
  volumeCoinWithdrawn: string;
  volumeCoinBurnt: string;
  transactionCount: number;
  transactuonTypes: { [key: string]: number };
  senderAddresses: Array<EthereumSenderStats>;
  minerAddresses: Array<EthereumMinerStats>;
}

export default class ChainHelper {
  public static async getChainStats(options: GetChainStatsOptions): Promise<GetChainStatsResult> {
    const { services, ethereumConfig, beginBlock, endBlock } = options;

    const ethereumData: GetChainStatsResult = {
      gasLimit: '0',
      gasUsed: '0',
      volumeCoinWithdrawn: '0',
      volumeCoinBurnt: '0',
      transactionCount: 0,
      transactuonTypes: {},
      senderAddresses: [],
      minerAddresses: [],
    };

    const client = services.blockchain.getPublicClient(ethereumConfig.chain);

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
