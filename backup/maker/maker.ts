import BigNumber from 'bignumber.js';
import { decodeAbiParameters, decodeEventLog } from 'viem';

import Erc20Abi from '../../../configs/abi/ERC20.json';
import AuthGemJoinAbi from '../../../configs/abi/maker/AuthGemJoin.json';
import GemJoinAbi from '../../../configs/abi/maker/GemJoin.json';
import JugAbi from '../../../configs/abi/maker/Jug.json';
import SpotAbi from '../../../configs/abi/maker/Spot.json';
import VatAbi from '../../../configs/abi/maker/Vat.json';
import { DAY, ONE_RAY, RAY_DECIMALS, YEAR } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { MakerLendingMarketConfig } from '../../../configs/protocols/maker';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { DataMetrics, ProtocolConfig, Token } from '../../../types/configs';
import { ActivityActions, TokenAmountEntry } from '../../../types/domains/base';
import { LendingActivityEvent, LendingMarketState } from '../../../types/domains/lending';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import {
  GetAdapterDataOptions,
  GetAdapterEventLogsOptions,
  GetSnapshotDataResult,
  GetStateDataResult,
  TransformEventLogOptions,
  TransformEventLogResult,
} from '../../../types/options';
import ProtocolAdapter from '../adapter';
import { MakerEventInterfaces, MakerEventSignatures } from './abis';

