import BigNumber from 'bignumber.js';

import TroveManagerAbi from '../../../configs/abi/liquity/TroveManager.json';
import EnvConfig from '../../../configs/envConfig';
import { LiquityLendingMarketConfig } from '../../../configs/protocols/liquity';
import logger from '../../../lib/logger';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { formatFromDecimals, getDateString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { LendingCdpSnapshot, LendingMarketSnapshot } from '../../../types/domains';
import { ContextServices } from '../../../types/namespaces';
import { GetLendingMarketSnapshotOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import { LiquityEventAbiMappings, LiquityEventInterfaces, LiquityEventSignatures } from './abis';

interface GetTroveStateInfo {
  debtAmount: string;
  collAmount: string;
  isBorrow: boolean;
}

export default class LiquityAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.liquity';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = LiquityEventSignatures;
    this.abiConfigs.eventAbiMappings = LiquityEventAbiMappings;
  }

  protected async getTroveState(
    market: LiquityLendingMarketConfig,
    decodedEvent: any,
    blockNumber: number,
  ): Promise<GetTroveStateInfo> {
    const troveInfo = await this.services.blockchain.singlecall({
      chain: market.chain,
      target: market.troveManager,
      abi: TroveManagerAbi,
      method: 'Troves',
      params: [decodedEvent._borrower],
      blockNumber: blockNumber - 1,
    });

    const previousDebt = new BigNumber(troveInfo.debt);
    const newDebt = new BigNumber(decodedEvent._debt);
    const previousColl = new BigNumber(troveInfo.coll);
    const newColl = new BigNumber(decodedEvent._coll);

    return {
      debtAmount: newDebt.minus(previousDebt).abs().dividedBy(1e18).toString(10),
      collAmount: newColl.minus(previousColl).abs().dividedBy(1e18).toString(10),
      isBorrow: previousDebt.lte(newDebt),
    };
  }

  protected async getBorrowingFee(config: LiquityLendingMarketConfig, blockNumber: number): Promise<string> {
    const borrowingFee = await this.services.blockchain.singlecall({
      chain: config.chain,
      target: config.troveManager,
      abi: TroveManagerAbi,
      method: 'getBorrowingFee',
      params: [],
      blockNumber: blockNumber,
    });
    return borrowingFee.toString();
  }

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot | LendingCdpSnapshot> | null> {
    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );

    const web3 = this.services.blockchain.getProvider(options.config.chain);
    const eventSignatures = this.abiConfigs.eventSignatures as LiquityEventInterfaces;
    const marketConfig = options.config as LiquityLendingMarketConfig;

    const totalDebt = await this.services.blockchain.singlecall({
      chain: marketConfig.chain,
      abi: TroveManagerAbi,
      target: marketConfig.troveManager,
      method: 'getEntireSystemDebt',
      params: [],
      blockNumber: blockNumber,
    });
    const totalColl = await this.services.blockchain.singlecall({
      chain: marketConfig.chain,
      abi: TroveManagerAbi,
      target: marketConfig.troveManager,
      method: 'getEntireSystemColl',
      params: [],
      blockNumber: blockNumber,
    });
    const borrowingFee = await this.services.blockchain.singlecall({
      chain: marketConfig.chain,
      abi: TroveManagerAbi,
      target: marketConfig.troveManager,
      method: 'getBorrowingFee',
      params: [],
      blockNumber: blockNumber,
    });

    const logs = await this.getDayContractLogs({
      chain: marketConfig.chain,
      address: marketConfig.address, // borrow operations,
      topics: Object.values(this.abiConfigs.eventSignatures),
      dayStartTimestamp: options.timestamp,
    });

    let volumeBorrowed = new BigNumber(0);
    let volumeRepaid = new BigNumber(0);
    let volumeDeposited = new BigNumber(0);
    let volumeWithdrawn = new BigNumber(0);
    let volumeLiquidated = new BigNumber(0);
    let totalFeesCollected = new BigNumber(0);

    const transactions: { [key: string]: boolean } = {};
    const borrowers: { [key: string]: boolean } = {};
    for (const log of logs) {
      if (!transactions[log.transactionHash]) {
        transactions[log.transactionHash] = true;
      }

      const signature = log.topics[0];
      const event = web3.eth.abi.decodeLog(this.abiConfigs.eventAbiMappings[signature], log.data, log.topics.slice(1));

      // save borrower address
      const borrower = normalizeAddress(event._borrower);
      if (!borrowers[borrower]) {
        borrowers[borrower] = true;
        await this.booker.saveAddressBookLending({
          addressId: `${marketConfig.chain}-${normalizeAddress(marketConfig.address)}-${marketConfig.protocol}-${
            marketConfig.address
          }-${marketConfig.debtToken.address}-${marketConfig.collateralToken.address}-borrower`,
          chain: marketConfig.chain,
          protocol: this.config.protocol,
          role: 'borrower',
          address: borrower,
          firstTime: options.timestamp,
          marketAddress: normalizeAddress(marketConfig.address),
          tokenAddress: normalizeAddress(marketConfig.debtToken.address),
        });
      }

      if (signature === eventSignatures.TroveUpdated) {
        const operation = Number(event._operation);
        const borrowingFee = await this.getBorrowingFee(marketConfig, blockNumber);

        if (operation === 0) {
          // open trove
          volumeBorrowed = volumeBorrowed.plus(new BigNumber(event._debt.toString()));
          volumeDeposited = volumeDeposited.plus(new BigNumber(event._coll.toString()));
          totalFeesCollected = totalFeesCollected.plus(
            new BigNumber(borrowingFee).multipliedBy(new BigNumber(event._debt.toString())).dividedBy(1e18),
          );
        } else if (operation === 1) {
          // close trove
          volumeRepaid = volumeRepaid.plus(new BigNumber(event._debt.toString()));
          volumeWithdrawn = volumeWithdrawn.plus(new BigNumber(event._coll.toString()));
          totalFeesCollected = totalFeesCollected.plus(
            new BigNumber(borrowingFee).multipliedBy(new BigNumber(event._debt.toString())).dividedBy(1e18),
          );
        } else {
          // update trove
          // get trove snapshot from previous block
          const info: GetTroveStateInfo = await this.getTroveState(marketConfig, event, blockNumber);
          totalFeesCollected = totalFeesCollected.plus(
            new BigNumber(borrowingFee).multipliedBy(new BigNumber(info.debtAmount.toString())).dividedBy(1e18),
          );
          if (info.isBorrow) {
            volumeBorrowed = volumeBorrowed.plus(new BigNumber(info.debtAmount));
            volumeDeposited = volumeDeposited.plus(new BigNumber(info.collAmount));
          } else {
            volumeRepaid = volumeRepaid.plus(new BigNumber(info.debtAmount));
            volumeWithdrawn = volumeWithdrawn.plus(new BigNumber(info.collAmount));
          }
        }
      } else if (signature === eventSignatures.TroveLiquidated) {
        volumeRepaid = volumeRepaid.plus(new BigNumber(event._debt.toString()));
        volumeLiquidated = volumeLiquidated.plus(new BigNumber(event._coll.toString()));
      }
    }

    const debtTokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: marketConfig.chain,
      address: marketConfig.debtToken.address,
      timestamp: options.timestamp,
    });
    const collateralTokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: marketConfig.chain,
      address: marketConfig.collateralToken.address,
      timestamp: options.timestamp,
    });

    logger.info('updated lending market snapshot', {
      service: this.name,
      protocol: this.config.protocol,
      chain: marketConfig.chain,
      version: marketConfig.version,
      debt: `${marketConfig.debtToken.symbol}`,
      collateral: `${marketConfig.collateralToken.symbol}`,
      date: getDateString(options.timestamp),
    });

    return [
      {
        marketId: `${marketConfig.protocol}-${marketConfig.chain}-${normalizeAddress(
          marketConfig.address,
        )}-${normalizeAddress(marketConfig.debtToken.address)}-${normalizeAddress(
          marketConfig.collateralToken.address,
        )}`,

        type: marketConfig.type,
        chain: marketConfig.chain,
        protocol: marketConfig.protocol,
        address: normalizeAddress(marketConfig.address),
        timestamp: options.timestamp,

        token: marketConfig.debtToken,
        tokenPrice: debtTokenPrice ? debtTokenPrice : '0',
        collateralToken: marketConfig.collateralToken,
        collateralTokenPrice: collateralTokenPrice ? collateralTokenPrice : '0',

        totalDeposited: formatFromDecimals(totalColl.toString(), marketConfig.collateralToken.decimals),
        totalBorrowed: formatFromDecimals(totalDebt.toString(), marketConfig.debtToken.decimals),
        totalFeesCollected: formatFromDecimals(totalFeesCollected.toString(10), marketConfig.debtToken.decimals),

        volumeDeposited: formatFromDecimals(volumeDeposited.toString(10), marketConfig.collateralToken.decimals),
        volumeWithdrawn: formatFromDecimals(volumeWithdrawn.toString(10), marketConfig.collateralToken.decimals),
        volumeBorrowed: formatFromDecimals(volumeBorrowed.toString(10), marketConfig.debtToken.decimals),
        volumeRepaid: formatFromDecimals(volumeRepaid.toString(10), marketConfig.debtToken.decimals),
        volumeLiquidated: formatFromDecimals(volumeLiquidated.toString(10), marketConfig.collateralToken.decimals),

        addressCount: {
          borrowers: Object.keys(borrowers).length,
        },

        transactionCount: Object.keys(transactions).length,

        supplyRate: '0',
        borrowRate: formatFromDecimals(borrowingFee.toString(), 18), // on-time paid

        tokenRewardsForLenders: [],
        tokenRewardsForBorrowers: [],
      },
    ];
  }
}
