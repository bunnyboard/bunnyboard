import BigNumber from 'bignumber.js';

import { normalizeAddress } from '../../../lib/utils';
import { ChainBoardDataTimeframe } from '../../../types/domains/chainBoard';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import ChainBoardAdapter, { ChainBoardGetDataTimeframeOptions } from '../chainBoard';

export default class EvmChainAdapter extends ChainBoardAdapter {
  public readonly name: string = 'adapter.evm';

  constructor(services: ContextServices, storages: ContextStorages) {
    super(services, storages);
  }

  public async getDataTimeframe(options: ChainBoardGetDataTimeframeOptions): Promise<ChainBoardDataTimeframe | null> {
    const { config, fromTime, toTime, debug } = options;

    const client = this.services.blockchain.getPublicClient(config.chain);

    const fromBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(config.chain, fromTime);
    const toBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(config.chain, toTime);
    const totalBlockWillBeProcessed = toBlock - fromBlock + 1;

    const dataTimeframe: ChainBoardDataTimeframe = {
      chain: config.chain,
      timestamp: fromTime,
      fromBlock: fromBlock,
      toBlock: toBlock,
      totalGasLimit: '0',
      totalGasUsed: '0',
      volumeCoinTransfer: '0',
      averageBlockSize: '0',
      numberOfTransactions: 0,
      numberOfAddresses: 0,
      numberOfDeployedContracts: 0,
      totalCoinBurnt: '0',
      logs: [],
    };

    let runBlock = fromBlock;
    let totalBlockSize = 0n;
    const senders: { [key: string]: boolean } = {};

    if (debug) {
      this.executeSession.startSession('start to get blocks data', {
        service: this.name,
        chain: config.chain,
        fromBlock,
        toBlock,
        total: totalBlockWillBeProcessed,
      });
    }
    while (runBlock <= toBlock) {
      const block = await client.getBlock({
        blockNumber: BigInt(runBlock),
        includeTransactions: true,
      });

      if (block) {
        totalBlockSize += block.size;

        dataTimeframe.numberOfTransactions += block.transactions.length;
        dataTimeframe.totalGasLimit = new BigNumber(dataTimeframe.totalGasLimit)
          .plus(block.gasLimit.toString())
          .toString(10);
        dataTimeframe.totalGasUsed = new BigNumber(dataTimeframe.totalGasUsed)
          .plus(block.gasUsed.toString())
          .toString(10);

        // count coin were burnt if any
        // coin burnt = baseFeePerGas * gasUsed
        if (block.baseFeePerGas) {
          dataTimeframe.totalCoinBurnt = new BigNumber(dataTimeframe.totalCoinBurnt)
            .plus(new BigNumber(block.baseFeePerGas.toString()).multipliedBy(block.gasUsed.toString()).dividedBy(1e18))
            .toString(10);
        }

        for (const transaction of block.transactions) {
          // count unique sender addresses
          const sender = normalizeAddress(transaction.from);
          if (!senders[sender]) {
            senders[sender] = true;
          }

          // count coin volume transfer
          dataTimeframe.volumeCoinTransfer = new BigNumber(dataTimeframe.volumeCoinTransfer)
            .plus(new BigNumber(transaction.value.toString()).dividedBy(1e18))
            .toString(10);
        }
      }

      if (debug) {
        const blockProcessed = runBlock - fromBlock + 1;
        if (blockProcessed % 10 === 0) {
          this.executeSession.endSession('get and processed blocks data', {
            service: this.name,
            chain: config.chain,
            toBlock: runBlock,
            percentage: `${((blockProcessed / totalBlockWillBeProcessed) * 100).toFixed(0)}%`,
          });

          // restart execute session
          this.executeSession.startSessionMuted();
        }
      }

      runBlock += 1;
    }

    dataTimeframe.averageBlockSize = new BigNumber(totalBlockSize.toString())
      .dividedBy(toBlock - fromBlock + 1)
      .toString(10);

    return dataTimeframe;
  }
}
