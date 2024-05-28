import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import ERC20Abi from '../../../configs/abi/ERC20.json';
import CrvusdControllerAbi from '../../../configs/abi/curve/CrvUsdController.json';
import LlammaAbi from '../../../configs/abi/curve/Llamma.json';
import { TimeUnits } from '../../../configs/constants';
import { CrvusdLendingMarketConfig } from '../../../configs/protocols/crvusd';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { CdpLendingAssetDataTimeframe, CdpLendingCollateralData } from '../../../types/domains/cdpLending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions } from '../../../types/options';
import { AdapterGetEventLogsOptions } from '../adapter';
import CdpLendingProtocolAdapter from '../cdpLending';
import { CrvusdEventSignatures } from './abis';

export default class CrvusdAdapter extends CdpLendingProtocolAdapter {
  public readonly name: string = 'adapter.crvusd';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getEventLogs(options: AdapterGetEventLogsOptions): Promise<Array<any>> {
    const marketConfig = options.metricConfig as CrvusdLendingMarketConfig;
    let logs: Array<any> = [];

    for (const llamma of marketConfig.llammas) {
      const rawlogs = await this.services.blockchain.getContractLogs({
        chain: marketConfig.chain,
        address: llamma.controller,
        fromBlock: options.fromBlock,
        toBlock: options.toBlock,
      });

      logs = logs.concat(rawlogs.filter((item) => Object.values(CrvusdEventSignatures).indexOf(item.topics[0]) !== -1));
    }

    return logs;
  }

