import BigNumber from 'bignumber.js';

import Erc20Abi from '../../../configs/abi/ERC20.json';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig, Token } from '../../../types/configs';
import { CdpLendingAssetDataTimeframe, CdpLendingCollateralData } from '../../../types/domains/cdpLending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions } from '../../../types/options';
import CdpLendingProtocolAdapter from '../cdpLending';
import { GravitaLendingMarketConfig } from '../../../configs/protocols/gravita';
import AdminContractAbi from '../../../configs/abi/gravita/AdminContract.json';
import PriceFeedAbi from '../../../configs/abi/gravita/PriceFeed.json';
import VesselManagerAbi from '../../../configs/abi/gravita/VesselManager.json';
import BorrowOperationsAbi from '../../../configs/abi/gravita/BorrowOperations.json';
import { ContractCall } from '../../../services/blockchains/domains';
import { GravitaEventSignatures } from './abis';
import { decodeEventLog } from 'viem';

interface GetVesselInfo {
  debtAmount: string;
  collAmount: string;
  isBorrow: boolean;
}

interface CollateralAndPrice {
  token: Token;
  tokenPrice: string;
}

export default class GravitaAdapter extends CdpLendingProtocolAdapter {
  public readonly name: string = 'adapter.gravita';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  protected async getVesselState(
    chain: string,
    vesselManager: string,
    decodedEvent: any,
    blockNumber: number,
  ): Promise<GetVesselInfo> {
    const vesselInfo = await this.services.blockchain.readContract({
      chain: chain,
      target: vesselManager,
      abi: VesselManagerAbi,
      method: 'Vessels',
      params: [decodedEvent.args._borrower, decodedEvent.args._asset],
      blockNumber: blockNumber - 1,
    });

    const previousDebt = new BigNumber(vesselInfo[0]);
    const newDebt = new BigNumber(decodedEvent.args._debt);
    const previousColl = new BigNumber(vesselInfo[1]);
    const newColl = new BigNumber(decodedEvent.args._coll);

    return {
      debtAmount: newDebt.minus(previousDebt).abs().toString(10),
      collAmount: newColl.minus(previousColl).abs().toString(10),
      isBorrow: previousDebt.lte(newDebt),
    };
  }

