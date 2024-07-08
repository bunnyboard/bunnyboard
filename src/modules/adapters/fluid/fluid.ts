import VaultResolverAbi from '../../../configs/abi/fluid/VaultResolver.json';
import LiquidityResolverAbi from '../../../configs/abi/fluid/LiquidityResolver.json';
import FluidVaultT1Abi from '../../../configs/abi/fluid/FluidVaultT1.json';
import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions } from '../../../types/options';
import { FluidLendingConfig } from '../../../configs/protocols/fluid';
import IsolatedLendingProtocolAdapter from '../isolatedLending';
import {
  IsolatedLendingCollateralData,
  IsolatedLendingPoolDataTimeframe,
} from '../../../types/domains/isolatedLending';
import { formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { decodeEventLog } from 'viem';
import BigNumber from 'bignumber.js';

export const FluidVaultEvents = {
  LogOperate: '0xfef64760e30a41b9d5ba7dd65ff7236a61d89ed8b44c67a29e84db1a67513a1c',
  LogLiquidate: '0x80fd9cc6b1821f4a510e45ffce6852ea3404807b5d3d833ffa85664408afcb66',
};

export default class FluidAdapter extends IsolatedLendingProtocolAdapter {
  public readonly name: string = 'adapter.fluid';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getLendingPoolData(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<Array<IsolatedLendingPoolDataTimeframe> | null> {
    const marketConfig = options.config as FluidLendingConfig;

    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    const stateTime = options.latestState ? options.toTime : options.fromTime;
    const stateBlock = options.latestState ? endBlock : beginBlock;

    const pools: Array<IsolatedLendingPoolDataTimeframe> = [];

    const allVaultsData = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      target: marketConfig.vaultResolver,
      abi: VaultResolverAbi,
      method: 'getVaultsEntireData',
      params: [],
      blockNumber: stateBlock,
    });

    for (const vaultData of allVaultsData) {
      const poolAddress = normalizeAddress(vaultData.vault);

      const borrrowTokenAddress = vaultData.constantVariables.borrowToken;
      const token = await this.services.blockchain.getTokenInfo({
        chain: marketConfig.chain,
        address: vaultData.constantVariables.borrowToken,
      });
      const collateral = await this.services.blockchain.getTokenInfo({
        chain: marketConfig.chain,
        address: vaultData.constantVariables.supplyToken,
      });
      if (token && collateral) {
        const tokenPrice = await this.services.oracle.getTokenPriceUsd({
          chain: token.chain,
          address: token.address,
          timestamp: stateTime,
        });
        const collateralPrice = await this.services.oracle.getTokenPriceUsd({
          chain: collateral.chain,
          address: collateral.address,
          timestamp: stateTime,
        });

        const liquidityData = await this.services.blockchain.readContract({
          chain: marketConfig.chain,
          target: marketConfig.liquidityResolver,
          abi: LiquidityResolverAbi,
          method: 'getOverallTokenData',
          params: [borrrowTokenAddress],
          blockNumber: stateBlock,
        });

        const totalDeposited = formatBigNumberToString(liquidityData.totalSupply.toString(), token.decimals);
        const totalBorrowed = formatBigNumberToString(
          vaultData.totalSupplyAndBorrow.totalBorrowVault.toString(),
          token.decimals,
        );

        const pool: IsolatedLendingPoolDataTimeframe = {
          protocol: marketConfig.protocol,
          chain: marketConfig.chain,
          metric: marketConfig.metric,
          timestamp: stateTime,
          timefrom: options.fromTime,
          timeto: options.toTime,
          address: poolAddress,

          token: token,
          tokenPrice: tokenPrice ? tokenPrice : '0',

          totalBorrowed: totalBorrowed,
          totalDeposited: totalDeposited,

          volumeDeposited: '0',
          volumeWithdrawn: '0',
          volumeBorrowed: '0',
          volumeRepaid: '0',

          rateSupply: formatBigNumberToString(vaultData.exchangePricesAndRates.supplyRateVault.toString(), 4),
          rateBorrow: formatBigNumberToString(vaultData.exchangePricesAndRates.borrowRateVault.toString(), 4),

          addresses: [],
          transactions: [],
          collaterals: [],
        };

        const collateralData: IsolatedLendingCollateralData = {
          token: collateral,
          tokenPrice: collateralPrice ? collateralPrice : '0',

          totalDeposited: formatBigNumberToString(
            vaultData.totalSupplyAndBorrow.totalSupplyVault.toString(),
            collateral.decimals,
          ),

          volumeDeposited: '0',
          volumeWithdrawn: '0',
          volumeLiquidated: '0',

          rateLoanToValue: formatBigNumberToString(vaultData.configs.collateralFactor.toString(), 4),
        };

        const logs = await this.services.blockchain.getContractLogs({
          chain: marketConfig.chain,
          address: poolAddress,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });

        const addresses: { [key: string]: boolean } = {};
        const transactions: { [key: string]: boolean } = {};
        for (const log of logs) {
          const signature = log.topics[0];

          if (signature === FluidVaultEvents.LogOperate || signature === FluidVaultEvents.LogLiquidate) {
            const event: any = decodeEventLog({
              abi: FluidVaultT1Abi,
              topics: log.topics,
              data: log.data,
            });

            transactions[log.transactionHash] = true;
            for (const field of ['liquidator_', 'user_', '_to']) {
              if (event.args[field]) {
                addresses[normalizeAddress(event.args[field])] = true;
              }
            }

            const colAmount = new BigNumber(event.args.colAmt_.toString());
            const debtAmount = new BigNumber(event.args.debtAmt_.toString());

            if (signature === FluidVaultEvents.LogOperate) {
              const colAmount = new BigNumber(event.args.colAmt_.toString());
              const debtAmount = new BigNumber(event.args.debtAmt_.toString());

              if (debtAmount.gt(0)) {
                // borrow
                pool.volumeBorrowed = new BigNumber(pool.volumeBorrowed)
                  .plus(new BigNumber(formatBigNumberToString(debtAmount.toString(10), token.decimals)))
                  .toString(10);
              } else {
                // repay
                pool.volumeRepaid = new BigNumber(pool.volumeRepaid)
                  .plus(new BigNumber(formatBigNumberToString(debtAmount.toString(10), token.decimals)).abs())
                  .toString(10);
              }

              if (colAmount.gt(0)) {
                // deposit
                collateralData.volumeDeposited = new BigNumber(collateralData.volumeDeposited)
                  .plus(new BigNumber(formatBigNumberToString(colAmount.toString(10), collateral.decimals)))
                  .toString(10);
              } else {
                // withdraw
                collateralData.volumeWithdrawn = new BigNumber(collateralData.volumeWithdrawn)
                  .plus(new BigNumber(formatBigNumberToString(colAmount.toString(10), collateral.decimals)).abs())
                  .toString(10);
              }
            } else {
              // liquidate
              pool.volumeRepaid = new BigNumber(pool.volumeRepaid)
                .plus(new BigNumber(formatBigNumberToString(debtAmount.toString(10), token.decimals)).abs())
                .toString(10);
              collateralData.volumeLiquidated = new BigNumber(collateralData.volumeLiquidated)
                .plus(new BigNumber(formatBigNumberToString(colAmount.toString(10), collateral.decimals)))
                .toString(10);
            }
          }
        }

        pool.addresses = Object.keys(addresses);
        pool.transactions = Object.keys(transactions);
        pool.collaterals.push(collateralData);

        pools.push(pool);
      }
    }

    return pools;
  }
}
