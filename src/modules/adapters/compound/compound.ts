import BigNumber from 'bignumber.js';

import cErc20Abi from '../../../configs/abi/compound/cErc20.json';
import { ChainBlockPeriods, YEAR } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { CompoundLendingMarketConfig } from '../../../configs/protocols/compound';
import logger from '../../../lib/logger';
import { queryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { formatFromDecimals, getDateString, normalizeAddress } from '../../../lib/utils';
import { LendingMarketConfig, ProtocolConfig } from '../../../types/configs';
import { LendingMarketSnapshot } from '../../../types/domains';
import { ContextServices } from '../../../types/namespaces';
import { GetLendingMarketSnapshotOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import { CompoundEventAbiMappings, CompoundEventInterfaces, CompoundEventSignatures } from './abis';

export interface CompoundMarketRates {
  borrowRate: string;
  supplyRate: string;
}

export default class CompoundAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.compound';

  protected readonly eventSignatures: CompoundEventInterfaces;
  protected readonly eventAbiMappings: { [key: string]: Array<any> };

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.eventSignatures = CompoundEventSignatures;
    this.eventAbiMappings = CompoundEventAbiMappings;
  }

  protected async getMarketRates(config: LendingMarketConfig, blockNumber: number): Promise<CompoundMarketRates> {
    const supplyRatePerBlock = await this.services.blockchain.singlecall({
      chain: config.chain,
      abi: cErc20Abi,
      target: config.address,
      method: 'supplyRatePerBlock',
      params: [],
      blockNumber,
    });
    const borrowRatePerBlock = await this.services.blockchain.singlecall({
      chain: config.chain,
      abi: cErc20Abi,
      target: config.address,
      method: 'borrowRatePerBlock',
      params: [],
      blockNumber,
    });

    const supplyRate = new BigNumber(supplyRatePerBlock ? supplyRatePerBlock : '0').multipliedBy(
      Math.floor(YEAR / ChainBlockPeriods[config.chain]),
    );
    const borrowRate = new BigNumber(borrowRatePerBlock).multipliedBy(
      Math.floor(YEAR / ChainBlockPeriods[config.chain]),
    );

    return {
      supplyRate: formatFromDecimals(supplyRate.toString(10), 18),
      borrowRate: formatFromDecimals(borrowRate.toString(10), 18),
    };
  }

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot> | null> {
    const marketConfig = options.config as CompoundLendingMarketConfig;

    const blockNumber = await queryBlockNumberAtTimestamp(
      EnvConfig.blockchains[marketConfig.chain].blockSubgraph,
      options.timestamp,
    );
    if (blockNumber === 0) {
      return null;
    }

    const snapshots: Array<LendingMarketSnapshot> = [];

    const totalCash = await this.services.blockchain.singlecall({
      chain: marketConfig.chain,
      abi: cErc20Abi,
      target: marketConfig.address,
      method: 'getCash',
      params: [],
      blockNumber,
    });
    const totalBorrows = await this.services.blockchain.singlecall({
      chain: marketConfig.chain,
      abi: cErc20Abi,
      target: marketConfig.address,
      method: 'totalBorrows',
      params: [],
      blockNumber,
    });
    const totalReserves = await this.services.blockchain.singlecall({
      chain: marketConfig.chain,
      abi: cErc20Abi,
      target: marketConfig.address,
      method: 'totalReserves',
      params: [],
      blockNumber,
    });

    // get market rates
    const { supplyRate, borrowRate } = await this.getMarketRates(options.config, blockNumber);

    const totalDeposited = new BigNumber(totalCash.toString())
      .plus(new BigNumber(totalBorrows.toString()))
      .minus(new BigNumber(totalReserves.toString()));
    const totalBorrowed = new BigNumber(totalBorrows.toString());

    const token = (options.config as CompoundLendingMarketConfig).underlying;
    const tokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: token.chain,
      address: token.address,
      timestamp: options.timestamp,
    });

    let feesCollected = new BigNumber(0);
    let volumeDeposited = new BigNumber(0);
    let volumeWithdrawn = new BigNumber(0);
    let volumeBorrowed = new BigNumber(0);
    let volumeRepaid = new BigNumber(0);
    let volumeLiquidated = new BigNumber(0);
    let countAddresses = 0;
    let countTransactions = 0;

    const web3 = this.services.blockchain.getProvider(options.config.chain);
    const logs: Array<any> = await this.getDayContractLogs({
      chain: options.config.chain,
      address: options.config.address,
      topics: Object.values(this.eventSignatures),
      dayStartTimestamp: options.timestamp,
    });

    const addresses: { [key: string]: boolean } = {};
    const transactions: { [key: string]: boolean } = {};
    for (const log of logs) {
      if (!transactions[log.transactionHash]) {
        transactions[log.transactionHash] = true;
        countTransactions += 1;
      }

      const signature = log.topics[0];
      const event = web3.eth.abi.decodeLog(this.eventAbiMappings[signature], log.data, log.topics.slice(1));
      switch (signature) {
        case this.eventSignatures.AccrueInterest:
        case this.eventSignatures.AccrueInterestEther: {
          feesCollected = feesCollected.plus(new BigNumber(event.interestAccumulated.toString()));
          break;
        }

        case this.eventSignatures.Mint: {
          volumeDeposited = volumeDeposited.plus(new BigNumber(event[1].toString()));
          break;
        }
        case this.eventSignatures.Redeem: {
          volumeWithdrawn = volumeDeposited.plus(new BigNumber(event[1].toString()));
          break;
        }
        case this.eventSignatures.Borrow: {
          volumeBorrowed = volumeDeposited.plus(new BigNumber(event[1].toString()));
          break;
        }
        case this.eventSignatures.Repay: {
          volumeRepaid = volumeDeposited.plus(new BigNumber(event[2].toString()));
          break;
        }
        case this.eventSignatures.Liquidate: {
          volumeLiquidated = volumeDeposited.plus(new BigNumber(event[2].toString()));
          break;
        }
      }

      if (signature !== this.eventSignatures.AccrueInterest && signature !== this.eventSignatures.AccrueInterestEther) {
        const address = normalizeAddress(event[0]);
        if (!addresses[address]) {
          addresses[address] = true;
          countAddresses += 1;
        }
      }
    }

    snapshots.push({
      marketId: `${marketConfig.protocol}-${marketConfig.chain}-${normalizeAddress(
        marketConfig.address,
      )}-${normalizeAddress(token.address)}`,

      chain: marketConfig.chain,
      protocol: marketConfig.protocol,
      address: normalizeAddress(marketConfig.address),
      timestamp: options.timestamp,

      token: token,
      tokenPrice: tokenPrice ? tokenPrice : '0',

      totalDeposited: formatFromDecimals(totalDeposited.toString(10), token.decimals),
      totalBorrowed: formatFromDecimals(totalBorrowed.toString(10), token.decimals),
      totalFeesCollected: formatFromDecimals(feesCollected.toString(10), token.decimals),

      volumeDeposited: formatFromDecimals(volumeDeposited.toString(10), token.decimals),
      volumeWithdrawn: formatFromDecimals(volumeWithdrawn.toString(10), token.decimals),
      volumeBorrowed: formatFromDecimals(volumeBorrowed.toString(10), token.decimals),
      volumeRepaid: formatFromDecimals(volumeRepaid.toString(10), token.decimals),
      volumeLiquidated: formatFromDecimals(volumeLiquidated.toString(10), token.decimals),

      countAddresses: countAddresses,
      countTransactions: countTransactions,

      supplyRate: supplyRate,
      borrowRate: borrowRate,
    });

    logger.info('got lending market snapshot', {
      service: this.name,
      protocol: this.config.protocol,
      chain: marketConfig.chain,
      version: marketConfig.version,
      token: `${token.symbol}:${token.address}`,
      date: getDateString(options.timestamp),
    });

    return snapshots;
  }
}