  protected async getCollateralsAndPrices(
    config: GravitaLendingMarketConfig,
    blockNumber: number,
  ): Promise<Array<CollateralAndPrice>> {
    const tokens: Array<CollateralAndPrice> = [];

    // get all collaterals
    const collateralAddresses = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: AdminContractAbi,
      target: config.adminContract,
      method: 'getValidCollateral',
      params: [],
      blockNumber: blockNumber,
    });
    if (collateralAddresses) {
      const calls: Array<ContractCall> = [];
      for (const address of collateralAddresses) {
        calls.push({
          abi: PriceFeedAbi,
          target: config.oracle,
          method: 'fetchPrice',
          params: [address],
        });
      }

      const prices = await this.services.blockchain.multicall({
        chain: config.chain,
        blockNumber: blockNumber,
        calls: calls,
      });

      if (prices) {
        for (let i = 0; i < collateralAddresses.length; i++) {
          const token = await this.services.blockchain.getTokenInfo({
            chain: config.chain,
            address: collateralAddresses[i],
          });
          if (token) {
            tokens.push({
              token: token,
              tokenPrice: prices[i] ? formatBigNumberToString(prices[i].toString(), 18) : '0',
            });
          }
        }
      }
    }

    return tokens;
  }

  public async getLendingAssetData(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<CdpLendingAssetDataTimeframe | null> {
    const marketConfig = options.config as GravitaLendingMarketConfig;

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

    const collateralsAndPrices = await this.getCollateralsAndPrices(marketConfig, stateBlock);
    if (collateralsAndPrices.length === 0) {
      return assetData;
    }

    // get events from BorrowOperations contract
    const logs = await this.services.blockchain.getContractLogs({
      chain: marketConfig.chain,
      address: marketConfig.borrowOperations,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    // count borrowing fees
    for (const log of logs) {
      const signature = log.topics[0];
      if (signature === GravitaEventSignatures.BorrowingFeePaid) {
        const event: any = decodeEventLog({
          abi: BorrowOperationsAbi,
          topics: log.topics,
          data: log.data,
        });

        const amount = formatBigNumberToString(event.args._feeAmount.toString(10), marketConfig.debtToken.decimals);
        assetData.feesPaid = new BigNumber(assetData.feesPaid).plus(new BigNumber(amount)).toString(10);
      }
    }

    const addresses: { [key: string]: boolean } = {};
    const transactions: { [key: string]: boolean } = {};
    for (const collateralAndPrice of collateralsAndPrices) {
      const vesselCalls: Array<ContractCall> = [
        {
          abi: VesselManagerAbi,
          target: marketConfig.vesselManager,
          method: 'getEntireSystemDebt',
          params: [collateralAndPrice.token.address],
        },
        {
          abi: VesselManagerAbi,
          target: marketConfig.vesselManager,
          method: 'getEntireSystemColl',
          params: [collateralAndPrice.token.address],
        },
        {
          abi: VesselManagerAbi,
          target: marketConfig.vesselManager,
          method: 'getBorrowingRate',
          params: [collateralAndPrice.token.address],
        },
        {
          abi: AdminContractAbi,
          target: marketConfig.adminContract,
          method: 'getMcr',
          params: [collateralAndPrice.token.address],
        },
      ];

      const result = await this.services.blockchain.multicall({
        chain: marketConfig.chain,
        blockNumber: stateBlock,
        calls: vesselCalls,
      });

      if (result) {
        // add total debt
        const totalBorrowed = formatBigNumberToString(result[0].toString(), 18);
        assetData.totalBorrowed = new BigNumber(assetData.totalBorrowed)
          .plus(new BigNumber(totalBorrowed))
          .toString(10);

        // rateLoanToValue = 1 / mcr
        const rateLoanToValue = new BigNumber(1)
          .dividedBy(new BigNumber(result[3].toString()).dividedBy(1e18))
          .toString(10);

        const rateBorrowOpeningFee = formatBigNumberToString(result[2].toString(), 18);

        const collateral: CdpLendingCollateralData = {
          token: collateralAndPrice.token,
          tokenPrice: collateralAndPrice.tokenPrice,
          address: normalizeAddress(marketConfig.borrowOperations),

          totalBorrowed: totalBorrowed,
          totalDeposited: formatBigNumberToString(result[1].toString(), collateralAndPrice.token.decimals),

          volumeDeposited: '0',
          volumeWithdrawn: '0',
          volumeLiquidated: '0',

          rateBorrow: '0',
          rateBorrowOpeningFee: rateBorrowOpeningFee,
          rateLoanToValue: rateLoanToValue,
        };

        for (const log of logs) {
          const signature = log.topics[0];
          if (signature === GravitaEventSignatures.VesselUpdated) {
            const event: any = decodeEventLog({
              abi: BorrowOperationsAbi,
              topics: log.topics,
              data: log.data,
            });

            // count only if this event from the collateral asset
            if (compareAddress(event.args._asset, collateralAndPrice.token.address)) {
              transactions[log.transactionHash] = true;
              for (const field of ['_borrower']) {
                if (event.args[field]) {
                  addresses[normalizeAddress(event.args[field])] = true;
                }
              }

              // enum BorrowerOperation {
              //   openVessel,
              //   closeVessel,
              //   adjustVessel
              // }
              const operation = Number(event.args._operation);
              if (operation === 0) {
                // open vessel
                const amount = formatBigNumberToString(event.args._debt.toString(), debtToken.decimals);
                const collateralAmount = formatBigNumberToString(
                  event.args._coll.toString(),
                  collateral.token.decimals,
                );

                assetData.volumeBorrowed = new BigNumber(assetData.volumeBorrowed)
                  .plus(new BigNumber(amount))
                  .toString(10);
                collateral.volumeDeposited = new BigNumber(collateral.volumeDeposited)
                  .plus(collateralAmount)
                  .toString(10);
              } else if (operation === 1) {
                // close vessel
                const amount = formatBigNumberToString(event.args._debt.toString(), debtToken.decimals);
                const collateralAmount = formatBigNumberToString(
                  event.args._coll.toString(),
                  collateral.token.decimals,
                );

                assetData.volumeRepaid = new BigNumber(assetData.volumeRepaid).plus(new BigNumber(amount)).toString(10);
                collateral.volumeWithdrawn = new BigNumber(collateral.volumeWithdrawn)
                  .plus(collateralAmount)
                  .toString(10);
              } else {
                // update vessel
                const vesselInfo = await this.getVesselState(
                  marketConfig.chain,
                  marketConfig.vesselManager,
                  event,
                  Number(log.blockNumber),
                );

                if (vesselInfo.isBorrow) {
                  assetData.volumeBorrowed = new BigNumber(assetData.volumeBorrowed)
                    .plus(formatBigNumberToString(vesselInfo.debtAmount, marketConfig.debtToken.decimals))
                    .toString(10);
                  collateral.volumeDeposited = new BigNumber(collateral.volumeDeposited)
                    .plus(formatBigNumberToString(vesselInfo.collAmount, collateral.token.decimals))
                    .toString(10);
                } else {
                  assetData.volumeRepaid = new BigNumber(assetData.volumeRepaid)
                    .plus(formatBigNumberToString(vesselInfo.debtAmount, marketConfig.debtToken.decimals))
                    .toString(10);
                  collateral.volumeWithdrawn = new BigNumber(collateral.volumeWithdrawn)
                    .plus(formatBigNumberToString(vesselInfo.collAmount, collateral.token.decimals))
                    .toString(10);
                }
              }
            }
          }
        }

        assetData.collaterals.push(collateral);
      }
    }

    assetData.addresses = Object.keys(addresses);
    assetData.transactions = Object.keys(transactions);

    return assetData;
  }
}
