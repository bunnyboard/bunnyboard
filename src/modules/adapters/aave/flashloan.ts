import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import AaveV2LendingPoolAbi from '../../../configs/abi/aave/LendingPoolV2.json';
import AaveV3LendingPoolAbi from '../../../configs/abi/aave/LendingPoolV3.json';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import { formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { LendingMarketVersions, ProtocolConfig } from '../../../types/configs';
import { FlashloanDataTimeframe, FlashloanReserveData } from '../../../types/domains/flashloan';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions } from '../../../types/options';
import FlashloanProtocolAdapter from '../flashloan';
import { Aavev2FlashloanEventSignature, Aavev3FlashloanEventSignature } from './abis';

export class Aavev2FlashloanAdapter extends FlashloanProtocolAdapter {
  public readonly name: string = 'adapter.aavev2 👻';

  protected abi: any;
  protected flashloanEventSignature: string;

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.abi = AaveV2LendingPoolAbi;
    this.flashloanEventSignature = Aavev2FlashloanEventSignature;
  }

  public async getFlashloanDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<FlashloanDataTimeframe | null> {
    const config = options.config as AaveLendingMarketConfig;

    if (
      config.version !== LendingMarketVersions.cross.aavev2 &&
      config.version !== LendingMarketVersions.cross.aavev3
    ) {
      return null;
    }

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
      if (signature === this.flashloanEventSignature) {
        const event: any = decodeEventLog({
          abi: this.abi,
          topics: log.topics,
          data: log.data,
        });

        transactions[log.transactionHash] = true;

        const token = await this.services.blockchain.getTokenInfo({
          chain: config.chain,
          address: event.args.asset,
        });

        if (token) {
          const tokenPrice = await this.services.oracle.getTokenPriceUsd({
            chain: config.chain,
            address: event.args.asset,
            timestamp: stateTime,
          });

          const executor = normalizeAddress(event.args.target);
          const feesAmount = new BigNumber(formatBigNumberToString(event.args.premium.toString(), token.decimals));
          const amount = new BigNumber(formatBigNumberToString(event.args.amount.toString(), token.decimals));

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

export class Aavev3FlashloanAdapter extends Aavev2FlashloanAdapter {
  public readonly name: string = 'adapter.aavev3 👻';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.abi = AaveV3LendingPoolAbi;
    this.flashloanEventSignature = Aavev3FlashloanEventSignature;
  }
}
