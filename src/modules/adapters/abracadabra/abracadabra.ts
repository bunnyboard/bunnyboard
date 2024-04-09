import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import ERC20Abi from '../../../configs/abi/ERC20.json';
import CauldronV4Abi from '../../../configs/abi/abracadabra/CauldronV4.json';
import PeekOracleAbi from '../../../configs/abi/abracadabra/PeekOracle.json';
import { SolidityUnits, TimeUnits } from '../../../configs/constants';
import { AbracadabraCauldronConfig, AbracadabraMarketConfig } from '../../../configs/protocols/abracadabra';
import { formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig, Token } from '../../../types/configs';
import {
  CdpLendingAssetDataState,
  CdpLendingAssetDataTimeframe,
  CdpLendingCollateralDataTimeframe,
} from '../../../types/domains/cdpLending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataStateOptions, GetAdapterDataTimeframeOptions } from '../../../types/options';
import { AdapterGetEventLogsOptions } from '../adapter';
import CdpLendingProtocolAdapter from '../cdpLending';
import { CauldronEventSignatures } from './abis';

const Constants: any = {
  '0x551a7cff4de931f32893c928bbc3d25bf1fc5147': {
    INTEREST_PER_SECOND: '253509908',
    COLLATERIZATION_RATE: '90000',
    BORROW_OPENING_FEE: '50',
  },
  '0x6cbafee1fab76ca5b5e144c43b3b50d42b7c8c8f': {
    INTEREST_PER_SECOND: '253509908',
    COLLATERIZATION_RATE: '90000',
    BORROW_OPENING_FEE: '50',
  },
  '0xffbf4892822e0d552cff317f65e1ee7b5d3d9ae6': {
    INTEREST_PER_SECOND: '475331078',
    COLLATERIZATION_RATE: '75000',
    BORROW_OPENING_FEE: '50',
  },
  '0x6ff9061bb8f97d948942cef376d98b51fa38b91f': {
    INTEREST_PER_SECOND: '475331078',
    COLLATERIZATION_RATE: '75000',
    BORROW_OPENING_FEE: '50',
  },
  '0xbb02a884621fb8f5bfd263a67f58b65df5b090f3': {
    INTEREST_PER_SECOND: '475331078',
    COLLATERIZATION_RATE: '75000',
    BORROW_OPENING_FEE: '50',
  },
};

export default class AbracadabraAdapter extends CdpLendingProtocolAdapter {
  public readonly name: string = 'adapter.abracadabra';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  private async getCollateralOracleRate(
    cauldron: AbracadabraCauldronConfig,
    blockNumber: number,
  ): Promise<string | null> {
    const [oracle, oracleData] = await this.services.blockchain.multicall({
      chain: cauldron.chain,
      blockNumber: blockNumber,
      calls: [
        {
          target: cauldron.address,
          abi: CauldronV4Abi,
          method: 'oracle',
          params: [],
        },
        {
          target: cauldron.address,
          abi: CauldronV4Abi,
          method: 'oracleData',
          params: [],
        },
      ],
    });
    if (oracle && oracleData) {
      const peekData = await this.services.blockchain.readContract({
        chain: cauldron.chain,
        target: oracle.toString(),
        abi: PeekOracleAbi,
        method: 'peek',
        params: [oracleData],
        blockNumber: blockNumber,
      });
      if (peekData) {
        return peekData[1].toString();
      }
    }
    return null;
  }

  public async getLendingAssetDataState(options: GetAdapterDataStateOptions): Promise<CdpLendingAssetDataState | null> {
    const blockNumber = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.timestamp,
    );

    const marketConfig: AbracadabraMarketConfig = options.config as AbracadabraMarketConfig;
    const debtToken = marketConfig.debtToken as Token;
    const debtTokenPrice = await this.services.oracle.getTokenPriceUsd({
      chain: debtToken.chain,
      address: debtToken.address,
      timestamp: options.timestamp,
    });

    if (!debtTokenPrice) {
      return null;
    }

