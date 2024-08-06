import VaultResolverAbi from '../../../configs/abi/fluid/VaultResolver.json';
import LiquidityResolverAbi from '../../../configs/abi/fluid/LiquidityResolver.json';
import { DataMetrics, ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions } from '../../../types/options';
import { FluidLendingConfig } from '../../../configs/protocols/fluid';
import CrossLendingProtocolAdapter from '../crossLending';
import { CrossLendingReserveDataTimeframe } from '../../../types/domains/crossLending';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { AddressE, AddressZero } from '../../../configs/constants';
import { decodeEventLog } from 'viem';
import FluidVaultT1Abi from '../../../configs/abi/fluid/FluidVaultT1.json';
import BigNumber from 'bignumber.js';
import USerModuleAbi from '../../../configs/abi/fluid/UserModule.json';

export const FluidVaultEvents = {
  // event on Liquidity contract
  LogOperate: '0x4d93b232a24e82b284ced7461bf4deacffe66759d5c24513e6f29e571ad78d15',

  // events on vault contracts
  LogLiquidate: '0x80fd9cc6b1821f4a510e45ffce6852ea3404807b5d3d833ffa85664408afcb66',
};

export default class FluidAdapter extends CrossLendingProtocolAdapter {
  public readonly name: string = 'adapter.fluid 🌊';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getLendingReservesDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<Array<CrossLendingReserveDataTimeframe> | null> {
    const marketConfig = options.config as FluidLendingConfig;

    if (marketConfig.metric !== DataMetrics.crossLending) {
      return null;
    }

    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    const stateTime = options.latestState ? options.toTime : options.fromTime;
    const stateBlock = options.latestState ? endBlock : beginBlock;

    const [listedTokens, getAllOverallTokensData, getVaultsEntireData] = await this.services.blockchain.multicall({
      chain: marketConfig.chain,
      blockNumber: stateBlock,
      calls: [
        {
          target: marketConfig.liquidityResolver,
          abi: LiquidityResolverAbi,
          method: 'listedTokens',
          params: [],
        },
        {
          target: marketConfig.liquidityResolver,
          abi: LiquidityResolverAbi,
          method: 'getAllOverallTokensData',
          params: [],
        },
        {
          target: marketConfig.vaultResolver,
          abi: VaultResolverAbi,
          method: 'getVaultsEntireData',
          params: [],
        },
      ],
    });

    const logs = await this.services.blockchain.getContractLogs({
      chain: marketConfig.chain,
      address: marketConfig.address, // liquidity contract
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    let liquidationLogs: Array<any> = [];
    for (const vault of getVaultsEntireData) {
      const rawlogs = await this.services.blockchain.getContractLogs({
        chain: marketConfig.chain,
        address: vault.vault,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      liquidationLogs = liquidationLogs.concat(
        rawlogs.filter((item) => item.topics[0] === FluidVaultEvents.LogLiquidate),
      );
    }

    const reserves: { [key: string]: CrossLendingReserveDataTimeframe } = {};
    for (let i = 0; i < listedTokens.length; i++) {
      const token = await this.services.blockchain.getTokenInfo({
        chain: marketConfig.chain,
        address: listedTokens[i],
      });
      if (token) {
        const tokenPrice = await this.services.oracle.getTokenPriceUsd({
          chain: token.chain,
          address: token.address,
          timestamp: stateTime,
        });

        const supplyRate = formatBigNumberToString(getAllOverallTokensData[i].supplyRate.toString(), 4);
        const borrowRate = formatBigNumberToString(getAllOverallTokensData[i].borrowRate.toString(), 4);
        const reserveFactorRate = formatBigNumberToString(getAllOverallTokensData[i].fee.toString(), 4);

        const totalDeposited = formatBigNumberToString(
          getAllOverallTokensData[i].totalSupply.toString(),
          token.decimals,
        );
        const totalBorrowed = formatBigNumberToString(
          getAllOverallTokensData[i].totalBorrow.toString(),
          token.decimals,
        );

        let rateLoanToValue = '0';
        for (const vaultData of getVaultsEntireData) {
          let collateral = vaultData.constantVariables.supplyToken;
          if (compareAddress(collateral, AddressE)) {
            collateral = AddressZero;
          }

          if (compareAddress(token.address, collateral)) {
            rateLoanToValue = formatBigNumberToString(vaultData.configs.collateralFactor, 4);
          }
        }

        let volumeDeposited = '0';
        let volumeWithdrawn = '0';
        let volumeBorrowed = '0';
        let volumeRepaid = '0';
        const addresses: { [key: string]: boolean } = {};
        const transactions: { [key: string]: boolean } = {};
        for (const log of logs) {
          const signature = log.topics[0];
          if (signature === FluidVaultEvents.LogOperate) {
            const event: any = decodeEventLog({
              abi: USerModuleAbi,
              topics: log.topics,
              data: log.data,
            });

            let tokenAddress = normalizeAddress(event.args.token);
            if (compareAddress(tokenAddress, AddressE)) {
              tokenAddress = AddressZero;
            }

            if (compareAddress(token.address, tokenAddress)) {
              transactions[log.transactionHash] = true;
              addresses[normalizeAddress(event.args.user)] = true;

              const supplyAmount = new BigNumber(event.args.supplyAmount.toString());
              const borrowAmount = new BigNumber(event.args.borrowAmount.toString());

              if (supplyAmount.gt(0)) {
                // deposit
                volumeDeposited = new BigNumber(volumeDeposited)
                  .plus(new BigNumber(formatBigNumberToString(supplyAmount.toString(10), token.decimals)).abs())
                  .toString(10);
              } else {
                // withdrawn
                volumeWithdrawn = new BigNumber(volumeWithdrawn)
                  .plus(new BigNumber(formatBigNumberToString(supplyAmount.toString(10), token.decimals)).abs())
                  .toString(10);
              }

              if (borrowAmount.gt(0)) {
                // borrow
                volumeBorrowed = new BigNumber(volumeBorrowed)
                  .plus(new BigNumber(formatBigNumberToString(borrowAmount.toString(10), token.decimals)).abs())
                  .toString(10);
              } else {
                // repay
                volumeRepaid = new BigNumber(volumeRepaid)
                  .plus(new BigNumber(formatBigNumberToString(borrowAmount.toString(10), token.decimals)).abs())
                  .toString(10);
              }
            }
          }
        }

        let volumeLiquidated = '0';
        for (const liquidationLog of liquidationLogs) {
          const event: any = decodeEventLog({
            abi: FluidVaultT1Abi,
            topics: liquidationLog.topics,
            data: liquidationLog.data,
          });

          const vaultData = getVaultsEntireData.filter((item: any) =>
            compareAddress(item.vault, liquidationLog.address),
          )[0];
          if (vaultData) {
            let supplyToken = normalizeAddress(vaultData.constantVariables.supplyToken);
            if (compareAddress(supplyToken, AddressE)) {
              supplyToken = AddressZero;
            }

            if (compareAddress(supplyToken, token.address)) {
              volumeLiquidated = new BigNumber(volumeLiquidated)
                .plus(new BigNumber(formatBigNumberToString(event.args.colAmt_.toString(10), token.decimals)))
                .toString(10);
            }
          }
        }

        reserves[token.address] = {
          chain: marketConfig.chain,
          protocol: marketConfig.protocol,
          metric: marketConfig.metric,
          address: normalizeAddress(marketConfig.address),
          timefrom: options.fromTime,
          timeto: options.toTime,
          timestamp: stateTime,

          token: token,
          tokenPrice: tokenPrice ? tokenPrice : '0',
          totalDeposited: totalDeposited,
          totalBorrowed: totalBorrowed,

          rateSupply: supplyRate,
          rateBorrow: borrowRate,
          rateLoanToValue: rateLoanToValue,
          rateReserveFactor: reserveFactorRate,

          volumeDeposited: volumeDeposited,
          volumeWithdrawn: volumeWithdrawn,
          volumeBorrowed: volumeBorrowed,
          volumeRepaid: volumeRepaid,
          volumeLiquidated: volumeLiquidated,

          addresses: Object.keys(addresses),
          transactions: Object.keys(transactions),
        };
      }
    }

    return Object.values(reserves);
  }
}
