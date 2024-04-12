import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import CometAbi from '../../../configs/abi/compound/Comet.json';
import { Erc20TransferEventSignature, TimeUnits } from '../../../configs/constants';
import { Compoundv3LendingMarketConfig } from '../../../configs/protocols/compound';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import {
  IsolatedLendingAssetDataState,
  IsolatedLendingAssetDataTimeframe,
  IsolatedLendingCollateralDataTimeframe,
} from '../../../types/domains/isolatedLending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataStateOptions, GetAdapterDataTimeframeOptions } from '../../../types/options';
import CompoundLibs from '../../libs/compound';
import { AdapterGetEventLogsOptions } from '../adapter';
import IsolatedLendingProtocolAdapter from '../isolatedLending';
import { Compoundv3EventSignatures } from './abis';

export default class Compoundv3Adapter extends IsolatedLendingProtocolAdapter {
  public readonly name: string = 'adapter.compoundv3';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getLendingAssetDataState(
    options: GetAdapterDataStateOptions,
  ): Promise<IsolatedLendingAssetDataState | null> {
    const marketConfig: Compoundv3LendingMarketConfig = options.config as Compoundv3LendingMarketConfig;
    const blockNumber = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.timestamp,
    );

    const cometInfo = await CompoundLibs.getCometInfo(marketConfig, blockNumber);
    const debtTokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: marketConfig.debtToken.chain,
      address: marketConfig.debtToken.address,
      timestamp: options.timestamp,
    });

    const marketState: IsolatedLendingAssetDataState = {
      chain: options.config.chain,
      protocol: options.config.protocol,
      metric: options.config.metric,
      timestamp: options.timestamp,
      address: options.config.address,
      token: marketConfig.debtToken,
      tokenPrice: debtTokenPrice ? debtTokenPrice : '0',
      totalDeposited: '0',
      totalBorrowed: '0',
      rateSupply: '0',
      rateBorrow: '0',
      collaterals: [],
    };

    const [totalSupply, totalBorrow, utilization] = await this.services.blockchain.multicall({
      chain: options.config.chain,
      blockNumber: blockNumber,
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
      chain: options.config.chain,
      blockNumber: blockNumber,
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

    marketState.totalDeposited = formatBigNumberToString(totalSupply.toString(), marketConfig.debtToken.decimals);
    marketState.totalBorrowed = formatBigNumberToString(totalBorrow.toString(), marketConfig.debtToken.decimals);
    marketState.rateBorrow = formatBigNumberToString(
      new BigNumber(borrowRate.toString()).multipliedBy(TimeUnits.SecondsPerYear).toString(10),
      18,
    );
    marketState.rateSupply = formatBigNumberToString(
      new BigNumber(supplyRate.toString()).multipliedBy(TimeUnits.SecondsPerYear).toString(10),
      18,
    );

    for (const asset of cometInfo.collaterals) {
      const assetPrice = await this.services.oracle.getTokenPriceUsd({
        chain: asset.chain,
        address: asset.address,
        timestamp: options.timestamp,
      });

      const [assetInfo, totalCollaterals] = await this.services.blockchain.multicall({
        chain: options.config.chain,
        blockNumber: blockNumber,
        calls: [
          {
            abi: CometAbi,
            target: marketConfig.address,
            method: 'getAssetInfoByAddress',
            params: [asset.address],
          },
          {
            abi: CometAbi,
            target: marketConfig.address,
            method: 'totalsCollateral',
            params: [asset.address],
          },
        ],
      });

      const totalDeposited = formatBigNumberToString(totalCollaterals[0].toString(), asset.decimals);
      const loanToValue = formatBigNumberToString(assetInfo.borrowCollateralFactor.toString(), 18);

      marketState.collaterals.push({
        chain: options.config.chain,
        protocol: options.config.protocol,
        metric: options.config.metric,
        timestamp: options.timestamp,
        token: asset,
        tokenPrice: assetPrice ? assetPrice : '0',
        totalDeposited: totalDeposited,
        rateLoanToValue: loanToValue,
      });
    }

    return marketState;
  }

  public async getEventLogs(options: AdapterGetEventLogsOptions): Promise<Array<any>> {
    return await this.services.blockchain.getContractLogs({
      chain: options.metricConfig.chain,
      address: options.metricConfig.address,
      fromBlock: options.fromBlock,
      toBlock: options.toBlock,
    });
  }

  public async getLendingAssetDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<IsolatedLendingAssetDataTimeframe | null> {
    const dataState = await this.getLendingAssetDataState({
      config: options.config,
      timestamp: options.fromTime,
    });
    if (!dataState) {
      return null;
    }

    const dataTimeframe: IsolatedLendingAssetDataTimeframe = {
      ...dataState,
      timefrom: options.fromTime,
      timeto: options.toTime,
      volumeDeposited: '0',
      volumeWithdrawn: '0',
      volumeBorrowed: '0',
      volumeRepaid: '0',
      addresses: [],
      transactions: [],
      collaterals: [],
    };

    const marketConfig = options.config as Compoundv3LendingMarketConfig;

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

    const addresses: { [key: string]: boolean } = {};
    const transactions: { [key: string]: boolean } = {};
    const collaterals: { [key: string]: IsolatedLendingCollateralDataTimeframe } = {};
    for (const collateralState of dataState.collaterals) {
      collaterals[collateralState.token.address] = {
        ...collateralState,
        timefrom: options.fromTime,
        timeto: options.toTime,
        volumeDeposited: '0',
        volumeWithdrawn: '0',
        volumeLiquidated: '0',
      };
    }
    for (const log of logs) {
      const signature = log.topics[0];

      if (
        signature === Compoundv3EventSignatures.Supply ||
        signature === Compoundv3EventSignatures.Withdraw ||
        signature === Compoundv3EventSignatures.SupplyCollateral ||
        signature === Compoundv3EventSignatures.WithdrawCollateral ||
        signature === Compoundv3EventSignatures.AbsorbCollateral
      ) {
        try {
          const event: any = decodeEventLog({
            abi: CometAbi,
            data: log.data,
            topics: log.topics,
          });

          transactions[log.transactionHash] = true;
          for (const key of ['from', 'to', 'src', 'dst', 'absorber', 'borrower']) {
            if (event.args[key]) {
              addresses[normalizeAddress(event.args[key])] = true;
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
                  dataTimeframe.volumeDeposited = new BigNumber(dataTimeframe.volumeDeposited)
                    .plus(new BigNumber(amount))
                    .toString(10);
                } else {
                  dataTimeframe.volumeRepaid = new BigNumber(dataTimeframe.volumeRepaid)
                    .plus(new BigNumber(amount))
                    .toString(10);
                }
              } else {
                if (cometTransferEvent) {
                  dataTimeframe.volumeWithdrawn = new BigNumber(dataTimeframe.volumeWithdrawn)
                    .plus(new BigNumber(amount))
                    .toString(10);
                } else {
                  dataTimeframe.volumeBorrowed = new BigNumber(dataTimeframe.volumeBorrowed)
                    .plus(new BigNumber(amount))
                    .toString(10);
                }
              }
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
            case Compoundv3EventSignatures.AbsorbDebt: {
              dataTimeframe.volumeRepaid = new BigNumber(dataTimeframe.volumeRepaid)
                .plus(
                  new BigNumber(
                    formatBigNumberToString(event.args.basePaidOut.toString(), marketConfig.debtToken.decimals),
                  ),
                )
                .toString(10);
              break;
            }
            case Compoundv3EventSignatures.AbsorbCollateral: {
              const asset = normalizeAddress(event.args.asset);
              collaterals[asset].volumeLiquidated = new BigNumber(collaterals[asset].volumeLiquidated)
                .plus(
                  new BigNumber(
                    formatBigNumberToString(
                      event.args.collateralAbsorbed.toString(),
                      collaterals[asset].token.decimals,
                    ),
                  ),
                )
                .toString(10);
              break;
            }
          }
        } catch (e: any) {}
      }
    }

    dataTimeframe.collaterals = Object.values(collaterals);
    dataTimeframe.addresses = Object.keys(addresses);
    dataTimeframe.transactions = Object.keys(transactions);

    return dataTimeframe;
  }
}
