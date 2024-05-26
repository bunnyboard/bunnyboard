import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import Erc20Abi from '../../../configs/abi/ERC20.json';
import BorrowOperationsAbi from '../../../configs/abi/liquity/BorrowOperations.json';
import TroveManagerAbi from '../../../configs/abi/liquity/TroveManager.json';
import { LiquityLendingMarketConfig } from '../../../configs/protocols/liquity';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig, Token } from '../../../types/configs';
import { CdpLendingAssetDataTimeframe } from '../../../types/domains/cdpLending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions } from '../../../types/options';
import CdpLendingProtocolAdapter from '../cdpLending';
import { LiquityEventSignatures } from './abis';

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
    return formatBigNumberToString(borrowingFee.toString(), 18);
  }

  public async getLendingAssetData(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<CdpLendingAssetDataTimeframe | null> {
    const marketConfig = options.config as LiquityLendingMarketConfig;

    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    const stateTime = options.latestState ? options.toTime : options.fromTime;
    const stateBlock = options.latestState ? endBlock : beginBlock;

    const debtToken = marketConfig.debtToken as Token;
    const debtTokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: debtToken.chain,
      address: debtToken.address,
      timestamp: stateTime,
    });

    const totalSupply = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: Erc20Abi,
      target: marketConfig.debtToken.address,
      method: 'totalSupply',
      params: [],
      blockNumber: stateBlock,
    });

    const assetState: CdpLendingAssetDataTimeframe = {
      chain: options.config.chain,
      protocol: options.config.protocol,
      metric: options.config.metric,
      timestamp: stateTime,
      timefrom: options.fromTime,
      timeto: options.toTime,

      token: debtToken,
      tokenPrice: debtTokenPrice ? debtTokenPrice : '0',

      totalBorrowed: '0',
      totalSupply: formatBigNumberToString(totalSupply.toString(), debtToken.decimals),
      volumeRepaid: '0',
      volumeBorrowed: '0',
      feesPaid: '0',

      addresses: [],
      transactions: [],
      collaterals: [],
    };

    const addresses: any = {};
    const transactions: any = {};
    for (const troveConfig of marketConfig.troves) {
      const collateralTokenPrice = await this.services.oracle.getTokenPriceUsd({
        chain: troveConfig.collateralToken.chain,
        address: troveConfig.collateralToken.address,
        timestamp: stateTime,
      });

      const [totalDebt, totalColl] = await this.services.blockchain.multicall({
        chain: marketConfig.chain,
        blockNumber: stateBlock,
        calls: [
          {
            abi: this.abiConfigs.eventAbis.borrowOperation,
            target: troveConfig.borrowOperation,
            method: 'getEntireSystemDebt',
            params: [],
          },
          {
            abi: this.abiConfigs.eventAbis.borrowOperation,
            target: troveConfig.borrowOperation,
            method: 'getEntireSystemColl',
            params: [],
          },
        ],
      });
      assetState.totalBorrowed = new BigNumber(assetState.totalBorrowed)
        .plus(formatBigNumberToString(totalDebt.toString(), debtToken.decimals))
        .toString(10);

      let logs: Array<any> = await this.services.blockchain.getContractLogs({
        chain: marketConfig.chain,
        address: troveConfig.borrowOperation,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      // get liquidation events from trove manager
      logs = logs.concat(
        await this.services.blockchain.getContractLogs({
          chain: marketConfig.chain,
          address: troveConfig.troveManager,
          fromBlock: beginBlock,
          toBlock: endBlock,
        }),
      );

      let volumeDeposited = '0';
      let volumeWithdrawn = '0';
      let volumeLiquidated = '0';
      for (const log of logs) {
        const signature = log.topics[0];
        const address = normalizeAddress(log.address);

        if (signature === LiquityEventSignatures.TroveUpdated && compareAddress(address, troveConfig.borrowOperation)) {
          // borrow/repay
          const event: any = decodeEventLog({
            abi: this.abiConfigs.eventAbis.borrowOperation,
            data: log.data,
            topics: log.topics,
          });

          transactions[log.transactionHash] = true;
          addresses[normalizeAddress(event.args._borrower)] = true;

          const operation = Number(event.args._operation);
          if (operation === 0) {
            // open trove
            const amount = formatBigNumberToString(event.args._debt.toString(), debtToken.decimals);
            const collateralAmount = formatBigNumberToString(
              event.args._coll.toString(),
              troveConfig.collateralToken.decimals,
            );

            // push the borrow event
            if (amount !== '0') {
              assetState.volumeBorrowed = new BigNumber(assetState.volumeBorrowed)
                .plus(new BigNumber(amount))
                .toString(10);
              volumeDeposited = new BigNumber(volumeDeposited).plus(new BigNumber(collateralAmount)).toString(10);
            }
          } else {
            // update trove
            const info: GetTroveStateInfo = await this.getTroveState(
              marketConfig.chain,
              troveConfig.troveManager,
              event,
              Number(log.blockNumber),
            );

            const amount = formatBigNumberToString(info.debtAmount, marketConfig.debtToken.decimals);
            const collateralAmount = formatBigNumberToString(info.collAmount, troveConfig.collateralToken.decimals);
            if (info.isBorrow) {
              assetState.volumeBorrowed = new BigNumber(assetState.volumeBorrowed)
                .plus(new BigNumber(amount))
                .toString(10);
              volumeDeposited = new BigNumber(volumeDeposited).plus(new BigNumber(collateralAmount)).toString(10);
            } else {
              assetState.volumeRepaid = new BigNumber(assetState.volumeRepaid).plus(new BigNumber(amount)).toString(10);
              volumeWithdrawn = new BigNumber(volumeWithdrawn).plus(new BigNumber(collateralAmount)).toString(10);
            }
          }
        } else if (
          signature === LiquityEventSignatures.LUSDBorrowingFeePaid &&
          compareAddress(address, troveConfig.borrowOperation)
        ) {
          const event: any = decodeEventLog({
            abi: this.abiConfigs.eventAbis.borrowOperation,
            data: log.data,
            topics: log.topics,
          });

          transactions[log.transactionHash] = true;
          addresses[normalizeAddress(event.args._borrower)] = true;

          const amount = formatBigNumberToString(event.args._LUSDFee, marketConfig.debtToken.decimals);
          assetState.feesPaid = new BigNumber(assetState.feesPaid).plus(new BigNumber(amount)).toString(10);
        } else if (
          signature === LiquityEventSignatures.TroveLiquidated &&
          compareAddress(address, troveConfig.troveManager)
        ) {
          // liquidation
          const event: any = decodeEventLog({
            abi: this.abiConfigs.eventAbis.troveManager,
            data: log.data,
            topics: log.topics,
          });

          transactions[log.transactionHash] = true;
          addresses[normalizeAddress(event.args._borrower)] = true;

          const collateralAmount = formatBigNumberToString(
            event.args._coll.toString(),
            troveConfig.collateralToken.decimals,
          );

          volumeLiquidated = new BigNumber(volumeLiquidated).plus(new BigNumber(collateralAmount)).toString(10);
        }
      }

      assetState.collaterals.push({
        address: troveConfig.troveManager,
        token: troveConfig.collateralToken,
        tokenPrice: collateralTokenPrice ? collateralTokenPrice : '0',

        totalBorrowed: formatBigNumberToString(totalDebt.toString(), debtToken.decimals),
        totalDeposited: formatBigNumberToString(totalColl.toString(), troveConfig.collateralToken.decimals),

        volumeDeposited: volumeDeposited,
        volumeWithdrawn: volumeWithdrawn,
        volumeLiquidated: volumeLiquidated,

        // zero-interest borrowing on liquity
        rateBorrow: '0',

        rateBorrowOpeningFee: await this.getBorrowingFee(marketConfig.chain, troveConfig.troveManager, stateBlock),

        // liquity must maintain 110% collateral value on debts
        // so, the loan to value is always 100 / 110 -> 0.9 -> 90%
        rateLoanToValue: '0.9',
      });
    }

    assetState.addresses = Object.keys(addresses);
    assetState.transactions = Object.keys(transactions);

    return assetState;
  }
}
