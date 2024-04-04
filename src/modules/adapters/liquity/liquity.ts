import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import BorrowOperationsAbi from '../../../configs/abi/liquity/BorrowOperations.json';
import TroveManagerAbi from '../../../configs/abi/liquity/TroveManager.json';
import { LiquityLendingMarketConfig, LiquityTrove } from '../../../configs/protocols/liquity';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ActivityAction, ActivityActions } from '../../../types/base';
import {
  CdpLendingActivityEvent,
  CdpLendingAssetDataState,
  CdpLendingAssetDataTimeframe,
} from '../../../types/cdpLending';
import { ProtocolConfig, Token } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import {
  GetAdapterDataStateOptions,
  GetAdapterDataTimeframeOptions,
  TransformEventLogOptions,
  TransformEventLogResult,
} from '../../../types/options';
import { AdapterGetEventLogsOptions } from '../adapter';
import CdpLendingProtocolAdapter from '../cdpLending';
import { LiquityEventInterfaces, LiquityEventSignatures } from './abis';

interface GetTroveStateInfo {
  debtAmount: string;
  collAmount: string;
  isBorrow: boolean;
}

export default class LiquityAdapter extends CdpLendingProtocolAdapter {
  public readonly name: string = 'adapter.liquity';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.abiConfigs.eventSignatures = LiquityEventSignatures;
    this.abiConfigs.eventAbis = {
      borrowOperation: BorrowOperationsAbi,
      troveManager: TroveManagerAbi,
    };
  }

  protected async getTroveState(
    chain: string,
    troveManager: string,
    decodedEvent: any,
    blockNumber: number,
  ): Promise<GetTroveStateInfo> {
    const troveInfo = await this.services.blockchain.readContract({
      chain: chain,
      target: troveManager,
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
      debtAmount: newDebt.minus(previousDebt).abs().toString(10),
      collAmount: newColl.minus(previousColl).abs().toString(10),
      isBorrow: previousDebt.lte(newDebt),
    };
  }

  protected async getBorrowingFee(chain: string, troveManager: string, blockNumber: number): Promise<string> {
    const borrowingFee = await this.services.blockchain.readContract({
      chain: chain,
      target: troveManager,
      abi: TroveManagerAbi,
      method: 'getBorrowingRate',
      params: [],
      blockNumber: blockNumber,
    });
    return borrowingFee.toString();
  }

  public async getLendingAssetDataState(options: GetAdapterDataStateOptions): Promise<CdpLendingAssetDataState | null> {
    const blockNumber = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.timestamp,
    );

    const marketConfig: LiquityLendingMarketConfig = options.config as LiquityLendingMarketConfig;
    const debtToken = marketConfig.debtToken as Token;
    const debtTokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: debtToken.chain,
      address: debtToken.address,
      timestamp: options.timestamp,
    });

    const assetState: CdpLendingAssetDataState = {
      chain: options.config.chain,
      protocol: options.config.protocol,
      metric: options.config.metric,
      timestamp: options.timestamp,
      token: debtToken,
      tokenPrice: debtTokenPrice ? debtTokenPrice : '0',
      totalBorrowed: '0',
      collaterals: [],
    };

    for (const trove of marketConfig.troves) {
      const collateralTokenPrice = await this.services.oracle.getTokenPriceUsd({
        chain: trove.collateralToken.chain,
        address: trove.collateralToken.address,
        timestamp: options.timestamp,
      });

      const totalDebt = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: this.abiConfigs.eventAbis.troveManager,
        target: marketConfig.address,
        method: 'getEntireSystemDebt',
        params: [],
        blockNumber: blockNumber,
      });
      assetState.totalBorrowed = new BigNumber(assetState.totalBorrowed)
        .plus(formatBigNumberToString(totalDebt.toString(), debtToken.decimals))
        .toString(10);

      const totalColl = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: this.abiConfigs.eventAbis.troveManager,
        target: marketConfig.address,
        method: 'getEntireSystemColl',
        params: [],
        blockNumber: blockNumber,
      });

      const borrowingFee = await this.getBorrowingFee(marketConfig.chain, trove.troveManager, blockNumber);

      assetState.collaterals.push({
        chain: options.config.chain,
        protocol: options.config.protocol,
        metric: options.config.metric,
        timestamp: options.timestamp,
        address: trove.troveManager,
        token: trove.collateralToken,
        tokenPrice: collateralTokenPrice ? collateralTokenPrice : '0',
        totalDeposited: formatBigNumberToString(totalColl.toString(), trove.collateralToken.decimals),
        rateBorrow: '0',

        // liquity charged on-time paid fee
        feeBorrow: formatBigNumberToString(borrowingFee, 18),

        // liquity must maintain 110% collateral value on debts
        // so, the loan to value is always 100 / 110 -> 0.9 -> 90%
        rateLoanToValue: '0.9',
      });
    }

    return assetState;
  }

  public async getEventLogs(options: AdapterGetEventLogsOptions): Promise<Array<any>> {
    const liquityConfig = options.metricConfig as LiquityLendingMarketConfig;

    // get logs from borrow operation
    let logs = await this.services.blockchain.getContractLogs({
      chain: liquityConfig.chain,
      address: liquityConfig.address,
      fromBlock: options.fromBlock,
      toBlock: options.toBlock,
    });

    // get logs from trove managers
    for (const trove of liquityConfig.troves) {
      logs = logs.concat(
        // get liquidation events
        await this.services.blockchain.getContractLogs({
          chain: liquityConfig.chain,
          address: trove.troveManager,
          fromBlock: options.fromBlock,
          toBlock: options.toBlock,
        }),
      );
    }

    return logs;
  }

  public async transformEventLogs(options: TransformEventLogOptions): Promise<TransformEventLogResult> {
    const result: TransformEventLogResult = {
      activities: [],
    };

    const eventSignatures: LiquityEventInterfaces = this.abiConfigs.eventSignatures;
    const marketConfig: LiquityLendingMarketConfig = options.config as LiquityLendingMarketConfig;
    const debtToken = marketConfig.debtToken as Token;
    for (const log of options.logs) {
      const signature = log.topics[0];
      const address = normalizeAddress(log.address);

      // todo: find the correct trove manager contract
      const trove: LiquityTrove = marketConfig.troves[0];

      if (signature === eventSignatures.TroveUpdated && compareAddress(address, marketConfig.address)) {
        // borrow/repay
        const event: any = decodeEventLog({
          abi: this.abiConfigs.eventAbis.borrowOperation,
          data: log.data,
          topics: log.topics,
        });
        const operation = Number(event.args._operation);
        const user = normalizeAddress(event.args._borrower);
        if (operation === 0) {
          // open trove
          const amount = formatBigNumberToString(event.args._debt.toString(), debtToken.decimals);
          const collateralAmount = formatBigNumberToString(event.args._coll.toString(), trove.collateralToken.decimals);

          // push the borrow event
          if (amount !== '0') {
            result.activities.push({
              chain: marketConfig.chain,
              protocol: options.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: `${log.logIndex.toString()}:0`,
              blockNumber: Number(log.blockNumber),
              action: 'borrow',
              user: user,
              token: debtToken,
              tokenAmount: amount,
            });
          }

          // push the deposit event
          if (collateralAmount !== '0') {
            result.activities.push({
              chain: marketConfig.chain,
              protocol: options.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: `${log.logIndex.toString()}:1`,
              blockNumber: Number(log.blockNumber),
              action: 'deposit',
              user: user,
              token: trove.collateralToken,
              tokenAmount: collateralAmount,
            });
          }
        } else {
          const info: GetTroveStateInfo = await this.getTroveState(
            marketConfig.chain,
            trove.troveManager,
            event,
            Number(log.blockNumber),
          );
          const action: ActivityAction = info.isBorrow ? ActivityActions.borrow : ActivityActions.repay;
          const collateralAction: ActivityAction = info.isBorrow ? ActivityActions.deposit : ActivityActions.withdraw;

          const amount = formatBigNumberToString(info.debtAmount, marketConfig.debtToken.decimals);
          const collateralAmount = formatBigNumberToString(info.collAmount, trove.collateralToken.decimals);

          if (amount !== '0') {
            result.activities.push({
              chain: marketConfig.chain,
              protocol: options.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: `${log.logIndex.toString()}:0`,
              blockNumber: Number(log.blockNumber),
              action: action,
              user: user,
              token: debtToken,
              tokenAmount: amount,
            });
          }
          if (collateralAmount !== '0') {
            result.activities.push({
              chain: marketConfig.chain,
              protocol: options.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: `${log.logIndex.toString()}:1`,
              blockNumber: Number(log.blockNumber),
              action: collateralAction,
              user: user,
              token: trove.collateralToken,
              tokenAmount: collateralAmount,
            });
          }
        }
      } else if (signature === eventSignatures.TroveLiquidated && compareAddress(address, trove.troveManager)) {
        const event: any = decodeEventLog({
          abi: this.abiConfigs.eventAbis.troveManager,
          data: log.data,
          topics: log.topics,
        });
        const collateralAmount = formatBigNumberToString(event.args._coll.toString(), trove.collateralToken.decimals);
        const borrower = normalizeAddress(event.args._borrower);

        if (collateralAmount !== '0') {
          result.activities.push({
            chain: marketConfig.chain,
            protocol: options.config.protocol,
            address: address,
            transactionHash: log.transactionHash,
            logIndex: `${log.logIndex.toString()}:1`,
            blockNumber: Number(log.blockNumber),
            action: ActivityActions.liquidate,
            user: borrower,
            token: trove.collateralToken,
            tokenAmount: collateralAmount,
          });
        }
      }
    }

    return result;
  }

  public async getLendingAssetDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<CdpLendingAssetDataTimeframe | null> {
    const stateData = await this.getLendingAssetDataState({
      config: options.config,
      timestamp: options.fromTime,
    });
    if (!stateData) {
      return null;
    }

    // make sure activities were synced
    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    const logs = await this.getEventLogs({
      metricConfig: options.config,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    const { activities } = await this.transformEventLogs({
      chain: options.config.chain,
      config: options.config,
      logs: logs,
    });

    let volumeBorrowed = new BigNumber(0);
    let volumeRepaid = new BigNumber(0);

    const addresses: { [key: string]: boolean } = {};
    const transactions: { [key: string]: boolean } = {};

    const snapshot: CdpLendingAssetDataTimeframe = {
      ...stateData,
      timefrom: options.fromTime,
      timeto: options.toTime,
      volumeBorrowed: '0',
      volumeRepaid: '0',
      addresses: [],
      transactions: [],
      collaterals: [],
    };

    // count borrow/repay events
    const lusdEvents = activities.filter(
      (activity) =>
        activity.chain === stateData.chain &&
        activity.protocol === stateData.protocol &&
        activity.address === options.config.address &&
        activity.token.address === stateData.token.address,
    );

    for (const event of lusdEvents) {
      const activityEvent = event as CdpLendingActivityEvent;
      if (!transactions[activityEvent.transactionHash]) {
        transactions[activityEvent.transactionHash] = true;
      }

      if (!addresses[activityEvent.user]) {
        addresses[activityEvent.user] = true;
      }

      switch (activityEvent.action) {
        case ActivityActions.borrow: {
          volumeBorrowed = volumeBorrowed.plus(new BigNumber(activityEvent.tokenAmount));
          break;
        }
        case ActivityActions.repay: {
          volumeRepaid = volumeRepaid.plus(new BigNumber(activityEvent.tokenAmount));
          break;
        }
      }
    }

    snapshot.volumeBorrowed = volumeBorrowed.toString(10);
    snapshot.volumeRepaid = volumeRepaid.toString(10);

    for (const collateral of stateData.collaterals) {
      let volumeDeposited = new BigNumber(0);
      let volumeWithdrawn = new BigNumber(0);
      let volumeLiquidated = new BigNumber(0);

      // count deposit/withdraw/liquidate events
      const collateralEvents = activities.filter(
        (activity) =>
          activity.chain === stateData.chain &&
          activity.protocol === stateData.protocol &&
          activity.token.address === collateral.token.address,
      );
      for (const event of collateralEvents) {
        const activityEvent = event as CdpLendingActivityEvent;

        if (!transactions[activityEvent.transactionHash]) {
          transactions[activityEvent.transactionHash] = true;
        }

        if (!addresses[activityEvent.user]) {
          addresses[activityEvent.user] = true;
        }

        switch (activityEvent.action) {
          case ActivityActions.deposit: {
            volumeDeposited = volumeDeposited.plus(new BigNumber(activityEvent.tokenAmount));
            break;
          }
          case ActivityActions.withdraw: {
            volumeWithdrawn = volumeWithdrawn.plus(new BigNumber(activityEvent.tokenAmount));
            break;
          }
          case ActivityActions.liquidate: {
            volumeLiquidated = volumeLiquidated.plus(new BigNumber(activityEvent.tokenAmount));
            break;
          }
        }
      }

      snapshot.collaterals.push({
        ...collateral,
        timefrom: options.fromTime,
        timeto: options.toTime,
        volumeDeposited: volumeDeposited.toString(10),
        volumeWithdrawn: volumeWithdrawn.toString(10),
        volumeLiquidated: volumeLiquidated.toString(10),
      });
    }

    snapshot.addresses = Object.keys(addresses);
    snapshot.transactions = Object.keys(transactions);

    return snapshot;
  }
}