    const totalSupply = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: ERC20Abi,
      target: marketConfig.address,
      method: 'totalSupply',
      params: [],
      blockNumber: blockNumber,
    });

    const assetState: CdpLendingAssetDataState = {
      chain: options.config.chain,
      protocol: options.config.protocol,
      metric: options.config.metric,
      timestamp: options.timestamp,
      token: debtToken,
      tokenPrice: debtTokenPrice ? debtTokenPrice : '0',
      totalBorrowed: '0',
      totalSupply: formatBigNumberToString(totalSupply.toString(), debtToken.decimals),
      collaterals: [],
    };

    for (const cauldron of marketConfig.cauldrons) {
      if (cauldron.birthday > options.timestamp) {
        continue;
      }

      const oracleRate = await this.getCollateralOracleRate(cauldron, blockNumber);
      const collateralTokenPrice = oracleRate
        ? new BigNumber(debtTokenPrice)
            .dividedBy(new BigNumber(formatBigNumberToString(oracleRate, cauldron.collateralToken.decimals)))
            .toString(10)
        : ' 0';

      if (cauldron.cauldronVersion === 1) {
        const [[, base], totalCollateralShare] = await this.services.blockchain.multicall({
          chain: marketConfig.chain,
          blockNumber: blockNumber,
          calls: [
            {
              target: cauldron.address,
              abi: CauldronV4Abi,
              method: 'totalBorrow',
              params: [],
            },
            {
              target: cauldron.address,
              abi: CauldronV4Abi,
              method: 'totalCollateralShare',
              params: [],
            },
          ],
        });

        assetState.totalBorrowed = new BigNumber(assetState.totalBorrowed)
          .plus(new BigNumber(formatBigNumberToString(base.toString(), debtToken.decimals)))
          .toString(10);

        const rateBorrow = new BigNumber(Constants[cauldron.address].INTEREST_PER_SECOND.toString())
          .multipliedBy(TimeUnits.SecondsPerYear)
          .dividedBy(SolidityUnits.OneWad)
          .toString(10);
        const rateBorrowFee = formatBigNumberToString(Constants[cauldron.address].BORROW_OPENING_FEE.toString(), 5);
        const rateLoanToValue = formatBigNumberToString(Constants[cauldron.address].COLLATERIZATION_RATE.toString(), 5);

        assetState.collaterals.push({
          chain: marketConfig.chain,
          protocol: marketConfig.protocol,
          metric: options.config.metric,
          timestamp: options.timestamp,
          address: cauldron.address,
          token: cauldron.collateralToken,
          tokenPrice: collateralTokenPrice,
          totalBorrowed: formatBigNumberToString(base.toString(), debtToken.decimals),
          totalDeposited: formatBigNumberToString(totalCollateralShare.toString(), cauldron.collateralToken.decimals),
          rateBorrow: rateBorrow,
          rateBorrowFee: rateBorrowFee,
          rateLoanToValue: rateLoanToValue,
        });
      } else {
        const [[, base], totalCollateralShare, [, , INTEREST_PER_SECOND], BORROW_OPENING_FEE, COLLATERIZATION_RATE] =
          await this.services.blockchain.multicall({
            chain: marketConfig.chain,
            blockNumber: blockNumber,
            calls: [
              {
                target: cauldron.address,
                abi: CauldronV4Abi,
                method: 'totalBorrow',
                params: [],
              },
              {
                target: cauldron.address,
                abi: CauldronV4Abi,
                method: 'totalCollateralShare',
                params: [],
              },
              {
                target: cauldron.address,
                abi: CauldronV4Abi,
                method: 'accrueInfo',
                params: [],
              },
              {
                target: cauldron.address,
                abi: CauldronV4Abi,
                method: 'BORROW_OPENING_FEE',
                params: [],
              },
              {
                target: cauldron.address,
                abi: CauldronV4Abi,
                method: 'COLLATERIZATION_RATE',
                params: [],
              },
            ],
          });
        assetState.totalBorrowed = new BigNumber(assetState.totalBorrowed)
          .plus(new BigNumber(formatBigNumberToString(base.toString(), debtToken.decimals)))
          .toString(10);

        const rateBorrow = new BigNumber(INTEREST_PER_SECOND.toString())
          .multipliedBy(TimeUnits.SecondsPerYear)
          .dividedBy(SolidityUnits.OneWad)
          .toString(10);
        const rateBorrowFee = formatBigNumberToString(BORROW_OPENING_FEE.toString(), 5);
        const rateLoanToValue = formatBigNumberToString(COLLATERIZATION_RATE.toString(), 5);

        assetState.collaterals.push({
          chain: marketConfig.chain,
          protocol: marketConfig.protocol,
          metric: options.config.metric,
          timestamp: options.timestamp,
          address: cauldron.address,
          token: cauldron.collateralToken,
          tokenPrice: collateralTokenPrice,
          totalBorrowed: formatBigNumberToString(base.toString(), debtToken.decimals),
          totalDeposited: formatBigNumberToString(totalCollateralShare.toString(), cauldron.collateralToken.decimals),
          rateBorrow: rateBorrow,
          rateBorrowFee: rateBorrowFee,
          rateLoanToValue: rateLoanToValue,
        });
      }
    }

    return assetState;
  }

  public async getEventLogs(options: AdapterGetEventLogsOptions): Promise<Array<any>> {
    const marketConfig = options.metricConfig as AbracadabraMarketConfig;

    const logs: Array<any> = [];

    for (const cauldron of marketConfig.cauldrons) {
      const rawlogs = await this.services.blockchain.getContractLogs({
        chain: cauldron.chain,
        address: cauldron.address,
        fromBlock: options.fromBlock,
        toBlock: options.toBlock,
      });
      for (const rawlog of rawlogs) {
        if (Object.values(CauldronEventSignatures).indexOf(rawlog.topics[0]) !== -1) {
          logs.push(rawlog);
        }
      }
    }

    return logs;
  }

  public async getLendingAssetDataTimeframe(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<CdpLendingAssetDataTimeframe | null> {
    const stateData = await this.getLendingAssetDataState({
      config: options.config,
      timestamp: options.fromTime,
    });
    if (!stateData) {
      return null;
    }

    const snapshot: CdpLendingAssetDataTimeframe = {
      ...stateData,
      timefrom: options.fromTime,
      timeto: options.toTime,
      volumeBorrowed: '0',
      volumeRepaid: '0',
      addresses: [],
      transactions: [],
      collaterals: [],
    };

    // make sure activities were synced
    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    const logs = await this.getEventLogs({
      metricConfig: options.config,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    const marketConfig = options.config as AbracadabraMarketConfig;

    const addresses: { [key: string]: boolean } = {};
    const transactions: { [key: string]: boolean } = {};
    const collaterals: { [key: string]: CdpLendingCollateralDataTimeframe } = {};

    // initial collaterals
    for (const collateral of stateData.collaterals) {
      collaterals[collateral.address] = {
        ...collateral,

        timefrom: options.fromTime,
        timeto: options.toTime,
        volumeDeposited: '0',
        volumeWithdrawn: '0',
        volumeLiquidated: '0',
      };
    }

    for (const log of logs) {
      const address = normalizeAddress(log.address);
      try {
        const transactionHash = log.transactionHash;
        if (!transactions[transactionHash]) {
          transactions[transactionHash] = true;
        }

        const event: any = decodeEventLog({
          abi: CauldronV4Abi,
          data: log.data,
          topics: log.topics,
        });
        const signature = log.topics[0];
        switch (signature) {
          case CauldronEventSignatures.LogBorrow:
          case CauldronEventSignatures.LogRepay: {
            const fromAddress = normalizeAddress(event.args.from);
            const toAddress = normalizeAddress(event.args.to);
            if (!addresses[fromAddress]) {
              addresses[fromAddress] = true;
            }
            if (!addresses[toAddress]) {
              addresses[toAddress] = true;
            }

            const amount = formatBigNumberToString(event.args.amount.toString(), marketConfig.debtToken.decimals);

            if (signature === CauldronEventSignatures.LogBorrow) {
              snapshot.volumeBorrowed = new BigNumber(snapshot.volumeBorrowed).plus(new BigNumber(amount)).toString(10);
            } else {
              snapshot.volumeRepaid = new BigNumber(snapshot.volumeRepaid).plus(new BigNumber(amount)).toString(10);
            }

            break;
          }
          case CauldronEventSignatures.LogAddCollateral:
          case CauldronEventSignatures.LogRemoveCollateral: {
            const fromAddress = normalizeAddress(event.args.from);
            const toAddress = normalizeAddress(event.args.to);
            if (!addresses[fromAddress]) {
              addresses[fromAddress] = true;
            }
            if (!addresses[toAddress]) {
              addresses[toAddress] = true;
            }

            const amount = formatBigNumberToString(event.args.share.toString(), collaterals[address].token.decimals);

            if (signature === CauldronEventSignatures.LogAddCollateral) {
              collaterals[address].volumeDeposited = new BigNumber(collaterals[address].volumeDeposited)
                .plus(new BigNumber(amount))
                .toString(10);
            } else {
              collaterals[address].volumeWithdrawn = new BigNumber(collaterals[address].volumeWithdrawn)
                .plus(new BigNumber(amount))
                .toString(10);
            }

            break;
          }
          case CauldronEventSignatures.LogLiquidation: {
            const fromAddress = normalizeAddress(event.args.from);
            const toAddress = normalizeAddress(event.args.to);
            const userAddress = normalizeAddress(event.args.user);
            if (!addresses[fromAddress]) {
              addresses[fromAddress] = true;
            }
            if (!addresses[toAddress]) {
              addresses[toAddress] = true;
            }
            if (!addresses[userAddress]) {
              addresses[userAddress] = true;
            }

            const borrowAmount = formatBigNumberToString(
              event.args.borrowAmount.toString(),
              marketConfig.debtToken.decimals,
            );
            const collateralAmount = formatBigNumberToString(
              event.args.collateralShare.toString(),
              collaterals[address].token.decimals,
            );

            snapshot.volumeRepaid = new BigNumber(snapshot.volumeRepaid).plus(new BigNumber(borrowAmount)).toString(10);
            collaterals[address].volumeLiquidated = new BigNumber(collaterals[address].volumeLiquidated)
              .plus(new BigNumber(collateralAmount))
              .toString(10);

            break;
          }
        }
      } catch (e: any) {}
    }

    snapshot.collaterals = Object.values(collaterals);
    snapshot.addresses = Object.keys(addresses);
    snapshot.transactions = Object.keys(transactions);

    return snapshot;
  }
}