export default class MakerAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.maker';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = MakerEventSignatures;
    this.abiConfigs.eventAbis = {
      gemJoin: GemJoinAbi,
      authGemJoin: AuthGemJoinAbi,
      vat: VatAbi,
      spot: SpotAbi,
      jug: JugAbi,
    };
  }

  public async getStateData(options: GetAdapterDataOptions): Promise<GetStateDataResult> {
    const result: GetStateDataResult = {
      data: [],
    };

    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );

    const marketConfig: MakerLendingMarketConfig = options.config as MakerLendingMarketConfig;
    const debtToken = marketConfig.debtToken as Token;

    const gem = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: this.abiConfigs.eventAbis.gemJoin,
      target: marketConfig.address,
      method: 'gem',
      params: [],
    });
    const ilk = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: this.abiConfigs.eventAbis.gemJoin,
      target: marketConfig.address,
      method: 'ilk',
      params: [],
    });

    const collateralToken = await this.services.blockchain.getTokenInfo({
      chain: marketConfig.chain,
      address: gem,
    });
    if (collateralToken) {
      const gemBalance = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: Erc20Abi,
        target: collateralToken.address,
        method: 'balanceOf',
        params: [marketConfig.address],
        blockNumber: blockNumber,
      });
      const vatInfo = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: this.abiConfigs.eventAbis.vat,
        target: marketConfig.vat,
        method: 'ilks',
        params: [ilk],
        blockNumber: blockNumber,
      });
      const spotInfo = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: this.abiConfigs.eventAbis.spot,
        target: marketConfig.spot,
        method: 'ilks',
        params: [ilk],
        blockNumber: blockNumber,
      });
      const jugInfo = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: this.abiConfigs.eventAbis.jug,
        target: marketConfig.jug,
        method: 'ilks',
        params: [ilk],
        blockNumber: blockNumber,
      });
      const jugBase = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: this.abiConfigs.eventAbis.jug,
        target: marketConfig.jug,
        method: 'base',
        params: [],
        blockNumber: blockNumber,
      });

      const debtTokenPrice = await this.services.oracle.getTokenPriceUsd({
        chain: marketConfig.chain,
        address: debtToken.address,
        timestamp: options.timestamp,
      });
      const collateralTokenPrice = await this.services.oracle.getTokenPriceUsd({
        chain: marketConfig.chain,
        address: collateralToken.address,
        timestamp: options.timestamp,
      });

      const art = new BigNumber(vatInfo[0].toString());
      const rate = new BigNumber(vatInfo[1].toString());
      const spot = new BigNumber(spotInfo[1].toString());

      // spot is the collateral ratio borrowers must maintain to avoid liquidation
      // for example 145%
      // so, the loan to value = 100 % / 145% = 68.96%
      const loanToValue = new BigNumber(100).multipliedBy(ONE_RAY).dividedBy(new BigNumber(spot));
      const totalBorrowed = formatBigNumberToString(
        art.multipliedBy(rate).toString(10),
        RAY_DECIMALS + debtToken.decimals,
      );
      const totalDeposited = formatBigNumberToString(gemBalance.toString(), collateralToken.decimals);

      // https://docs.makerdao.com/smart-contract-modules/rates-module/jug-detailed-documentation
      const duty = new BigNumber(jugInfo[0].toString()).dividedBy(ONE_RAY);
      const base = new BigNumber(jugBase.toString()).dividedBy(ONE_RAY);
      const elapsed = 3600;

      const deltaRate = duty
        .plus(base)
        .pow(elapsed)
        .multipliedBy(rate.dividedBy(ONE_RAY))
        .minus(rate.dividedBy(ONE_RAY));

      const interestAmount = art.multipliedBy(deltaRate.multipliedBy(YEAR).dividedBy(elapsed));

      const borrowRate = art.eq(0) ? new BigNumber(0) : interestAmount.dividedBy(art);

      const dataState: LendingMarketState = {
        type: marketConfig.type,
        metric: DataMetrics.lending,
        chain: marketConfig.chain,
        protocol: marketConfig.protocol,
        address: normalizeAddress(marketConfig.address),
        timestamp: options.timestamp,

        token: debtToken,
        tokenPrice: debtTokenPrice ? debtTokenPrice : '0',
        collateralToken: collateralToken,
        collateralTokenPrice: collateralTokenPrice ? collateralTokenPrice : '0',

        totalDeposited: totalDeposited,
        totalBorrowed: totalBorrowed,

        supplyRate: '0',
        borrowRate: borrowRate.toString(10),

        loanToValueRate: loanToValue.toString(10),
      };

      result.data.push(dataState);
    }

    return result;
  }

  public async getEventLogs(options: GetAdapterEventLogsOptions): Promise<Array<any>> {
    const config = options.config as MakerLendingMarketConfig;

    // get events from dai join
    let logs = await this.services.blockchain.getContractLogs({
      chain: options.config.chain,
      address: config.daiJoin,
      fromBlock: options.fromBlock,
      toBlock: options.toBlock,
    });

    // get events from gem join
    logs = logs.concat(
      await this.services.blockchain.getContractLogs({
        chain: options.config.chain,
        address: options.config.address,
        fromBlock: options.fromBlock,
        toBlock: options.toBlock,
      }),
    );

    return logs;
  }

  public async transformEventLogs(options: TransformEventLogOptions): Promise<TransformEventLogResult> {
    const result: TransformEventLogResult = {
      activities: [],
    };

    const eventSignatures: MakerEventInterfaces = this.abiConfigs.eventSignatures;
    const marketConfig: MakerLendingMarketConfig = options.config as MakerLendingMarketConfig;
    const debtToken = marketConfig.debtToken as Token;
    const collateralToken = marketConfig.collateralToken as Token;

    for (const log of options.logs) {
      const signature = log.topics[0];
      const address = normalizeAddress(log.address);

      if (
        signature === eventSignatures.Join ||
        signature === eventSignatures.PsmJoin ||
        signature === eventSignatures.Exit
      ) {
        const user = normalizeAddress(decodeAbiParameters([{ type: 'address' }], log.topics[1])[0].toString());
        const rawAmount = decodeAbiParameters([{ type: 'uint256' }], log.topics[3])[0].toString();

        if (compareAddress(address, marketConfig.daiJoin)) {
          // borrow/repay DAI
          const amount = formatBigNumberToString(rawAmount, debtToken.decimals);
          const action = signature === eventSignatures.Join ? ActivityActions.repay : ActivityActions.borrow;
          result.activities.push({
            chain: marketConfig.chain,
            protocol: this.config.protocol,
            address: address,
            transactionHash: log.transactionHash,
            logIndex: log.logIndex.toString(),
            blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
            timestamp: log.timestamp,
            action: action,
            user: user,
            token: debtToken,
            tokenAmount: amount,
            collateralToken: collateralToken,
            collateralAmount: '0',
            additional: {
              contract: marketConfig.address,
            },
          });
        } else if (compareAddress(address, marketConfig.address)) {
          // deposit/withdraw gem
          const amount = formatBigNumberToString(rawAmount, collateralToken.decimals);
          const action = signature === eventSignatures.Exit ? ActivityActions.withdraw : ActivityActions.deposit;
          result.activities.push({
            chain: marketConfig.chain,
            protocol: this.config.protocol,
            address: address,
            transactionHash: log.transactionHash,
            logIndex: log.logIndex.toString(),
            blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
            timestamp: log.timestamp,
            action: action,
            user: user,
            token: collateralToken,
            tokenAmount: amount,
            additional: {
              contract: marketConfig.address,
            },
          });
        }
      } else if (signature === eventSignatures.AuthJoin || signature === eventSignatures.AuthExit) {
        const event: any = decodeEventLog({
          abi: this.abiConfigs.eventAbis.authGemJoin,
          data: log.data,
          topics: log.topics,
        });
        const user = normalizeAddress(event.args.urn);
        const amount = formatBigNumberToString(event.args.amt.toString(), collateralToken.decimals);
        const action = signature === eventSignatures.AuthJoin ? ActivityActions.deposit : ActivityActions.withdraw;

        result.activities.push({
          chain: marketConfig.chain,
          protocol: this.config.protocol,
          address: address,
          transactionHash: log.transactionHash,
          logIndex: log.logIndex.toString(),
          blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
          timestamp: log.timestamp,
          action: action,
          user: user,
          token: collateralToken,
          tokenAmount: amount,
          additional: {
            contract: marketConfig.address,
          },
        });
      }
    }

    return result;
  }

  public async getSnapshotData(
    options: GetAdapterDataOptions,
    storages: ContextStorages,
  ): Promise<GetSnapshotDataResult> {
    const states = (await this.getStateData(options)).data;

    const result: GetSnapshotDataResult = {
      data: [],
    };

    const startDayTimestamp = options.timestamp;
    const endDayTimestamp = options.timestamp + DAY - 1;

    // sync activities
    await this.syncActivities(options, storages);

    const marketConfig = options.config as MakerLendingMarketConfig;
    for (const stateData of states) {
      let documents = await storages.database.query({
        collection: EnvConfig.mongodb.collections.activities,
        query: {
          chain: stateData.chain,
          protocol: stateData.protocol,
          'additional.contract': marketConfig.address,
          timestamp: {
            $gte: startDayTimestamp,
            $lte: endDayTimestamp,
          },
        },
      });

      let volumeDeposited = new BigNumber(0);
      let volumeWithdrawn = new BigNumber(0);
      let volumeBorrowed = new BigNumber(0);
      let volumeRepaid = new BigNumber(0);
      const volumeLiquidated: { [key: string]: TokenAmountEntry } = {};
      const countUsers: { [key: string]: boolean } = {};
      const countBorrowers: { [key: string]: boolean } = {};
      const transactions: { [key: string]: boolean } = {};

      for (const document of documents) {
        const activityEvent = document as LendingActivityEvent;

        if (!transactions[document.transactionHash]) {
          transactions[document.transactionHash] = true;
        }

        if (!countUsers[activityEvent.user]) {
          countUsers[activityEvent.user] = true;
        }

        if (!countBorrowers[activityEvent.user]) {
          countBorrowers[activityEvent.user] = true;
        }

        switch (activityEvent.action) {
          case ActivityActions.borrow: {
            volumeBorrowed = volumeBorrowed.plus(new BigNumber(activityEvent.tokenAmount));
            break;
          }
          case ActivityActions.repay: {
            volumeRepaid = volumeRepaid.plus(new BigNumber(activityEvent.tokenAmount));
            break;
          }
          case ActivityActions.deposit: {
            volumeDeposited = volumeDeposited.plus(new BigNumber(activityEvent.tokenAmount));
            break;
          }
          case ActivityActions.withdraw: {
            volumeWithdrawn = volumeWithdrawn.plus(new BigNumber(activityEvent.tokenAmount));
            break;
          }
        }
      }

      result.data.push({
        ...stateData,
        volumeDeposited: volumeDeposited.toString(10),
        volumeWithdrawn: volumeWithdrawn.toString(10),
        volumeBorrowed: volumeBorrowed.toString(10),
        volumeRepaid: volumeRepaid.toString(10),
        volumeLiquidated: Object.values(volumeLiquidated),
        totalFeesPaid: new BigNumber(stateData.borrowRate)
          .multipliedBy(new BigNumber(stateData.totalBorrowed))
          .multipliedBy(DAY)
          .dividedBy(YEAR)
          .toString(10),
        numberOfUniqueUsers: Object.keys(countUsers).length,
        numberOfLenders: 0,
        numberOfBorrowers: Object.keys(countBorrowers).length,
        numberOfLiquidators: 0,
        numberOfTransactions: Object.keys(transactions).length,
      });
    }

    return result;
  }
}
