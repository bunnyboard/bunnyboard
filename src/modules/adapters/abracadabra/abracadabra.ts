import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import CauldronV4Abi from '../../../configs/abi/abracadabra/CauldronV4.json';
import PeekOracleAbi from '../../../configs/abi/abracadabra/PeekOracle.json';
import { SolidityUnits, TimeUnits } from '../../../configs/constants';
import { AbracadabraCauldronConfig, AbracadabraMarketConfig } from '../../../configs/protocols/abracadabra';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { CdpLendingAssetDataTimeframe, CdpLendingCollateralData } from '../../../types/domains/cdpLending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions } from '../../../types/options';
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

interface CauldronData {
  totalBorrowed: string;
  totalDeposited: string;
  rateBorrow: string;
  rateBorrowOpenFee: string;
  rateLoanToValue: string;
}

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

  private async getCauldronData(cauldron: AbracadabraCauldronConfig, blockNumber: number): Promise<CauldronData> {
    if (cauldron.cauldronVersion === 1) {
      const [[, base], totalCollateralShare] = await this.services.blockchain.multicall({
        chain: cauldron.chain,
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

      return {
        totalBorrowed: formatBigNumberToString(base.toString(), 18),
        totalDeposited: formatBigNumberToString(totalCollateralShare.toString(), cauldron.collateralToken.decimals),
        rateBorrow: new BigNumber(Constants[cauldron.address].INTEREST_PER_SECOND.toString())
          .multipliedBy(TimeUnits.SecondsPerYear)
          .dividedBy(SolidityUnits.OneWad)
          .toString(10),
        rateBorrowOpenFee: formatBigNumberToString(Constants[cauldron.address].BORROW_OPENING_FEE.toString(), 5),
        rateLoanToValue: formatBigNumberToString(Constants[cauldron.address].COLLATERIZATION_RATE.toString(), 5),
      };
    } else {
      const [[, base], totalCollateralShare, [, , INTEREST_PER_SECOND], BORROW_OPENING_FEE, COLLATERIZATION_RATE] =
        await this.services.blockchain.multicall({
          chain: cauldron.chain,
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

      return {
        totalBorrowed: formatBigNumberToString(base.toString(), 18),
        totalDeposited: formatBigNumberToString(totalCollateralShare.toString(), cauldron.collateralToken.decimals),
        rateBorrow: new BigNumber(INTEREST_PER_SECOND.toString())
          .multipliedBy(TimeUnits.SecondsPerYear)
          .dividedBy(SolidityUnits.OneWad)
          .toString(10),
        rateBorrowOpenFee: formatBigNumberToString(BORROW_OPENING_FEE.toString(), 5),
        rateLoanToValue: formatBigNumberToString(COLLATERIZATION_RATE.toString(), 5),
      };
    }
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

  public async getLendingAssetData(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<CdpLendingAssetDataTimeframe | null> {
    const marketConfig: AbracadabraMarketConfig = options.config as AbracadabraMarketConfig;

    const { beginBlock, endBlock, stateTime, stateBlock, assetState } = await this.initialLendingAssetData(options);

    const logs = await this.getEventLogs({
      metricConfig: marketConfig,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    const addresses: any = {};
    const transactions: any = {};

    for (const cauldron of marketConfig.cauldrons) {
      if (cauldron.birthday > stateTime) {
        continue;
      }

      const oracleRate = await this.getCollateralOracleRate(cauldron, stateBlock);
      const collateralTokenPrice = oracleRate
        ? new BigNumber(assetState.tokenPrice) // MIM price
            .dividedBy(new BigNumber(formatBigNumberToString(oracleRate, cauldron.collateralToken.decimals)))
            .toString(10)
        : ' 0';

      const collateralDataState: CdpLendingCollateralData = {
        address: cauldron.address,
        token: cauldron.collateralToken,
        tokenPrice: collateralTokenPrice,
        totalBorrowed: '0',
        totalDeposited: '0',
        rateBorrow: '0',
        rateBorrowOpeningFee: '0',
        rateLoanToValue: '0',
        volumeDeposited: '0',
        volumeWithdrawn: '0',
        volumeLiquidated: '0',
      };

      const cauldronData = await this.getCauldronData(cauldron, stateBlock);

      assetState.totalBorrowed = new BigNumber(assetState.totalBorrowed)
        .plus(new BigNumber(cauldronData.totalBorrowed))
        .toString(10);
      collateralDataState.totalDeposited = cauldronData.totalDeposited;
      collateralDataState.rateBorrow = cauldronData.rateBorrow;
      collateralDataState.rateBorrowOpeningFee = cauldronData.rateBorrowOpenFee;
      collateralDataState.rateLoanToValue = cauldronData.rateLoanToValue;

      for (const log of logs.filter((item) => compareAddress(item.address, cauldron.address))) {
        const signature = log.topics[0];

        const event: any = decodeEventLog({
          abi: CauldronV4Abi,
          data: log.data,
          topics: log.topics,
        });

        transactions[log.transactionHash] = true;

        const fromAddress = event.args.from ? normalizeAddress(event.args.from) : null;
        const toAddress = event.args.to ? normalizeAddress(event.args.to) : null;
        const userAddress = event.args.user ? normalizeAddress(event.args.from) : null;
        if (fromAddress) {
          addresses[fromAddress] = true;
        }
        if (toAddress) {
          addresses[toAddress] = true;
        }
        if (userAddress) {
          addresses[userAddress] = true;
        }

        switch (signature) {
          case CauldronEventSignatures.LogBorrow:
          case CauldronEventSignatures.LogRepay: {
            const amount = formatBigNumberToString(event.args.amount.toString(), marketConfig.debtToken.decimals);

            if (signature === CauldronEventSignatures.LogBorrow) {
              assetState.volumeBorrowed = new BigNumber(assetState.volumeBorrowed)
                .plus(new BigNumber(amount))
                .toString(10);
            } else {
              assetState.volumeRepaid = new BigNumber(assetState.volumeRepaid).plus(new BigNumber(amount)).toString(10);
            }

            break;
          }
          case CauldronEventSignatures.LogAddCollateral:
          case CauldronEventSignatures.LogRemoveCollateral: {
            const amount = formatBigNumberToString(event.args.share.toString(), collateralDataState.token.decimals);

            if (signature === CauldronEventSignatures.LogAddCollateral) {
              collateralDataState.volumeDeposited = new BigNumber(collateralDataState.volumeDeposited)
                .plus(new BigNumber(amount))
                .toString(10);
            } else {
              collateralDataState.volumeWithdrawn = new BigNumber(collateralDataState.volumeWithdrawn)
                .plus(new BigNumber(amount))
                .toString(10);
            }

            break;
          }
          case CauldronEventSignatures.LogLiquidation: {
            const borrowAmount = formatBigNumberToString(
              event.args.borrowAmount.toString(),
              marketConfig.debtToken.decimals,
            );
            const collateralAmount = formatBigNumberToString(
              event.args.collateralShare.toString(),
              collateralDataState.token.decimals,
            );

            assetState.volumeRepaid = new BigNumber(assetState.volumeRepaid)
              .plus(new BigNumber(borrowAmount))
              .toString(10);
            collateralDataState.volumeLiquidated = new BigNumber(collateralDataState.volumeLiquidated)
              .plus(new BigNumber(collateralAmount))
              .toString(10);

            break;
          }
        }
      }

      assetState.collaterals.push(collateralDataState);
    }

    assetState.addresses = Object.keys(addresses);
    assetState.transactions = Object.keys(transactions);

    return assetState;
  }
}
