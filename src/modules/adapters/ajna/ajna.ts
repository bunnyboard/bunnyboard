import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import AjnaErc20FactoryAbi from '../../../configs/abi/ajna/ERC20Factory.json';
import AjnaErc20PoolAbi from '../../../configs/abi/ajna/ERC20Pool.json';
import { SolidityUnits } from '../../../configs/constants';
import { AjnaLendingConfig } from '../../../configs/protocols/ajna';
import logger from '../../../lib/logger';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { IsolatedLendingPoolDataTimeframe } from '../../../types/domains/isolatedLending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions } from '../../../types/options';
import IsolatedLendingProtocolAdapter from '../isolatedLending';
import { AjnaEventSignatures } from './abis';

export default class AjnaAdapter extends IsolatedLendingProtocolAdapter {
  public readonly name: string = 'adapter.ajna';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getLendingPoolData(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<Array<IsolatedLendingPoolDataTimeframe> | null> {
    const marketConfig = options.config as AjnaLendingConfig;

    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    const stateTime = options.latestState ? options.toTime : options.fromTime;
    const stateBlock = options.latestState ? endBlock : beginBlock;

    // get pool list
    const deployedPools = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: AjnaErc20FactoryAbi,
      target: marketConfig.address,
      method: 'getDeployedPoolsList',
      params: [],
      blockNumber: stateBlock,
    });
    if (deployedPools) {
      const pools: Array<IsolatedLendingPoolDataTimeframe> = [];

      for (const poolAddress of deployedPools) {
        if (marketConfig.whitelistedPools.indexOf(normalizeAddress(poolAddress)) === -1) {
          // ignore low liquidity pools
          continue;
        }

        const [
          collateralAddress,
          quoteTokenAddress,
          depositSize,
          [debtInfo, , ,],
          [inflatorInfo],
          [interestRateInfo],
          pledgedCollateral,
        ] = await this.services.blockchain.multicall({
          chain: marketConfig.chain,
          blockNumber: stateBlock,
          calls: [
            {
              abi: AjnaErc20PoolAbi,
              target: poolAddress,
              method: 'collateralAddress',
              params: [],
            },
            {
              abi: AjnaErc20PoolAbi,
              target: poolAddress,
              method: 'quoteTokenAddress',
              params: [],
            },
            {
              abi: AjnaErc20PoolAbi,
              target: poolAddress,
              method: 'depositSize',
              params: [],
            },
            {
              abi: AjnaErc20PoolAbi,
              target: poolAddress,
              method: 'debtInfo',
              params: [],
            },
            {
              abi: AjnaErc20PoolAbi,
              target: poolAddress,
              method: 'inflatorInfo',
              params: [],
            },
            {
              abi: AjnaErc20PoolAbi,
              target: poolAddress,
              method: 'interestRateInfo',
              params: [],
            },
            {
              abi: AjnaErc20PoolAbi,
              target: poolAddress,
              method: 'pledgedCollateral',
              params: [],
            },
          ],
        });

        const debtToken = await this.services.blockchain.getTokenInfo({
          chain: marketConfig.chain,
          address: quoteTokenAddress,
        });
        const collateralToken = await this.services.blockchain.getTokenInfo({
          chain: marketConfig.chain,
          address: collateralAddress,
        });
        if (debtToken && collateralToken) {
          const debtTokenPrice = await this.services.oracle.getTokenPriceUsd({
            chain: marketConfig.chain,
            address: debtToken.address,
            timestamp: stateTime,
          });
          const collateralTokenPrice = await this.services.oracle.getTokenPriceUsd({
            chain: marketConfig.chain,
            address: collateralToken.address,
            timestamp: stateTime,
          });

          // totalBorrowed = debtInfo * inflatorInfo
          const totalBorrowed = new BigNumber(
            formatBigNumberToString(debtInfo.toString(), debtToken.decimals),
          ).multipliedBy(new BigNumber(formatBigNumberToString(inflatorInfo.toString(), 18)));

          // totalDeposited
          const totalDeposited = new BigNumber(formatBigNumberToString(depositSize.toString(), debtToken.decimals));
          const totalCollateralDeposited = formatBigNumberToString(
            pledgedCollateral.toString(),
            collateralToken.decimals,
          );

          // 1e18
          const rateBorrow = new BigNumber(formatBigNumberToString(interestRateInfo.toString(), 18));

          // rateSupply = totalBorrowed * rateBorrow / totalDeposited
          const rateSupply = totalBorrowed.multipliedBy(rateBorrow).dividedBy(totalDeposited);

          const logs = await this.services.blockchain.getContractLogs({
            chain: marketConfig.chain,
            address: normalizeAddress(poolAddress),
            fromBlock: beginBlock,
            toBlock: endBlock,
          });

          const addresses: any = {};
          const transactions: any = {};
          let volumeDeposited = new BigNumber(0);
          let volumeWithdrawn = new BigNumber(0);
          let volumeBorrowed = new BigNumber(0);
          let volumeRepaid = new BigNumber(0);
          let volumeCollateralDeposited = new BigNumber(0);
          let volumeCollateralWithdrawn = new BigNumber(0);
          let volumeCollateralLiquidated = new BigNumber(0);
          for (const log of logs) {
            const signature = log.topics[0];
            const address = normalizeAddress(log.address);

            if (Object.values(AjnaEventSignatures).indexOf(signature) !== -1 && compareAddress(address, poolAddress)) {
              const event: any = decodeEventLog({
                abi: AjnaErc20PoolAbi,
                data: log.data,
                topics: log.topics,
              });

              transactions[log.transactionHash] = true;
              for (const field of ['lender', 'actor', 'claimer', 'borrower']) {
                const userAddress = event.args[field] ? normalizeAddress(event.args[field]) : null;
                if (userAddress) {
                  addresses[userAddress] = true;
                }
              }

              switch (signature) {
                case AjnaEventSignatures.AddQuoteToken: {
                  volumeDeposited = volumeDeposited.plus(
                    new BigNumber(formatBigNumberToString(event.args.amount.toString(), SolidityUnits.WadDecimals)),
                  );
                  break;
                }
                case AjnaEventSignatures.RemoveQuoteToken: {
                  volumeWithdrawn = volumeWithdrawn.plus(
                    new BigNumber(formatBigNumberToString(event.args.amount.toString(), SolidityUnits.WadDecimals)),
                  );
                  break;
                }
                case AjnaEventSignatures.DrawDebt: {
                  volumeBorrowed = volumeBorrowed.plus(
                    new BigNumber(
                      formatBigNumberToString(event.args.amountBorrowed.toString(), SolidityUnits.WadDecimals),
                    ),
                  );
                  volumeCollateralDeposited = volumeCollateralDeposited.plus(
                    new BigNumber(
                      formatBigNumberToString(event.args.collateralPledged.toString(), SolidityUnits.WadDecimals),
                    ),
                  );
                  break;
                }
                case AjnaEventSignatures.RepayDebt: {
                  volumeRepaid = volumeRepaid.plus(
                    new BigNumber(
                      formatBigNumberToString(event.args.quoteRepaid.toString(), SolidityUnits.WadDecimals),
                    ),
                  );
                  volumeCollateralWithdrawn = volumeCollateralWithdrawn.plus(
                    new BigNumber(
                      formatBigNumberToString(event.args.collateralPulled.toString(), SolidityUnits.WadDecimals),
                    ),
                  );
                  break;
                }
                case AjnaEventSignatures.AddCollateral: {
                  volumeCollateralDeposited = volumeCollateralDeposited.plus(
                    new BigNumber(formatBigNumberToString(event.args.amount.toString(), SolidityUnits.WadDecimals)),
                  );
                  break;
                }
                case AjnaEventSignatures.RemoveCollateral: {
                  volumeCollateralWithdrawn = volumeCollateralWithdrawn.plus(
                    new BigNumber(formatBigNumberToString(event.args.amount.toString(), SolidityUnits.WadDecimals)),
                  );
                  break;
                }
                case AjnaEventSignatures.Take: {
                  volumeRepaid = volumeRepaid.plus(
                    new BigNumber(formatBigNumberToString(event.args.amount.toString(), SolidityUnits.WadDecimals)),
                  );
                  volumeCollateralLiquidated = volumeCollateralLiquidated.plus(
                    new BigNumber(formatBigNumberToString(event.args.collateral.toString(), SolidityUnits.WadDecimals)),
                  );
                  break;
                }
              }
            }
          }

          pools.push({
            chain: marketConfig.chain,
            protocol: marketConfig.protocol,
            timestamp: stateTime,
            timefrom: options.fromTime,
            timeto: options.toTime,
            metric: marketConfig.metric,

            // unique pool address
            address: normalizeAddress(poolAddress),

            token: debtToken,
            tokenPrice: debtTokenPrice ? debtTokenPrice : '0',

            totalDeposited: totalDeposited.toString(10),
            totalBorrowed: totalBorrowed.toString(10),

            rateSupply: rateSupply.toString(10),
            rateBorrow: rateBorrow.toString(10),

            volumeDeposited: volumeDeposited.toString(10),
            volumeWithdrawn: volumeWithdrawn.toString(10),
            volumeBorrowed: volumeBorrowed.toString(10),
            volumeRepaid: volumeRepaid.toString(10),

            addresses: Object.keys(addresses),
            transactions: Object.keys(transactions),

            collaterals: [
              {
                token: collateralToken,
                tokenPrice: collateralTokenPrice ? collateralTokenPrice : '0',
                totalDeposited: totalCollateralDeposited,
                volumeDeposited: volumeCollateralDeposited.toString(10),
                volumeWithdrawn: volumeCollateralWithdrawn.toString(10),
                volumeLiquidated: volumeCollateralLiquidated.toString(10),

                // todo need to find out how bucket works on Ajna
                // multiple level of borrow
                rateLoanToValue: '0',
              },
            ],
          });

          logger.debug('updated isolated lending pool info', {
            service: this.name,
            protocol: marketConfig.protocol,
            chain: marketConfig.chain,
            address: marketConfig.address,
            pool: `${debtToken.symbol}-${collateralToken.symbol}`,
          });
        }
      }

      return pools;
    }

    return null;
  }
}
