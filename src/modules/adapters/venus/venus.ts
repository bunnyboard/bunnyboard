import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import vTokenAbi from '../../../configs/abi/venus/vToken.json';
import vTokenV2Abi from '../../../configs/abi/venus/vTokenV2.json';
import { CompoundLendingMarketConfig } from '../../../configs/protocols/compound';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ActivityActions } from '../../../types/base';
import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { TransformEventLogOptions, TransformEventLogResult } from '../../../types/options';
import CompoundLibs from '../../libs/compound';
import CompoundWithOracleAdapter from '../compound/compoundWithOracle';
import { VenusEventSignatures } from './abis';

export default class VenusAdapter extends CompoundWithOracleAdapter {
  public readonly name: string = 'adapter.venus';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async transformEventLogs(options: TransformEventLogOptions): Promise<TransformEventLogResult> {
    const result: TransformEventLogResult = {
      activities: [],
    };

    const allCTokens = await CompoundLibs.getComptrollerInfo(options.config as CompoundLendingMarketConfig);
    const allContracts = [...allCTokens.map((item) => normalizeAddress(item.cToken)), options.config.address];

    for (const log of options.logs) {
      const signature = log.topics[0];
      const address = normalizeAddress(log.address);

      if (Object.values(VenusEventSignatures).indexOf(signature) !== -1 && allContracts.indexOf(address) !== -1) {
        const cToken = allCTokens.filter((item) => compareAddress(item.cToken, address))[0];
        if (cToken) {
          let event: any;
          if (signature === VenusEventSignatures.MintV2 || signature === VenusEventSignatures.MintBehalf) {
            try {
              event = decodeEventLog({
                abi: vTokenAbi,
                data: log.data,
                topics: log.topics,
              });
            } catch (e: any) {
              event = decodeEventLog({
                abi: vTokenV2Abi,
                data: log.data,
                topics: log.topics,
              });
            }
          } else {
            try {
              event = decodeEventLog({
                abi: this.abiConfigs.eventAbis.cErc20,
                data: log.data,
                topics: log.topics,
              });
            } catch (e: any) {
              event = decodeEventLog({
                abi: vTokenV2Abi,
                data: log.data,
                topics: log.topics,
              });
            }
          }

          if (signature !== VenusEventSignatures.Liquidate) {
            let action = '';
            let user = '';
            let tokenAmount = '';

            switch (signature) {
              case VenusEventSignatures.Mint: {
                action = ActivityActions.deposit;
                user = normalizeAddress(event.args.minter);
                tokenAmount = formatBigNumberToString(event.args.mintAmount.toString(), cToken.underlying.decimals);
                break;
              }
              case VenusEventSignatures.MintV2: {
                action = ActivityActions.deposit;
                user = normalizeAddress(event.args.minter);
                tokenAmount = formatBigNumberToString(event.args.mintAmount.toString(), cToken.underlying.decimals);
                break;
              }
              case VenusEventSignatures.MintBehalf: {
                action = ActivityActions.deposit;
                user = normalizeAddress(event.args.payer);
                tokenAmount = formatBigNumberToString(event.args.mintAmount.toString(), cToken.underlying.decimals);
                break;
              }
              case VenusEventSignatures.Redeem: {
                action = ActivityActions.withdraw;
                user = normalizeAddress(event.args.redeemer);
                tokenAmount = formatBigNumberToString(event.args.redeemAmount.toString(), cToken.underlying.decimals);
                break;
              }
              case VenusEventSignatures.Borrow: {
                action = ActivityActions.borrow;
                user = normalizeAddress(event.args.borrower);
                tokenAmount = formatBigNumberToString(event.args.borrowAmount.toString(), cToken.underlying.decimals);
                break;
              }
              case VenusEventSignatures.Repay: {
                action = ActivityActions.repay;
                user = normalizeAddress(event.args.payer);
                tokenAmount = formatBigNumberToString(event.args.repayAmount.toString(), cToken.underlying.decimals);
                break;
              }
            }

            result.activities.push({
              chain: options.chain,
              protocol: options.config.protocol,
              address: address,
              transactionHash: log.transactionHash,
              logIndex: log.logIndex.toString(),
              blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
              action: action,
              user: user,
              token: cToken.underlying,
              tokenAmount: tokenAmount,
            });
          } else {
            const user = normalizeAddress(event.args.liquidator);
            const tokenAmount = formatBigNumberToString(event.args.repayAmount.toString(), cToken.underlying.decimals);

            // get collateral info
            const cTokenCollateral = allCTokens.filter((item) =>
              compareAddress(item.cToken, event.args.cTokenCollateral),
            )[0];
            if (cTokenCollateral) {
              const seizeTokens = new BigNumber(event.args.seizeTokens.toString());

              // we get the current exchange rate
              const exchangeRateCurrent = await this.services.blockchain.readContract({
                chain: options.chain,
                abi: this.abiConfigs.eventAbis.cErc20,
                target: cTokenCollateral.cToken,
                method: 'exchangeRateCurrent',
                params: [],
                blockNumber: log.blockNumber,
              });
              if (exchangeRateCurrent) {
                const mantissa = 18 + cTokenCollateral.underlying.decimals - 8;
                const oneCTokenInUnderlying = new BigNumber(exchangeRateCurrent).dividedBy(
                  new BigNumber(10).pow(mantissa),
                );
                const collateralAmount = seizeTokens.multipliedBy(oneCTokenInUnderlying).dividedBy(1e8).toString(10);

                result.activities.push({
                  chain: options.chain,
                  protocol: options.config.protocol,
                  address: address,
                  transactionHash: log.transactionHash,
                  logIndex: log.logIndex.toString(),
                  blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
                  action: ActivityActions.repay,
                  user: user,
                  token: cToken.underlying,
                  tokenAmount: tokenAmount,
                });

                result.activities.push({
                  chain: options.chain,
                  protocol: options.config.protocol,
                  address: address,
                  transactionHash: log.transactionHash,
                  logIndex: log.logIndex.toString(),
                  blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
                  action: ActivityActions.liquidate,
                  user: user,
                  token: cTokenCollateral.underlying,
                  tokenAmount: collateralAmount,
                });
              }
            }
          }
        }
      }
    }

    return result;
  }
}
