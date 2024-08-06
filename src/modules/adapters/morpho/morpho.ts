import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import AdapterCurveIrmAbi from '../../../configs/abi/morpho/AdapterCurveIrm.json';
import MorphoBlueAbi from '../../../configs/abi/morpho/MorphoBlue.json';
import MorphoOracleAbi from '../../../configs/abi/morpho/MorphoOracle.json';
import { AddressZero, TimeUnits } from '../../../configs/constants';
import envConfig from '../../../configs/envConfig';
import { ChainNames } from '../../../configs/names';
import { MorphoBlueConfig } from '../../../configs/protocols/morpho';
import logger from '../../../lib/logger';
import { formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { IsolatedLendingPoolDataTimeframe } from '../../../types/domains/isolatedLending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions } from '../../../types/options';
import IsolatedLendingProtocolAdapter from '../isolatedLending';
import { MorphoEventSignatures } from './abis';

export default class MorphoAdapter extends IsolatedLendingProtocolAdapter {
  public readonly name: string = 'adapter.morpho 🦋';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getLendingPoolData(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<Array<IsolatedLendingPoolDataTimeframe> | null> {
    const blueConfig = options.config as MorphoBlueConfig;

    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    const stateTime = options.latestState ? options.toTime : options.fromTime;
    const stateBlock = options.latestState ? endBlock : beginBlock;

    // we indexed these collateral supply/withdraw/liquidate events
    // to build current collateral state of the market
    await this.services.blockchain.indexContractLogs(this.storages, {
      chain: blueConfig.chain,
      address: blueConfig.address,
      fromBlock: blueConfig.birthblock as number,
      toBlock: endBlock,
      signatures: [
        MorphoEventSignatures.SupplyCollateral,
        MorphoEventSignatures.WithdrawCollateral,
        MorphoEventSignatures.Liquidate,
      ],
      blockRange: blueConfig.chain === ChainNames.ethereum ? 500 : undefined,
    });

    const logs = await this.services.blockchain.getContractLogs({
      chain: blueConfig.chain,
      address: blueConfig.address,
      fromBlock: beginBlock,
      toBlock: endBlock,
      blockRange: blueConfig.chain === ChainNames.ethereum ? 200 : undefined,
    });
    const databaseLogs = await this.storages.database.query({
      collection: envConfig.mongodb.collections.cachingContractLogs.name,
      query: {
        chain: blueConfig.chain,
        address: blueConfig.address,
        blockNumber: {
          $gte: 0,
          $lte: endBlock,
        },
      },
    });

    const pools: Array<IsolatedLendingPoolDataTimeframe> = [];

    for (const market of blueConfig.markets) {
      if (market.oracle === AddressZero || market.irm === AddressZero || market.birthday > stateTime) {
        continue;
      }

      const debtTokenPrice = await this.services.oracle.getTokenPriceUsd({
        chain: market.debtToken.chain,
        address: market.debtToken.address,
        timestamp: stateTime,
      });
      if (debtTokenPrice) {
        const [totalSupplyAssets, totalSupplyShares, totalBorrowAssets, totalBorrowShares, lastUpdate, fee] =
          await this.services.blockchain.readContract({
            chain: blueConfig.chain,
            abi: MorphoBlueAbi,
            target: blueConfig.address,
            method: 'market',
            params: [market.id],
            blockNumber: stateBlock,
          });

        const [borrowRateView, collateralPrice] = await this.services.blockchain.multicall({
          chain: blueConfig.chain,
          calls: [
            {
              abi: AdapterCurveIrmAbi,
              target: market.irm,
              method: 'borrowRateView',
              params: [
                [
                  market.debtToken.address, // loanToken
                  market.collateral.address, // collateralToken
                  market.oracle, // oracle
                  market.irm, // irm
                  market.ltv, // ltv
                ],
                [
                  totalSupplyAssets.toString(),
                  totalSupplyShares.toString(),
                  totalBorrowAssets.toString(),
                  totalBorrowShares.toString(),
                  lastUpdate.toString(),
                  fee.toString(),
                ],
              ],
            },
            {
              abi: MorphoOracleAbi,
              target: market.oracle,
              method: 'price',
              params: [],
            },
          ],
          blockNumber: stateBlock,
        });

        // https://docs.morpho.org/morpho-blue/contracts/oracles/#price
        const collateralPriceUsd = collateralPrice
          ? new BigNumber(
              formatBigNumberToString(
                collateralPrice.toString(),
                36 + market.debtToken.decimals - market.collateral.decimals,
              ),
            )
              .multipliedBy(new BigNumber(debtTokenPrice))
              .toString(10)
          : '0';

        // borrowRatePerSecond from Morpho Irm
        const borrowRate = new BigNumber(borrowRateView.toString()).dividedBy(1e18);

        // compound per day
        const borrowAPY = new BigNumber(1)
          .plus(borrowRate.multipliedBy(TimeUnits.SecondsPerYear).dividedBy(TimeUnits.DaysPerYear))
          .pow(TimeUnits.DaysPerYear)
          .minus(1);

        // supplyAPY = borrowAPY x utilization x (1 - fee)
        const supplyApy = new BigNumber(totalBorrowAssets.toString()).gt(0)
          ? borrowAPY.multipliedBy(new BigNumber(totalBorrowAssets.toString()).dividedBy(totalSupplyAssets.toString()))
          : new BigNumber(0);

        let volumeDeposited = new BigNumber(0);
        let volumeWithdrawn = new BigNumber(0);
        let volumeBorrowed = new BigNumber(0);
        let volumeRepaid = new BigNumber(0);
        let volumeCollateralDeposited = new BigNumber(0);
        let volumeCollateralWithdrawn = new BigNumber(0);
        let volumeCollateralLiquidated = new BigNumber(0);
        const addresses: { [key: string]: boolean } = {};
        const transactions: { [key: string]: boolean } = {};
        for (const log of logs) {
          const signature = log.topics[0];
          if (Object.values(MorphoEventSignatures).indexOf(signature) !== -1) {
            const event: any = decodeEventLog({
              abi: MorphoBlueAbi,
              topics: log.topics,
              data: log.data,
            });

            if (market.id === event.args.id) {
              transactions[log.transactionHash] = true;
              for (const field of ['caller', 'onBehalf', 'borrower', 'receiver']) {
                if (event.args[field]) {
                  addresses[normalizeAddress(event.args[field])] = true;
                }
              }

              switch (signature) {
                case MorphoEventSignatures.Supply: {
                  volumeDeposited = volumeDeposited.plus(
                    new BigNumber(formatBigNumberToString(event.args.assets.toString(), market.debtToken.decimals)),
                  );
                  break;
                }
                case MorphoEventSignatures.Withdraw: {
                  volumeWithdrawn = volumeWithdrawn.plus(
                    new BigNumber(formatBigNumberToString(event.args.assets.toString(), market.debtToken.decimals)),
                  );
                  break;
                }
                case MorphoEventSignatures.Borrow: {
                  volumeBorrowed = volumeBorrowed.plus(
                    new BigNumber(formatBigNumberToString(event.args.assets.toString(), market.debtToken.decimals)),
                  );
                  break;
                }
                case MorphoEventSignatures.Repay: {
                  volumeRepaid = volumeRepaid.plus(
                    new BigNumber(formatBigNumberToString(event.args.assets.toString(), market.debtToken.decimals)),
                  );
                  break;
                }
                case MorphoEventSignatures.SupplyCollateral: {
                  volumeCollateralDeposited = volumeCollateralDeposited.plus(
                    new BigNumber(formatBigNumberToString(event.args.assets.toString(), market.collateral.decimals)),
                  );
                  break;
                }
                case MorphoEventSignatures.WithdrawCollateral: {
                  volumeCollateralWithdrawn = volumeCollateralWithdrawn.plus(
                    new BigNumber(formatBigNumberToString(event.args.assets.toString(), market.collateral.decimals)),
                  );
                  break;
                }
                case MorphoEventSignatures.Liquidate: {
                  volumeRepaid = volumeRepaid.plus(
                    new BigNumber(
                      formatBigNumberToString(event.args.repaidAssets.toString(), market.debtToken.decimals),
                    ),
                  );
                  volumeCollateralLiquidated = volumeCollateralLiquidated.plus(
                    new BigNumber(
                      formatBigNumberToString(event.args.seizedAssets.toString(), market.collateral.decimals),
                    ),
                  );
                  break;
                }
              }
            }
          }
        }

        let totalCollateralDeposited = new BigNumber(0);
        for (const log of databaseLogs) {
          const signature = log.topics[0];

          const event: any = decodeEventLog({
            abi: MorphoBlueAbi,
            topics: log.topics,
            data: log.data,
          });

          if (event.args.id === market.id) {
            switch (signature) {
              case MorphoEventSignatures.SupplyCollateral: {
                totalCollateralDeposited = totalCollateralDeposited.plus(
                  new BigNumber(formatBigNumberToString(event.args.assets.toString(), market.collateral.decimals)),
                );
                break;
              }
              case MorphoEventSignatures.WithdrawCollateral: {
                totalCollateralDeposited = totalCollateralDeposited.minus(
                  new BigNumber(formatBigNumberToString(event.args.assets.toString(), market.collateral.decimals)),
                );
                break;
              }
              case MorphoEventSignatures.Liquidate: {
                totalCollateralDeposited = totalCollateralDeposited.minus(
                  new BigNumber(
                    formatBigNumberToString(event.args.seizedAssets.toString(), market.collateral.decimals),
                  ),
                );
                break;
              }
            }
          }
        }

        const marketData = {
          timefrom: options.fromTime,
          timeto: options.toTime,
          timestamp: stateTime,

          chain: blueConfig.chain,
          protocol: blueConfig.protocol,
          metric: blueConfig.metric,
          address: market.id, // market id

          token: market.debtToken,
          tokenPrice: debtTokenPrice,

          totalDeposited: formatBigNumberToString(totalSupplyAssets.toString(), market.debtToken.decimals),
          totalBorrowed: formatBigNumberToString(totalBorrowAssets.toString(), market.debtToken.decimals),

          volumeDeposited: volumeDeposited.toString(10),
          volumeWithdrawn: volumeWithdrawn.toString(10),
          volumeBorrowed: volumeBorrowed.toString(10),
          volumeRepaid: volumeRepaid.toString(10),

          rateSupply: supplyApy.toString(10),
          rateBorrow: borrowAPY.toString(10),

          addresses: Object.keys(addresses),
          transactions: Object.keys(transactions),

          collaterals: [
            {
              token: market.collateral,
              tokenPrice: collateralPriceUsd,
              totalDeposited: totalCollateralDeposited.toString(10),
              rateLoanToValue: formatBigNumberToString(market.ltv, 18),
              volumeDeposited: volumeCollateralDeposited.toString(10),
              volumeWithdrawn: volumeCollateralWithdrawn.toString(10),
              volumeLiquidated: volumeCollateralLiquidated.toString(10),
            },
          ],
        };

        logger.debug('got morpho blue market data', {
          service: this.name,
          protocol: blueConfig.protocol,
          chain: blueConfig.chain,
          market: `${market.debtToken.symbol}-${market.collateral.symbol}`,
        });

        pools.push(marketData);
      }
    }

    return pools;
  }
}
