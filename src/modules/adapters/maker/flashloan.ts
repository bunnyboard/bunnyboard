import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import MakerDssFlashAbi from '../../../configs/abi/maker/DssFlash.json';
import { formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { FlashloanConfig, ProtocolConfig } from '../../../types/configs';
import { FlashloanDataTimeframe, FlashloanReserveData } from '../../../types/domains/flashloan';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions } from '../../../types/options';
import FlashloanProtocolAdapter from '../flashloan';
import { MakerEventSignatures } from './abis';

export default class MakerFlashloanAdapter extends FlashloanProtocolAdapter {
  public readonly name: string = 'adapter.maker';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getFlashloanDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<FlashloanDataTimeframe | null> {
    const config = options.config as FlashloanConfig;

    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);
    const stateTime = options.latestState ? options.toTime : options.fromTime;

    const logs = await this.services.blockchain.getContractLogs({
      chain: config.chain,
      address: config.address,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    const data: FlashloanDataTimeframe = {
      timefrom: options.fromTime,
      timeto: options.toTime,
      timestamp: stateTime,
      protocol: config.protocol,
      chain: config.chain,
      metric: config.metric,
      address: normalizeAddress(config.address),
      reserves: [],
      transactions: [],
    };

    const transactions: { [key: string]: boolean } = {};
    const reserves: { [key: string]: FlashloanReserveData } = {};
    for (const log of logs) {
      const signature = log.topics[0];
      if (signature === MakerEventSignatures.Flashloan) {
        const event: any = decodeEventLog({
          abi: MakerDssFlashAbi,
          topics: log.topics,
          data: log.data,
        });

        transactions[log.transactionHash] = true;

        const token = await this.services.blockchain.getTokenInfo({
          chain: config.chain,
          address: event.args.token,
        });
        const tokenPrice = await this.services.oracle.getTokenPriceUsd({
          chain: config.chain,
          address: event.args.token,
          timestamp: stateTime,
        });
        if (token) {
          const feesAmount = new BigNumber(formatBigNumberToString(event.args.fee.toString(), token.decimals));
          const amount = new BigNumber(formatBigNumberToString(event.args.amount.toString(), token.decimals));

          const executor = normalizeAddress(event.args.receiver);

          if (!reserves[token.address]) {
            reserves[token.address] = {
              token: token,
              tokenPrice: tokenPrice ? tokenPrice : '0',
              volume: '0',
              feesPaid: '0',
              executors: {},
            };
          }
          reserves[token.address].volume = new BigNumber(reserves[token.address].volume).plus(amount).toString(10);
          reserves[token.address].feesPaid = new BigNumber(reserves[token.address].feesPaid)
            .plus(feesAmount)
            .toString(10);

          if (!reserves[token.address].executors[executor]) {
            reserves[token.address].executors[executor] = '0';
          }
          reserves[token.address].executors[executor] = new BigNumber(reserves[token.address].executors[executor])
            .plus(amount)
            .toString(10);
        }
      }
    }

    data.reserves = Object.values(reserves);
    data.transactions = Object.keys(transactions);

    return data;
  }
}
