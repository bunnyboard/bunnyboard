import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import CometAbi from '../../../configs/abi/compound/Comet.json';
import { Erc20TransferEventSignature, TimeUnits } from '../../../configs/constants';
import { Compoundv3LendingMarketConfig } from '../../../configs/protocols/compound';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import {
  IsolatedLendingCollateralData,
  IsolatedLendingPoolDataTimeframe,
} from '../../../types/domains/isolatedLending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions } from '../../../types/options';
import CompoundLibs from '../../libs/compound';
import { AdapterGetEventLogsOptions } from '../adapter';
import IsolatedLendingProtocolAdapter from '../isolatedLending';
import { Compoundv3EventSignatures } from './abis';

export default class Compoundv3Adapter extends IsolatedLendingProtocolAdapter {
  public readonly name: string = 'adapter.compoundv3';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getEventLogs(options: AdapterGetEventLogsOptions): Promise<Array<any>> {
    return await this.services.blockchain.getContractLogs({
      chain: options.metricConfig.chain,
      address: options.metricConfig.address,
      fromBlock: options.fromBlock,
      toBlock: options.toBlock,
    });
  }

  public async getLendingPoolData(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<Array<IsolatedLendingPoolDataTimeframe> | null> {
    const { beginBlock, endBlock, stateBlock, stateTime, assetState } = await this.initialLendingAssetData(options);

    const marketConfig = options.config as Compoundv3LendingMarketConfig;

    const cometInfo = await CompoundLibs.getCometInfo(marketConfig, stateBlock);

    const [totalSupply, totalBorrow, utilization] = await this.services.blockchain.multicall({
      chain: marketConfig.chain,
      blockNumber: stateBlock,
      calls: [
        {
          abi: CometAbi,
          target: marketConfig.address,
          method: 'totalSupply',
          params: [],
        },
        {
          abi: CometAbi,
          target: marketConfig.address,
          method: 'totalBorrow',
          params: [],
        },
        {
          abi: CometAbi,
          target: marketConfig.address,
          method: 'getUtilization',
          params: [],
        },
      ],
    });

    const [supplyRate, borrowRate] = await this.services.blockchain.multicall({
      chain: marketConfig.chain,
      blockNumber: stateBlock,
      calls: [
        {
          abi: CometAbi,
          target: marketConfig.address,
          method: 'getSupplyRate',
          params: [utilization.toString()],
        },
        {
          abi: CometAbi,
          target: marketConfig.address,
          method: 'getBorrowRate',
          params: [utilization.toString()],
        },
      ],
    });

    assetState.totalDeposited = formatBigNumberToString(totalSupply.toString(), marketConfig.debtToken.decimals);
    assetState.totalBorrowed = formatBigNumberToString(totalBorrow.toString(), marketConfig.debtToken.decimals);
    assetState.rateBorrow = formatBigNumberToString(
      new BigNumber(borrowRate.toString()).multipliedBy(TimeUnits.SecondsPerYear).toString(10),
      18,
    );
    assetState.rateSupply = formatBigNumberToString(
      new BigNumber(supplyRate.toString()).multipliedBy(TimeUnits.SecondsPerYear).toString(10),
      18,
    );

    const logs = await this.getEventLogs({
      metricConfig: marketConfig,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    const addresses: any = {};
    const transactions: any = {};
    const collaterals: { [key: string]: IsolatedLendingCollateralData } = {};

    for (const collateral of cometInfo.collaterals) {
      const collateralPrice = await this.services.oracle.getTokenPriceUsd({
        chain: collateral.chain,
        address: collateral.address,
        timestamp: stateTime,
      });

      const [assetInfo, totalCollaterals] = await this.services.blockchain.multicall({
        chain: options.config.chain,
        blockNumber: stateBlock,
        calls: [
          {
            abi: CometAbi,
            target: marketConfig.address,
            method: 'getAssetInfoByAddress',
            params: [collateral.address],
          },
          {
            abi: CometAbi,
            target: marketConfig.address,
            method: 'totalsCollateral',
            params: [collateral.address],
          },
        ],
      });

      const totalDeposited = formatBigNumberToString(totalCollaterals[0].toString(), collateral.decimals);
      const loanToValue = formatBigNumberToString(assetInfo.borrowCollateralFactor.toString(), 18);

      collaterals[collateral.address] = {
        token: collateral,
        tokenPrice: collateralPrice ? collateralPrice : '0',
        totalDeposited: totalDeposited,
        rateLoanToValue: loanToValue,
        volumeDeposited: '0',
        volumeWithdrawn: '0',
        volumeLiquidated: '0',
      };
    }

    for (const log of logs) {
      const signature = log.topics[0];

      if (Object.values(Compoundv3EventSignatures).indexOf(signature) !== -1) {
        const event: any = decodeEventLog({
          abi: CometAbi,
          data: log.data,
          topics: log.topics,
        });

        transactions[log.transactionHash] = true;
        for (const field of ['from', 'dst', 'src', 'to', 'absorber', 'borrower']) {
          const userAddress = event.args[field] ? normalizeAddress(event.args[field]) : null;
          if (userAddress) {
            addresses[userAddress] = true;
          }
        }

        switch (signature) {
          case Compoundv3EventSignatures.Supply:
          case Compoundv3EventSignatures.Withdraw: {
            // on compound v3, we detect supply transaction by looking Comet Transfer event from the same transaction
            // when user deposit base asset, if there is a Transfer event emitted on transaction,
            // the transaction action is deposit, otherwise, the transaction action is repay.
            const amount = formatBigNumberToString(event.args.amount.toString(), marketConfig.debtToken.decimals);
            const cometTransferEvent = logs.filter(
              (item) =>
                item.transactionHash === log.transactionHash &&
                item.topics[0] === Erc20TransferEventSignature &&
                compareAddress(item.address, marketConfig.address),
            )[0];

            if (signature === Compoundv3EventSignatures.Supply) {
              if (cometTransferEvent) {
                assetState.volumeDeposited = new BigNumber(assetState.volumeDeposited)
                  .plus(new BigNumber(amount))
                  .toString(10);
              } else {
                assetState.volumeRepaid = new BigNumber(assetState.volumeRepaid)
                  .plus(new BigNumber(amount))
                  .toString(10);
              }
            } else {
              if (cometTransferEvent) {
                assetState.volumeWithdrawn = new BigNumber(assetState.volumeWithdrawn)
                  .plus(new BigNumber(amount))
                  .toString(10);
              } else {
                assetState.volumeBorrowed = new BigNumber(assetState.volumeBorrowed)
                  .plus(new BigNumber(amount))
                  .toString(10);
              }
            }
            break;
          }
          case Compoundv3EventSignatures.AbsorbDebt: {
            // repay debts by liquidators
            assetState.volumeRepaid = new BigNumber(assetState.volumeRepaid)
              .plus(
                new BigNumber(
                  formatBigNumberToString(event.args.basePaidOut.toString(), marketConfig.debtToken.decimals),
                ),
              )
              .toString(10);
            break;
          }

          case Compoundv3EventSignatures.SupplyCollateral:
          case Compoundv3EventSignatures.WithdrawCollateral: {
            const asset = normalizeAddress(event.args.asset);
            if (signature === Compoundv3EventSignatures.SupplyCollateral) {
              collaterals[asset].volumeDeposited = new BigNumber(collaterals[asset].volumeDeposited)
                .plus(
                  new BigNumber(
                    formatBigNumberToString(event.args.amount.toString(), collaterals[asset].token.decimals),
                  ),
                )
                .toString(10);
            } else {
              collaterals[asset].volumeWithdrawn = new BigNumber(collaterals[asset].volumeWithdrawn)
                .plus(
                  new BigNumber(
                    formatBigNumberToString(event.args.amount.toString(), collaterals[asset].token.decimals),
                  ),
                )
                .toString(10);
            }
            break;
          }
          case Compoundv3EventSignatures.AbsorbCollateral: {
            const asset = normalizeAddress(event.args.asset);
            collaterals[asset].volumeLiquidated = new BigNumber(collaterals[asset].volumeLiquidated)
              .plus(
                new BigNumber(
                  formatBigNumberToString(event.args.collateralAbsorbed.toString(), collaterals[asset].token.decimals),
                ),
              )
              .toString(10);
            break;
          }
        }
      }
    }

    assetState.addresses = Object.keys(addresses);
    assetState.transactions = Object.keys(transactions);
    assetState.collaterals = Object.values(collaterals);

    return [assetState];
  }
}
