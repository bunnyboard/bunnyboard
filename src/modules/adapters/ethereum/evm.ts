import BigNumber from 'bignumber.js';

import { ChainNames } from '../../../configs/names';
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
      totalGasUsed: '0',
      volumeCoinTransfer: '0',
      volumeCoinWithdrawn: config.chain === ChainNames.ethereum ? '0' : undefined,
      numberOfTransactions: 0,
      numberOfAddresses: 0,
      numberOfDeployedContracts: 0,
      totalCoinBurnt: '0',
      logs: [],
    };

    if (debug) {
      this.executeSession.startSession('start to get blocks data', {
        service: this.name,
        chain: config.chain,
        fromBlock,
        toBlock,
        total: totalBlockWillBeProcessed,
      });
    }

    let runBlock = fromBlock;
    const senders: { [key: string]: boolean } = {};
    const txnDeployContracts: { [key: string]: boolean } = {};
    while (runBlock <= toBlock) {
      const block = await client.getBlock({
        blockNumber: BigInt(runBlock),
        includeTransactions: true,
      });

      if (block) {
        dataTimeframe.numberOfTransactions += block.transactions.length;
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

          if (!transaction.to && transaction.input !== '0x0' && (transaction.input as string) !== '') {
            if (transaction.gasPrice && transaction.gasPrice === 0n) {
              // ignore, layer 2 system transaction
              continue;
            }
            txnDeployContracts[transaction.hash] = true;
          }

          // count coin volume transfer
          dataTimeframe.volumeCoinTransfer = new BigNumber(dataTimeframe.volumeCoinTransfer)
            .plus(new BigNumber(transaction.value.toString()).dividedBy(1e18))
            .toString(10);
        }

        // ETH withdrawals
        if (block.withdrawals && dataTimeframe.volumeCoinWithdrawn) {
          for (const withdrawal of block.withdrawals) {
            dataTimeframe.volumeCoinWithdrawn = new BigNumber(dataTimeframe.volumeCoinWithdrawn)
              .plus(new BigNumber(withdrawal.amount.toString()).dividedBy(1e18))
              .toString(10);
          }
        }
      }

      if (debug) {
        const blockProcessed = runBlock - fromBlock + 1;
        if (blockProcessed % 500 === 0) {
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

    dataTimeframe.numberOfAddresses = Object.keys(senders).length;
    dataTimeframe.numberOfDeployedContracts = Object.keys(txnDeployContracts).length;

    return dataTimeframe;
  }
}
