import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions } from '../../../types/options';
import IsolatedLendingProtocolAdapter from '../isolatedLending';
import {
  IsolatedLendingCollateralData,
  IsolatedLendingPoolDataTimeframe,
} from '../../../types/domains/isolatedLending';
import { CurvelendFactoryConfig } from '../../../configs/protocols/curvelend';
import OneWayLendingFactoryAbi from '../../../configs/abi/curve/OneWayLendingFactory.json';
import VaultAbi from '../../../configs/abi/curve/CurvelendVault.json';
import ControllerAbi from '../../../configs/abi/curve/CurvelendController.json';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import LlammaAbi from '../../../configs/abi/curve/Llamma.json';
import PriceOracleAbi from '../../../configs/abi/curve/PriceOracle.json';
import { formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

const VaultEvents = {
  Deposit: '0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7',
  Withdraw: '0xfbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db',
};

const ControllerEvents = {
  Borrow: '0xe1979fe4c35e0cef342fef5668e2c8e7a7e9f5d5d1ca8fee0ac6c427fa4153af',
  Repay: '0x77c6871227e5d2dec8dadd5354f78453203e22e669cd0ec4c19d9a8c5edb31d0',
  RemoveCollateral: '0xe25410a4059619c9594dc6f022fe231b02aaea733f689e7ab0cd21b3d4d0eb54',
  Liquidate: '0x642dd4d37ddd32036b9797cec464c0045dd2118c549066ae6b0f88e32240c2d0',
};

export default class CurvelendAdapter extends IsolatedLendingProtocolAdapter {
  public readonly name: string = 'adapter.curvelend';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getLendingPoolData(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<Array<IsolatedLendingPoolDataTimeframe> | null> {
    const marketConfig = options.config as CurvelendFactoryConfig;

    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    const stateTime = options.latestState ? options.toTime : options.fromTime;
    const stateBlock = options.latestState ? endBlock : beginBlock;

    const pools: Array<IsolatedLendingPoolDataTimeframe> = [];

    const marketCount = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: OneWayLendingFactoryAbi,
      target: marketConfig.address,
      method: 'market_count',
      params: [],
      blockNumber: stateBlock,
    });

    for (let i = 0; i < Number(marketCount); i++) {
      const [borrowed_token, collateral_token, price_oracle, vault, controller, amm] =
        await this.services.blockchain.multicall({
          chain: marketConfig.chain,
          blockNumber: stateBlock,
          calls: [
            {
              abi: OneWayLendingFactoryAbi,
              target: marketConfig.address,
              method: 'borrowed_tokens',
              params: [i],
            },
            {
              abi: OneWayLendingFactoryAbi,
              target: marketConfig.address,
              method: 'collateral_tokens',
              params: [i],
            },
            {
              abi: OneWayLendingFactoryAbi,
              target: marketConfig.address,
              method: 'price_oracles',
              params: [i],
            },
            {
              abi: OneWayLendingFactoryAbi,
              target: marketConfig.address,
              method: 'vaults',
              params: [i],
            },
            {
              abi: OneWayLendingFactoryAbi,
              target: marketConfig.address,
              method: 'controllers',
              params: [i],
            },
            {
              abi: OneWayLendingFactoryAbi,
              target: marketConfig.address,
              method: 'amms',
              params: [i],
            },
          ],
        });

      if (marketConfig.blacklists && marketConfig.blacklists.includes(normalizeAddress(vault))) {
        continue;
      }

      const borrowToken = await this.services.blockchain.getTokenInfo({
        chain: marketConfig.chain,
        address: borrowed_token,
      });
      const collateralToken = await this.services.blockchain.getTokenInfo({
        chain: marketConfig.chain,
        address: collateral_token,
      });

      if (borrowToken && collateralToken) {
        const tokenPrice = await this.services.oracle.getTokenPriceUsd({
          chain: marketConfig.chain,
          address: borrowed_token,
          timestamp: stateTime,
        });

        const [lend_apr, borrow_apr, totalAssets, total_debt, collateralBalance, A, loan_discount, price] =
          await this.services.blockchain.multicall({
            chain: marketConfig.chain,
            blockNumber: stateBlock,
            calls: [
              {
                abi: VaultAbi,
                target: vault,
                method: 'lend_apr',
                params: [],
              },
              {
                abi: VaultAbi,
                target: vault,
                method: 'borrow_apr',
                params: [],
              },
              {
                abi: VaultAbi,
                target: vault,
                method: 'totalAssets',
                params: [],
              },
              {
                abi: ControllerAbi,
                target: controller,
                method: 'total_debt',
                params: [],
              },
              {
                abi: Erc20Abi,
                target: collateralToken.address,
                method: 'balanceOf',
                params: [amm],
              },
              {
                abi: LlammaAbi,
                target: amm,
                method: 'A',
                params: [],
              },
              {
                abi: ControllerAbi,
                target: controller,
                method: 'loan_discount',
                params: [],
              },
              {
                abi: PriceOracleAbi,
                target: price_oracle,
                method: 'price',
                params: [],
              },
            ],
          });

        const borrowTokenPrice = tokenPrice ? tokenPrice : '0';
        const totalDeposited = formatBigNumberToString(totalAssets.toString(10), borrowToken.decimals);
        const totalBorrowed = formatBigNumberToString(total_debt.toString(10), borrowToken.decimals);
        const totalCollateralDeposited = formatBigNumberToString(
          collateralBalance.toString(10),
          collateralToken.decimals,
        );
        const collateralPrice = new BigNumber(formatBigNumberToString(price.toString(), 18))
          .multipliedBy(new BigNumber(borrowTokenPrice))
          .toString(10);

        // https://docs.curve.fi/crvUSD/controller/#creating-and-repaying-loans
        const loanDiscount = new BigNumber(loan_discount.toString()).multipliedBy(100).dividedBy(1e18);
        const numberOfBands = new BigNumber(10);
        const a = new BigNumber(A.toString());
        const one = new BigNumber(100);
        const rateLoanToValue = one
          .minus(loanDiscount)
          .minus(one.multipliedBy(numberOfBands.dividedBy(a.multipliedBy(2))))
          .dividedBy(one)
          .toString(10);

        const poolData: IsolatedLendingPoolDataTimeframe = {
          chain: marketConfig.chain,
          protocol: marketConfig.protocol,
          metric: marketConfig.metric,
          timestamp: stateTime,
          timefrom: options.fromTime,
          timeto: options.toTime,
          address: normalizeAddress(vault),

          token: borrowToken,
          tokenPrice: tokenPrice ? tokenPrice : '0',

          totalDeposited: totalDeposited,
          totalBorrowed: totalBorrowed,

          volumeDeposited: '0',
          volumeWithdrawn: '0',
          volumeBorrowed: '0',
          volumeRepaid: '0',

          rateSupply: formatBigNumberToString(lend_apr, 18),
          rateBorrow: formatBigNumberToString(borrow_apr, 18),

          addresses: [],
          transactions: [],
          collaterals: [],
        };

        const collateralData: IsolatedLendingCollateralData = {
          token: collateralToken,
          tokenPrice: collateralPrice,

          totalDeposited: totalCollateralDeposited,
          volumeDeposited: '0',
          volumeWithdrawn: '0',
          volumeLiquidated: '0',
          rateLoanToValue: rateLoanToValue,
        };

        let logs = await this.services.blockchain.getContractLogs({
          chain: marketConfig.chain,
          address: vault,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        logs = logs.concat(
          await this.services.blockchain.getContractLogs({
            chain: marketConfig.chain,
            address: controller,
            fromBlock: beginBlock,
            toBlock: endBlock,
          }),
        );

        const addresses: { [key: string]: boolean } = {};
        const transactions: { [key: string]: boolean } = {};
        for (const log of logs) {
          const signature = log.topics[0];
          if (Object.values(VaultEvents).includes(signature)) {
            const event: any = decodeEventLog({
              abi: VaultAbi,
              topics: log.topics,
              data: log.data,
            });

            transactions[log.transactionHash] = true;
            for (const field of ['sender', 'owner', 'receiver']) {
              if (event.args[field]) {
                addresses[normalizeAddress(event.args[field])] = true;
              }
            }

            if (signature === VaultEvents.Deposit) {
              poolData.volumeDeposited = new BigNumber(poolData.volumeDeposited)
                .plus(new BigNumber(formatBigNumberToString(event.args.assets.toString(), borrowToken.decimals)))
                .toString(10);
            }
            if (signature === VaultEvents.Withdraw) {
              poolData.volumeWithdrawn = new BigNumber(poolData.volumeWithdrawn)
                .plus(new BigNumber(formatBigNumberToString(event.args.assets.toString(), borrowToken.decimals)))
                .toString(10);
            }
          }

          if (Object.values(ControllerEvents).includes(signature)) {
            const event: any = decodeEventLog({
              abi: ControllerAbi,
              topics: log.topics,
              data: log.data,
            });

            transactions[log.transactionHash] = true;
            for (const field of ['user', 'liquidator']) {
              if (event.args[field]) {
                addresses[normalizeAddress(event.args[field])] = true;
              }
            }

            switch (signature) {
              case ControllerEvents.Borrow: {
                poolData.volumeBorrowed = new BigNumber(poolData.volumeBorrowed)
                  .plus(
                    new BigNumber(formatBigNumberToString(event.args.loan_increase.toString(), borrowToken.decimals)),
                  )
                  .toString(10);
                collateralData.volumeDeposited = new BigNumber(collateralData.volumeDeposited)
                  .plus(
                    new BigNumber(
                      formatBigNumberToString(event.args.collateral_increase.toString(), collateralToken.decimals),
                    ),
                  )
                  .toString(10);
                break;
              }
              case ControllerEvents.Repay: {
                poolData.volumeRepaid = new BigNumber(poolData.volumeRepaid)
                  .plus(
                    new BigNumber(formatBigNumberToString(event.args.loan_decrease.toString(), borrowToken.decimals)),
                  )
                  .toString(10);
                collateralData.volumeWithdrawn = new BigNumber(collateralData.volumeWithdrawn)
                  .plus(
                    new BigNumber(
                      formatBigNumberToString(event.args.collateral_decrease.toString(), collateralToken.decimals),
                    ),
                  )
                  .toString(10);
                break;
              }
              case ControllerEvents.RemoveCollateral: {
                collateralData.volumeWithdrawn = new BigNumber(collateralData.volumeWithdrawn)
                  .plus(
                    new BigNumber(
                      formatBigNumberToString(event.args.collateral_decrease.toString(), collateralToken.decimals),
                    ),
                  )
                  .toString(10);
                break;
              }
              case ControllerEvents.Liquidate: {
                poolData.volumeRepaid = new BigNumber(poolData.volumeRepaid)
                  .plus(new BigNumber(formatBigNumberToString(event.args.debt.toString(), borrowToken.decimals)))
                  .toString(10);
                collateralData.volumeLiquidated = new BigNumber(collateralData.volumeLiquidated)
                  .plus(
                    new BigNumber(
                      formatBigNumberToString(event.args.collateral_received.toString(), collateralToken.decimals),
                    ),
                  )
                  .toString(10);
                break;
              }
            }
          }
        }

        poolData.addresses = Object.keys(addresses);
        poolData.transactions = Object.keys(transactions);
        poolData.collaterals = [collateralData];

        pools.push(poolData);
      }
    }

    return pools;
  }
}
