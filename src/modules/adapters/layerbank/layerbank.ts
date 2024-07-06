import { CrossLendingMarketConfig, ProtocolConfig } from '../../../types/configs';
import { CrossLendingReserveDataTimeframe } from '../../../types/domains/crossLending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions } from '../../../types/options';
import CrossLendingProtocolAdapter from '../crossLending';
import CoreAbi from '../../../configs/abi/layerbank/Core.json';
import LTokenAbi from '../../../configs/abi/layerbank/LToken.json';
import PriceCalculatorAbi from '../../../configs/abi/layerbank/PriceCalculator.json';
import RateModelAbi from '../../../configs/abi/layerbank/RateModel.json';
import { ContractCall } from '../../../services/blockchains/domains';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import BigNumber from 'bignumber.js';
import { TimeUnits } from '../../../configs/constants';
import { LayerbankEventSignatures } from './abis';
import { decodeEventLog } from 'viem';

export default class LayerbankAdapter extends CrossLendingProtocolAdapter {
  public readonly name: string = 'adapter.layerbank';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getLendingReservesDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<Array<CrossLendingReserveDataTimeframe> | null> {
    const marketConfig = options.config as CrossLendingMarketConfig;

    // marketAddress => CrossLendingReserveDataTimeframe
    const reserves: { [key: string]: CrossLendingReserveDataTimeframe } = {};

    // make sure activities were synced
    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);
    const stateBlock = options.latestState ? endBlock : beginBlock;
    const stateTime = options.latestState ? options.toTime : options.fromTime;

    const [allMarkets, priceCalculator] = await this.services.blockchain.multicall({
      chain: marketConfig.chain,
      blockNumber: stateBlock,
      calls: [
        {
          abi: CoreAbi,
          target: marketConfig.address,
          method: 'allMarkets',
          params: [],
        },
        {
          abi: CoreAbi,
          target: marketConfig.address,
          method: 'priceCalculator',
          params: [],
        },
      ],
    });

