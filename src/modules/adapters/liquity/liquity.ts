import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import BorrowOperationsAbi from '../../../configs/abi/liquity/BorrowOperations.json';
import TroveManagerAbi from '../../../configs/abi/liquity/TroveManager.json';
import { DAY } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { LiquityLendingMarketConfig } from '../../../configs/protocols/liquity';
import logger from '../../../lib/logger';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { formatFromDecimals, getDateString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { LendingActivityAction } from '../../../types/domains/base';
import { LendingActivityEvent, LendingMarketSnapshot } from '../../../types/domains/lending';
import { ContextServices } from '../../../types/namespaces';
import { GetLendingMarketSnapshotOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import { LiquityEventInterfaces, LiquityEventSignatures } from './abis';

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
  }

  protected async getTroveState(
    market: LiquityLendingMarketConfig,
    decodedEvent: any,
    blockNumber: number,
  ): Promise<GetTroveStateInfo> {
    const troveInfo = await this.services.blockchain.readContract({
      chain: market.chain,
      target: market.troveManager,
      abi: TroveManagerAbi,
      method: 'Troves',
      params: [decodedEvent.args._borrower],
      blockNumber: blockNumber - 1,
    });

    const previousDebt = new BigNumber(troveInfo[0]);
    const newDebt = new BigNumber(decodedEvent.args._debt);
    const previousColl = new BigNumber(troveInfo[1]);
    const newColl = new BigNumber(decodedEvent.args._coll);

    return {
      debtAmount: formatFromDecimals(newDebt.minus(previousDebt).abs().toString(10), market.debtToken.decimals),
      collAmount: formatFromDecimals(newColl.minus(previousColl).abs().toString(10), market.collateralToken.decimals),
      isBorrow: previousDebt.lte(newDebt),
    };
  }

  protected async getBorrowingFee(config: LiquityLendingMarketConfig, blockNumber: number): Promise<string> {
    const borrowingFee = await this.services.blockchain.readContract({
      chain: config.chain,
      target: config.troveManager,
      abi: TroveManagerAbi,
      method: 'getBorrowingRate',
      params: [],
      blockNumber: blockNumber,
    });
    return borrowingFee.toString();
  }

  public async getLendingMarketActivities(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingActivityEvent>> {
    const activityEvents: Array<LendingActivityEvent> = [];

    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );
    const blockNumberEndDay = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp + DAY - 1,
    );

    // now we handle event log, turn them to activities
    let logs = await this.services.blockchain.getContractLogs({
      chain: options.config.chain,
      address: options.config.address, // borrow operations
      fromBlock: blockNumber,
      toBlock: blockNumberEndDay,
    });

    const marketConfig = options.config as LiquityLendingMarketConfig;
    const eventSignatures = this.abiConfigs.eventSignatures as LiquityEventInterfaces;
    for (const log of logs) {
      const signature = log.topics[0];
      if (signature === eventSignatures.TroveUpdated || signature === eventSignatures.TroveLiquidated) {
        const event: any = decodeEventLog({
          abi: BorrowOperationsAbi,
          data: log.data,
          topics: log.topics,
        });
        if (signature === eventSignatures.TroveUpdated) {
          const operation = Number(event.args._operation);
          const user = normalizeAddress(event.args._borrower);
          if (operation === 0) {
            // open trove
            const amount = formatFromDecimals(event.args._debt.toString(), marketConfig.debtToken.decimals);
            const collateralAmount = formatFromDecimals(
              event.args._coll.toString(),
              marketConfig.collateralToken.decimals,
            );

            activityEvents.push({
              chain: marketConfig.chain,
              protocol: this.config.protocol,
              address: marketConfig.address,
              transactionHash: log.transactionHash,
              logIndex: log.logIndex.toString(),
              blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
              action: 'borrow',
              user: user,
              token: marketConfig.debtToken,
              tokenAmount: amount,
              collateralAmount: collateralAmount,
              collateralToken: marketConfig.collateralToken,
            });
          } else {
            const info: GetTroveStateInfo = await this.getTroveState(marketConfig, event, blockNumber);
            const action: LendingActivityAction = info.isBorrow ? 'borrow' : 'repay';
            activityEvents.push({
              chain: marketConfig.chain,
              protocol: this.config.protocol,
              address: marketConfig.address,
              transactionHash: log.transactionHash,
              logIndex: log.logIndex.toString(),
              blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
              action: action,
              user: user,
              token: marketConfig.debtToken,
              tokenAmount: info.debtAmount,
              collateralToken: marketConfig.collateralToken,
              collateralAmount: info.collAmount,
            });
          }
        } else if (signature === eventSignatures.TroveLiquidated) {
        }
      }
    }

    return activityEvents;
  }

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot> | null> {
    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );
    const blockNumberEndDay = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp + DAY - 1,
    );

    const eventSignatures = this.abiConfigs.eventSignatures as LiquityEventInterfaces;
    const marketConfig = options.config as LiquityLendingMarketConfig;

    const totalDebt = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: TroveManagerAbi,
      target: marketConfig.troveManager,
      method: 'getEntireSystemDebt',
      params: [],
      blockNumber: blockNumber,
    });
    const totalColl = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: TroveManagerAbi,
      target: marketConfig.troveManager,
      method: 'getEntireSystemColl',
      params: [],
      blockNumber: blockNumber,
    });
    const borrowingFee = await this.getBorrowingFee(marketConfig, blockNumber);

    const logs = await this.services.blockchain.getContractLogs({
      chain: marketConfig.chain,
      address: marketConfig.address, // borrow operations,
      fromBlock: blockNumber,
      toBlock: blockNumberEndDay,
    });

    let totalFeesCollected = new BigNumber(0);

    for (const log of logs) {
      const signature = log.topics[0];
      if (signature === eventSignatures.TroveUpdated) {
        const event: any = decodeEventLog({
          abi: TroveManagerAbi,
          data: log.data,
          topics: log.topics,
        });

        const operation = Number(event.args._operation);
        const borrowingFee = await this.getBorrowingFee(marketConfig, blockNumber);

        if (operation === 0) {
          // open trove
          totalFeesCollected = totalFeesCollected.plus(
            new BigNumber(borrowingFee).multipliedBy(new BigNumber(event.args._debt.toString())).dividedBy(1e18),
          );
        } else {
          // update trove
          // get trove snapshot from previous block
          const info: GetTroveStateInfo = await this.getTroveState(marketConfig, event, blockNumber);
          if (info.isBorrow) {
            totalFeesCollected = totalFeesCollected.plus(
              new BigNumber(borrowingFee).multipliedBy(new BigNumber(info.debtAmount.toString())).dividedBy(1e18),
            );
          }
        }
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

        supplyRate: '0',
        borrowRate: formatFromDecimals(borrowingFee.toString(), 18), // on-time paid

        rewardForLenders: [],
        rewardForBorrowers: [],
      },
    ];
  }
}