  public async getLendingAssetData(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<CdpLendingAssetDataTimeframe | null> {
    const { beginBlock, endBlock, stateTime, stateBlock, assetState } = await this.initialLendingAssetData(options);

    const marketConfig = options.config as CrvusdLendingMarketConfig;

    const logs = await this.getEventLogs({
      metricConfig: marketConfig,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    const addresses: any = {};
    const transactions: any = {};

    for (const llamma of marketConfig.llammas) {
      if (llamma.birthday > stateTime) {
        continue;
      }

      const collateralDataState: CdpLendingCollateralData = {
        address: llamma.amm,
        token: llamma.collateralToken,
        tokenPrice: '0',
        totalBorrowed: '0',
        totalDeposited: '0',
        rateBorrow: '0',
        rateBorrowOpeningFee: '0',
        rateLoanToValue: '0',
        volumeDeposited: '0',
        volumeWithdrawn: '0',
        volumeLiquidated: '0',
      };

      const [total_debt, loan_discount] = await this.services.blockchain.multicall({
        chain: marketConfig.chain,
        blockNumber: stateBlock,
        calls: [
          {
            abi: CrvusdControllerAbi,
            target: llamma.controller,
            method: 'total_debt',
            params: [],
          },
          {
            abi: CrvusdControllerAbi,
            target: llamma.controller,
            method: 'loan_discount',
            params: [],
          },
        ],
      });

      const [A, rate, price_oracle, balance] = await this.services.blockchain.multicall({
        chain: marketConfig.chain,
        blockNumber: stateBlock,
        calls: [
          {
            abi: LlammaAbi,
            target: llamma.amm,
            method: 'A',
            params: [],
          },
          {
            abi: LlammaAbi,
            target: llamma.amm,
            method: 'rate',
            params: [],
          },
          {
            abi: LlammaAbi,
            target: llamma.amm,
            method: 'price_oracle',
            params: [],
          },
          {
            abi: ERC20Abi,
            target: llamma.collateralToken.address,
            method: 'balanceOf',
            params: [llamma.amm],
          },
        ],
      });

      // https://docs.curve.fi/crvUSD/amm/#rate
      const rateBorrow = new BigNumber(rate.toString()).multipliedBy(TimeUnits.SecondsPerYear).div(1e18).toString(10);

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

      const totalBorrow = new BigNumber(
        formatBigNumberToString(total_debt.toString(), marketConfig.debtToken.decimals),
      );
      assetState.totalBorrowed = new BigNumber(assetState.totalBorrowed).plus(totalBorrow).toString(10);
      assetState.feesPaid = new BigNumber(assetState.feesPaid)
        .plus(
          totalBorrow
            .multipliedBy(new BigNumber(rate.toString()).multipliedBy(options.toTime - options.fromTime))
            .dividedBy(1e18),
        )
        .toString(10);

      collateralDataState.tokenPrice = formatBigNumberToString(price_oracle.toString(), 18);
      collateralDataState.totalBorrowed = formatBigNumberToString(
        total_debt.toString(),
        marketConfig.debtToken.decimals,
      );
      collateralDataState.totalDeposited = formatBigNumberToString(balance.toString(), llamma.collateralToken.decimals);
      collateralDataState.rateBorrow = rateBorrow;
      collateralDataState.rateBorrowOpeningFee = '0';
      collateralDataState.rateLoanToValue = rateLoanToValue;

      for (const log of logs.filter((item) => compareAddress(item.address, llamma.controller))) {
        const signature = log.topics[0];
        const event: any = decodeEventLog({
          abi: CrvusdControllerAbi,
          data: log.data,
          topics: log.topics,
        });

        transactions[log.transactionHash] = true;
        const user = event.args.user ? normalizeAddress(event.args.user) : null;
        const liquidator = event.args.liquidator ? normalizeAddress(event.args.liquidator) : null;
        if (user) {
          addresses[user] = true;
        }
        if (liquidator) {
          addresses[liquidator] = true;
        }

        if (signature === CrvusdEventSignatures.Borrow) {
          collateralDataState.volumeDeposited = new BigNumber(collateralDataState.volumeDeposited)
            .plus(
              new BigNumber(
                formatBigNumberToString(event.args.collateral_increase.toString(), llamma.collateralToken.decimals),
              ),
            )
            .toString(10);
          assetState.volumeBorrowed = new BigNumber(assetState.volumeBorrowed)
            .plus(
              new BigNumber(
                formatBigNumberToString(event.args.loan_increase.toString(), marketConfig.debtToken.decimals),
              ),
            )
            .toString(10);
        } else if (signature === CrvusdEventSignatures.Repay) {
          collateralDataState.volumeWithdrawn = new BigNumber(collateralDataState.volumeWithdrawn)
            .plus(
              new BigNumber(
                formatBigNumberToString(event.args.collateral_decrease.toString(), llamma.collateralToken.decimals),
              ),
            )
            .toString(10);
          assetState.volumeRepaid = new BigNumber(assetState.volumeRepaid)
            .plus(
              new BigNumber(
                formatBigNumberToString(event.args.loan_decrease.toString(), marketConfig.debtToken.decimals),
              ),
            )
            .toString(10);
        } else if (signature === CrvusdEventSignatures.RemoveCollateral) {
          collateralDataState.volumeWithdrawn = new BigNumber(collateralDataState.volumeWithdrawn)
            .plus(
              new BigNumber(
                formatBigNumberToString(event.args.collateral_decrease.toString(), llamma.collateralToken.decimals),
              ),
            )
            .toString(10);
        } else if (signature === CrvusdEventSignatures.Liquidate) {
          assetState.volumeRepaid = new BigNumber(assetState.volumeRepaid)
            .plus(new BigNumber(formatBigNumberToString(event.args.debt.toString(), marketConfig.debtToken.decimals)))
            .toString(10);
          collateralDataState.volumeLiquidated = new BigNumber(collateralDataState.volumeLiquidated)
            .plus(
              new BigNumber(
                formatBigNumberToString(event.args.collateral_received.toString(), llamma.collateralToken.decimals),
              ),
            )
            .toString(10);
        }
      }

      assetState.collaterals.push(collateralDataState);
    }

    assetState.addresses = Object.keys(addresses);
    assetState.transactions = Object.keys(transactions);

    return assetState;
  }
}
