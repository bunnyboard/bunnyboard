import BigNumber from 'bignumber.js';

import Erc20Abi from '../../../configs/abi/ERC20.json';
import { formatBigNumberToString, getTimestamp, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig, Token } from '../../../types/configs';
import { CdpLendingAssetDataTimeframe, CdpLendingCollateralData } from '../../../types/domains/cdpLending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions, RunAdapterOptions } from '../../../types/options';
import CdpLendingProtocolAdapter from '../cdpLending';
import FactoryAbi from '../../../configs/abi/prisma/Factory.json';
import PrismaCoreAbi from '../../../configs/abi/prisma/PrismaCore.json';
import TroveManagerAbi from '../../../configs/abi/prisma/TroveManager.json';
import PriceFeedAbi from '../../../configs/abi/prisma/PriceFeed.json';
import BorrowOperationsApi from '../../../configs/abi/prisma/BorrowOperations.json';
import { TimeUnits } from '../../../configs/constants';
import { PrismaEventSignatures } from './abis';
import { decodeEventLog } from 'viem';
import { PrismaLendingMarket } from '../../../configs/protocols/prisma';

interface GetTroveInfo {
  debtAmount: string;
  collAmount: string;
  isBorrow: boolean;
}

export default class PrismaAdapter extends CdpLendingProtocolAdapter {
  public readonly name: string = 'adapter.prisma';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  protected async getTroveState(
    chain: string,
    vesselManager: string,
    decodedEvent: any,
    blockNumber: number,
  ): Promise<GetTroveInfo> {
    const troveInfo = await this.services.blockchain.readContract({
      chain: chain,
      target: vesselManager,
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

  public async getLendingAssetData(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<CdpLendingAssetDataTimeframe | null> {
    const marketConfig = options.config as PrismaLendingMarket;

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

    const [totalSupply, troveManagerCount, priceFeed] = await this.services.blockchain.multicall({
      chain: marketConfig.chain,
      blockNumber: stateBlock,
      calls: [
        {
          abi: Erc20Abi,
          target: marketConfig.debtToken.address,
          method: 'totalSupply',
          params: [],
        },
        {
          abi: FactoryAbi,
          target: marketConfig.factory,
          method: 'troveManagerCount',
          params: [],
        },
        {
          abi: PrismaCoreAbi,
          target: marketConfig.prismaCore,
          method: 'priceFeed',
          params: [],
        },
      ],
    });

    const assetData: CdpLendingAssetDataTimeframe = {
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

    const addresses: { [key: string]: boolean } = {};
    const transactions: { [key: string]: boolean } = {};

    const borrowOperationLogs = await this.services.blockchain.getContractLogs({
      chain: marketConfig.chain,
      address: marketConfig.borrowOperations,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of borrowOperationLogs) {
      const signature = log.topics[0];
      if (signature === PrismaEventSignatures.BorrowingFeePaid) {
        const event: any = decodeEventLog({
          abi: BorrowOperationsApi,
          topics: log.topics,
          data: log.data,
        });

        transactions[log.transactionHash] = true;
        addresses[normalizeAddress(event.args.borrower)] = true;

        assetData.feesPaid = new BigNumber(assetData.feesPaid)
          .plus(new BigNumber(formatBigNumberToString(event.args.amount.toString(), 18)))
          .toString(10);
      }
    }

    for (let i = 0; i < Number(troveManagerCount); i++) {
      const troveManager = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: FactoryAbi,
        target: marketConfig.factory,
        method: 'troveManagers',
        params: [i],
        blockNumber: stateBlock,
      });

      if (troveManager) {
        const [collateralAddress, getBorrowingRate, interestRate, getEntireSystemColl, getEntireSystemDebt, MCR] =
          await this.services.blockchain.multicall({
            chain: marketConfig.chain,
            blockNumber: stateBlock,
            calls: [
              {
                abi: TroveManagerAbi,
                target: troveManager,
                method: 'collateralToken',
                params: [],
              },
              {
                abi: TroveManagerAbi,
                target: troveManager,
                method: 'getBorrowingRate',
                params: [],
              },
              {
                abi: TroveManagerAbi,
                target: troveManager,
                method: 'interestRate',
                params: [],
              },
              {
                abi: TroveManagerAbi,
                target: troveManager,
                method: 'getEntireSystemColl',
                params: [],
              },
              {
                abi: TroveManagerAbi,
                target: troveManager,
                method: 'getEntireSystemDebt',
                params: [],
              },
              {
                abi: TroveManagerAbi,
                target: troveManager,
                method: 'MCR',
                params: [],
              },
            ],
          });

        const price = await this.services.blockchain.readContract({
          chain: marketConfig.chain,
          abi: PriceFeedAbi,
          target: priceFeed,
          method: 'fetchPrice',
          params: [collateralAddress],
          blockNumber: stateBlock,
        });

        const collateralToken = await this.services.blockchain.getTokenInfo({
          chain: marketConfig.chain,
          address: collateralAddress,
        });
        if (collateralToken) {
          const collateralPrice = formatBigNumberToString(price ? price.toString() : '0', 18);

          const borrowOpeningRate = formatBigNumberToString(getBorrowingRate.toString(), 18);

          const totalBorrowed = formatBigNumberToString(
            getEntireSystemDebt.toString(10),
            marketConfig.debtToken.decimals,
          );

          let borrowInterestRate = '0';
          if (interestRate) {
            // borrowInterestRate = interestRate * SecondsPerYear / 1e27
            borrowInterestRate = formatBigNumberToString(
              new BigNumber(interestRate).multipliedBy(TimeUnits.SecondsPerYear).toString(10),
              27,
            );

            const interestAmount = new BigNumber(totalBorrowed)
              .multipliedBy(borrowInterestRate)
              .dividedBy(TimeUnits.DaysPerYear);
            assetData.feesPaid = new BigNumber(assetData.feesPaid).plus(interestAmount).toString(10);
          }

          const totalDeposited = formatBigNumberToString(getEntireSystemColl.toString(10), collateralToken.decimals);

          // LTV = 1 / MRC
          const loanToValue = new BigNumber(1e18).dividedBy(MCR.toString()).toString(10);

          assetData.totalBorrowed = new BigNumber(assetData.totalBorrowed)
            .plus(new BigNumber(totalBorrowed))
            .toString(10);

          const collateral: CdpLendingCollateralData = {
            address: normalizeAddress(troveManager),
            token: collateralToken,
            tokenPrice: collateralPrice,

            totalBorrowed: totalBorrowed,
            totalDeposited: totalDeposited,

            volumeDeposited: '0',
            volumeWithdrawn: '0',
            volumeLiquidated: '0',

            rateBorrow: borrowInterestRate,
            rateBorrowOpeningFee: borrowOpeningRate,
            rateLoanToValue: loanToValue,
          };

          const logs = await this.services.blockchain.getContractLogs({
            chain: marketConfig.chain,
            address: troveManager,
            fromBlock: beginBlock,
            toBlock: endBlock,
          });
          for (const log of logs) {
            const signature = log.topics[0];
            if (signature === PrismaEventSignatures.TroveUpdated) {
              const event: any = decodeEventLog({
                abi: TroveManagerAbi,
                topics: log.topics,
                data: log.data,
              });

              transactions[log.transactionHash] = true;
              addresses[normalizeAddress(event.args._borrower)] = true;

              const operation = Number(event.args._operation);
              if (operation === 0) {
                // open/close trove
                const amount = formatBigNumberToString(event.args._debt.toString(), debtToken.decimals);
                const collateralAmount = formatBigNumberToString(
                  event.args._coll.toString(),
                  collateral.token.decimals,
                );
                if (operation === 0) {
                  assetData.volumeBorrowed = new BigNumber(assetData.volumeBorrowed)
                    .plus(new BigNumber(amount))
                    .toString(10);
                  collateral.volumeDeposited = new BigNumber(collateral.volumeDeposited)
                    .plus(new BigNumber(collateralAmount))
                    .toString(10);
                } else {
                  assetData.volumeRepaid = new BigNumber(assetData.volumeRepaid)
                    .plus(new BigNumber(amount))
                    .toString(10);
                  collateral.volumeWithdrawn = new BigNumber(collateral.volumeWithdrawn)
                    .plus(new BigNumber(collateralAmount))
                    .toString(10);
                }
              } else if (operation === 1 || operation === 2) {
                // close or update trove
                const info: GetTroveInfo = await this.getTroveState(
                  marketConfig.chain,
                  troveManager,
                  event,
                  Number(log.blockNumber),
                );

                const amount = formatBigNumberToString(info.debtAmount, marketConfig.debtToken.decimals);
                const collateralAmount = formatBigNumberToString(info.collAmount, collateralToken.decimals);
                if (info.isBorrow) {
                  assetData.volumeBorrowed = new BigNumber(assetData.volumeBorrowed)
                    .plus(new BigNumber(amount))
                    .toString(10);
                  collateral.volumeDeposited = new BigNumber(collateral.volumeDeposited)
                    .plus(new BigNumber(collateralAmount))
                    .toString(10);
                } else {
                  assetData.volumeRepaid = new BigNumber(assetData.volumeRepaid)
                    .plus(new BigNumber(amount))
                    .toString(10);
                  collateral.volumeWithdrawn = new BigNumber(collateral.volumeWithdrawn)
                    .plus(new BigNumber(collateralAmount))
                    .toString(10);
                }
              } else if (operation === 3) {
                // liquidation
                const amount = formatBigNumberToString(event.args._debt.toString(), debtToken.decimals);
                const collateralAmount = formatBigNumberToString(
                  event.args._coll.toString(),
                  collateral.token.decimals,
                );
                assetData.volumeRepaid = new BigNumber(assetData.volumeRepaid).plus(new BigNumber(amount)).toString(10);
                collateral.volumeLiquidated = new BigNumber(collateral.volumeLiquidated)
                  .plus(new BigNumber(collateralAmount))
                  .toString(10);
              } else if (operation === 4) {
                // redeemtion
                const amount = formatBigNumberToString(event.args._debt.toString(), debtToken.decimals);
                const collateralAmount = formatBigNumberToString(
                  event.args._coll.toString(),
                  collateral.token.decimals,
                );
                assetData.volumeRepaid = new BigNumber(assetData.volumeRepaid).plus(new BigNumber(amount)).toString(10);
                collateral.volumeWithdrawn = new BigNumber(collateral.volumeWithdrawn)
                  .plus(new BigNumber(collateralAmount))
                  .toString(10);
              }
            }
          }

          assetData.collaterals.push(collateral);
        }
      }
    }

    assetData.addresses = Object.keys(addresses);
    assetData.transactions = Object.keys(transactions);

    return assetData;
  }

  public async runTest(options: RunAdapterOptions): Promise<void> {
    const currentTime = getTimestamp();
    const last24Hours = currentTime - 24 * 60 * 60;
    console.log(
      await this.getLendingAssetData({
        config: options.metricConfig,
        fromTime: last24Hours,
        toTime: currentTime,
        latestState: true,
      }),
    );
  }
}