    const coreContractLogs = await this.services.blockchain.getContractLogs({
      chain: marketConfig.chain,
      address: marketConfig.address,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    if (allMarkets && priceCalculator) {
      for (const marketAddress of allMarkets) {
        const calls: Array<ContractCall> = [
          {
            abi: LTokenAbi,
            target: marketAddress,
            method: 'underlying',
            params: [],
          },
          {
            abi: LTokenAbi,
            target: marketAddress,
            method: 'getRateModel',
            params: [],
          },
          {
            abi: CoreAbi,
            target: marketConfig.address,
            method: 'marketInfos',
            params: [marketAddress],
          },
          {
            abi: LTokenAbi,
            target: marketAddress,
            method: 'getCash',
            params: [],
          },
          {
            abi: LTokenAbi,
            target: marketAddress,
            method: 'totalBorrow',
            params: [],
          },
          {
            abi: LTokenAbi,
            target: marketAddress,
            method: 'totalReserve',
            params: [],
          },
          {
            abi: LTokenAbi,
            target: marketAddress,
            method: 'reserveFactor',
            params: [],
          },
          {
            abi: PriceCalculatorAbi,
            target: priceCalculator,
            method: 'getUnderlyingPrice',
            params: [marketAddress],
          },
        ];

        const [
          underlying,
          getRateModel,
          marketInfos,
          getCash,
          totalBorrow,
          totalReserve,
          reserveFactor,
          getUnderlyingPrice,
        ] = await this.services.blockchain.multicall({
          chain: marketConfig.chain,
          blockNumber: stateBlock,
          calls: calls,
        });

        const token = await this.services.blockchain.getTokenInfo({
          chain: marketConfig.chain,
          address: underlying,
        });
        if (token) {
          const tokenPrice = formatBigNumberToString(getUnderlyingPrice.toString(), 18);

          // totalDeposited = cash + totalBorrow - totalReserve
          const deposited = new BigNumber(getCash.toString(10))
            .plus(new BigNumber(totalBorrow.toString(10)))
            .minus(new BigNumber(totalReserve.toString(10)));
          const borrowed = new BigNumber(totalBorrow.toString(10));

          // rates per second
          const [borrowRate, supplyRate] = await this.services.blockchain.multicall({
            chain: marketConfig.chain,
            blockNumber: stateBlock,
            calls: [
              {
                abi: RateModelAbi,
                target: getRateModel,
                method: 'getBorrowRate',
                params: [getCash.toString(), totalBorrow.toString(), totalReserve.toString()],
              },
              {
                abi: RateModelAbi,
                target: getRateModel,
                method: 'getSupplyRate',
                params: [getCash.toString(), totalBorrow.toString(), totalReserve.toString(), reserveFactor.toString()],
              },
            ],
          });

          let volumeDeposited = '0';
          let volumeWithdrawn = '0';
          let volumeBorrowed = '0';
          let volumeRepaid = '0';
          let volumeLiquidated = '0';
          const addresses: { [key: string]: boolean } = {};
          const transactions: { [key: string]: boolean } = {};
          for (const log of coreContractLogs) {
            const signature = log.topics[0];
            if (
              signature === LayerbankEventSignatures.MarketSupply ||
              signature === LayerbankEventSignatures.MarketRedeem
            ) {
              const event: any = decodeEventLog({
                abi: CoreAbi,
                topics: log.topics,
                data: log.data,
              });

              if (compareAddress(marketAddress, event.args.lToken)) {
                transactions[log.transactionHash] = true;
                addresses[normalizeAddress(event.args.user)] = true;

                if (signature === LayerbankEventSignatures.MarketSupply) {
                  volumeDeposited = new BigNumber(volumeDeposited)
                    .plus(new BigNumber(formatBigNumberToString(event.args.uAmount.toString(), token.decimals)))
                    .toString(10);
                } else {
                  volumeWithdrawn = new BigNumber(volumeWithdrawn)
                    .plus(new BigNumber(formatBigNumberToString(event.args.uAmount.toString(), token.decimals)))
                    .toString(10);
                }
              }
            }
          }

          const marketContractLogs = await this.services.blockchain.getContractLogs({
            chain: marketConfig.chain,
            address: marketAddress,
            fromBlock: beginBlock,
            toBlock: endBlock,
          });
          for (const log of marketContractLogs) {
            const signature = log.topics[0];
            if (
              signature === LayerbankEventSignatures.Borrow ||
              signature === LayerbankEventSignatures.RepayBorrow ||
              signature === LayerbankEventSignatures.LiquidateBorrow
            ) {
              const event: any = decodeEventLog({
                abi: LTokenAbi,
                topics: log.topics,
                data: log.data,
              });

              transactions[log.transactionHash] = true;
              for (const field of ['account', 'borrower', 'payer', 'liquidator']) {
                if (event.args[field]) {
                  addresses[normalizeAddress(event.args[field])] = true;
                }
              }

              if (signature === LayerbankEventSignatures.Borrow) {
                volumeBorrowed = new BigNumber(volumeBorrowed)
                  .plus(new BigNumber(formatBigNumberToString(event.args.amount.toString(), token.decimals)))
                  .toString(10);
              } else if (signature === LayerbankEventSignatures.RepayBorrow) {
                volumeRepaid = new BigNumber(volumeRepaid)
                  .plus(new BigNumber(formatBigNumberToString(event.args.amount.toString(), token.decimals)))
                  .toString(10);
              } else {
                volumeRepaid = new BigNumber(volumeRepaid)
                  .plus(new BigNumber(formatBigNumberToString(event.args.amount.toString(), token.decimals)))
                  .toString(10);
              }
            }
          }

          reserves[normalizeAddress(marketAddress)] = {
            protocol: marketConfig.protocol,
            chain: marketConfig.chain,
            metric: marketConfig.metric,
            timestamp: stateTime,
            timefrom: options.fromTime,
            timeto: options.toTime,
            address: normalizeAddress(marketAddress),

            token: token,
            tokenPrice: tokenPrice,

            totalDeposited: formatBigNumberToString(deposited.toString(10), token.decimals),
            totalBorrowed: formatBigNumberToString(borrowed.toString(10), token.decimals),

            volumeDeposited: volumeDeposited,
            volumeWithdrawn: volumeWithdrawn,
            volumeBorrowed: volumeBorrowed,
            volumeRepaid: volumeRepaid,
            volumeLiquidated: volumeLiquidated,

            rateBorrow: formatBigNumberToString(
              new BigNumber(borrowRate.toString()).multipliedBy(TimeUnits.SecondsPerYear).toString(10),
              18,
            ),
            rateSupply: formatBigNumberToString(
              new BigNumber(supplyRate.toString()).multipliedBy(TimeUnits.SecondsPerYear).toString(10),
              18,
            ),
            rateLoanToValue: formatBigNumberToString(marketInfos[3].toString(), 18),
            rateReserveFactor: formatBigNumberToString(reserveFactor.toString(), 18),

            addresses: Object.keys(addresses),
            transactions: Object.keys(transactions),
          };
        }
      }
    }

    return Object.values(reserves);
  }
}
