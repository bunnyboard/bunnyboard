import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';

import GmxVaultAbi from '../../../configs/abi/gmx/Vault.json';
import { DAY, YEAR } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { tryQueryBlockNumberAtTimestamp, tryQueryBlockTimestamps } from '../../../lib/subsgraph';
import { compareAddress, formatFromDecimals, normalizeAddress } from '../../../lib/utils';
import { PerpetualMarketConfig, ProtocolConfig } from '../../../types/configs';
import { PerpetualActivityAction } from '../../../types/domains/base';
import { PerpetualActivityEvent } from '../../../types/domains/perpetual';
import { ContextServices } from '../../../types/namespaces';
import { GetSnapshotOptions, GetSnapshotResult } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import { GmxEventInterfaces, GmxEventSignatures } from './abis';

export default class GmxAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.gmx';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = GmxEventSignatures;
  }

  protected async getPerpetualMarketActivities(options: GetSnapshotOptions): Promise<Array<PerpetualActivityEvent>> {
    const activityEvents: Array<PerpetualActivityEvent> = [];

    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );
    const blockNumberEndDay = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp + DAY - 1,
    );

    // now we handle event log, turn them to activities
    const timestamps = await tryQueryBlockTimestamps(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      blockNumber,
      blockNumberEndDay,
    );
    let logs = await this.services.blockchain.getContractLogs({
      chain: options.config.chain,
      address: options.config.address, // borrow operations
      fromBlock: blockNumber,
      toBlock: blockNumberEndDay,
    });

    const marketConfig = options.config as PerpetualMarketConfig;
    const eventSignatures = this.abiConfigs.eventSignatures as GmxEventInterfaces;
    for (const log of logs) {
      const signature = log.topics[0];

      if (signature === eventSignatures.IncreasePosition || signature === eventSignatures.DecreasePosition) {
        const event: any = decodeEventLog({
          abi: GmxVaultAbi,
          data: log.data,
          topics: log.topics,
        });
        const action: PerpetualActivityAction =
          signature === eventSignatures.IncreasePosition ? 'increase' : 'decrease';
        const isLong = Boolean(event.args.isLong);

        const indexToken = await this.services.blockchain.getTokenInfo({
          chain: options.config.chain,
          address: event.args.indexToken.toString(),
        });
        const collateralToken = await this.services.blockchain.getTokenInfo({
          chain: options.config.chain,
          address: event.args.collateralToken.toString(),
        });
        if (indexToken && collateralToken) {
          const user = normalizeAddress(event.args.account.toString());
          const tokenSizeUsd = new BigNumber(event.args.sizeDelta.toString());
          const collateralSizeUsd = new BigNumber(event.args.collateralDelta.toString());
          const tokenPrice = new BigNumber(event.args.price.toString());
          const tokenAmount = tokenSizeUsd.dividedBy(tokenPrice);

          activityEvents.push({
            chain: marketConfig.chain,
            protocol: marketConfig.protocol,
            address: marketConfig.address,
            transactionHash: log.transactionHash,
            logIndex: log.logIndex.toString(),
            blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
            timestamp: timestamps[new BigNumber(log.blockNumber.toString()).toNumber()],
            action: action,
            user: user,
            isLong: isLong,
            token: indexToken,
            tokenAmount: tokenAmount.toString(10),
            tokenAmountUsd: tokenSizeUsd.dividedBy(new BigNumber(10).pow(30)).toString(10),
            feeAmountUsd: new BigNumber(event.args.fee.toString()).dividedBy(new BigNumber(10).pow(30)).toString(10),
            collateralToken: collateralToken,
            collateralAmountUsd: collateralSizeUsd.dividedBy(new BigNumber(10).pow(30)).toString(10),
          });
        }
      } else if (signature === eventSignatures.LiquidatePosition) {
        const event: any = decodeEventLog({
          abi: GmxVaultAbi,
          data: log.data,
          topics: log.topics,
        });

        const isLong = Boolean(event.args.isLong);

        const indexToken = await this.services.blockchain.getTokenInfo({
          chain: options.config.chain,
          address: event.args.indexToken.toString(),
        });
        const collateralToken = await this.services.blockchain.getTokenInfo({
          chain: options.config.chain,
          address: event.args.collateralToken.toString(),
        });
        if (indexToken && collateralToken) {
          const user = normalizeAddress(event.args.account.toString());
          const tokenSizeUsd = new BigNumber(event.args.size.toString());
          const collateralSizeUsd = new BigNumber(event.args.collateral.toString());
          const tokenPrice = new BigNumber(event.args.markPrice.toString());
          const tokenAmount = tokenSizeUsd.dividedBy(tokenPrice);

          activityEvents.push({
            chain: marketConfig.chain,
            protocol: marketConfig.protocol,
            address: marketConfig.address,
            transactionHash: log.transactionHash,
            logIndex: log.logIndex.toString(),
            blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
            timestamp: timestamps[new BigNumber(log.blockNumber.toString()).toNumber()],
            action: 'liquidate',
            user: user,
            isLong: isLong,
            token: indexToken,
            tokenAmount: tokenAmount.toString(10),
            tokenAmountUsd: tokenSizeUsd.dividedBy(new BigNumber(10).pow(30)).toString(10),
            collateralToken: collateralToken,
            collateralAmountUsd: collateralSizeUsd.dividedBy(new BigNumber(10).pow(30)).toString(10),
          });
        }
      } else if (signature === eventSignatures.BuyUSDG || signature === eventSignatures.SellUSDG) {
        const event: any = decodeEventLog({
          abi: GmxVaultAbi,
          data: log.data,
          topics: log.topics,
        });

        const action: PerpetualActivityAction =
          signature === eventSignatures.BuyUSDG ? 'addLiquidity' : 'removeLiquidity';
        const user = normalizeAddress(event.args.account.toString());
        const token = await this.services.blockchain.getTokenInfo({
          chain: marketConfig.chain,
          address: event.args.token.toString(),
        });
        if (token) {
          activityEvents.push({
            chain: marketConfig.chain,
            protocol: marketConfig.protocol,
            address: marketConfig.address,
            transactionHash: log.transactionHash,
            logIndex: log.logIndex.toString(),
            blockNumber: new BigNumber(log.blockNumber.toString()).toNumber(),
            timestamp: timestamps[new BigNumber(log.blockNumber.toString()).toNumber()],
            action: action,
            user: user,
            isLong: false,
            token: token,
            tokenAmount: formatFromDecimals(event.args.tokenAmount.toString(), token.decimals),
          });
        }
      }
    }

    return activityEvents;
  }

  public async getPerpetualSnapshots(options: GetSnapshotOptions): Promise<GetSnapshotResult> {
    const activities = options.collectActivities ? await this.getPerpetualMarketActivities(options) : [];

    const result: GetSnapshotResult = {
      activities: activities,
      snapshots: [],
    };

    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[options.config.chain].blockSubgraph,
      options.timestamp,
    );

    const marketConfig = options.config as PerpetualMarketConfig;

    const allWhitelistedTokensLength = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: GmxVaultAbi,
      target: marketConfig.address,
      method: 'allWhitelistedTokensLength',
      params: [],
      blockNumber: blockNumber,
    });

    for (let i = 0; i < Number(allWhitelistedTokensLength); i++) {
      const tokenAddress = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: GmxVaultAbi,
        target: marketConfig.address,
        method: 'allWhitelistedTokens',
        params: [i],
        blockNumber: blockNumber,
      });
      const utilization = await this.services.blockchain.readContract({
        chain: marketConfig.chain,
        abi: GmxVaultAbi,
        target: marketConfig.address,
        method: 'getUtilisation',
        params: [tokenAddress],
        blockNumber: blockNumber,
      });
      const token = await this.services.blockchain.getTokenInfo({
        chain: marketConfig.chain,
        address: tokenAddress.toString(),
      });
      if (token) {
        const balance = await this.services.blockchain.readContract({
          chain: marketConfig.chain,
          abi: GmxVaultAbi,
          target: marketConfig.address,
          method: 'tokenBalances',
          params: [tokenAddress],
          blockNumber: blockNumber,
        });
        const tokenPrice = await this.services.oracle.getTokenPriceUsd({
          chain: marketConfig.chain,
          address: tokenAddress,
          timestamp: options.timestamp,
        });

        let volumeLongUsd = new BigNumber(0);
        let volumeShortUsd = new BigNumber(0);
        let volumeLiquidateUsd = new BigNumber(0);
        let totalFeesCollectedUsd = new BigNumber(0);
        let openInterestLong = new BigNumber(0);
        let openInterestShort = new BigNumber(0);
        let volumeDeposit = new BigNumber(0);
        let volumeWithdraw = new BigNumber(0);
        const traders: any = {};
        const liquidityProviders: any = {};
        for (const event of activities) {
          if (compareAddress(event.token.address, tokenAddress)) {
            if (!traders[event.user]) {
              traders[event.user] = true;
            }

            if (event.action === 'liquidate') {
              volumeLiquidateUsd = volumeLiquidateUsd.plus(
                new BigNumber(event.tokenAmountUsd ? event.tokenAmountUsd : '0'),
              );
            } else if (event.action === 'increase' || event.action === 'decrease') {
              if (event.feeAmountUsd) {
                totalFeesCollectedUsd = totalFeesCollectedUsd.plus(new BigNumber(event.feeAmountUsd));
              }

              if (event.isLong) {
                volumeLongUsd = volumeLongUsd.plus(new BigNumber(event.tokenAmountUsd ? event.tokenAmountUsd : '0'));
              } else {
                volumeShortUsd = volumeShortUsd.plus(new BigNumber(event.tokenAmountUsd ? event.tokenAmountUsd : '0'));
              }
              if (event.action === 'increase') {
                if (event.isLong) {
                  openInterestLong = openInterestLong.plus(
                    new BigNumber(event.tokenAmountUsd ? event.tokenAmountUsd : '0'),
                  );
                } else {
                  openInterestShort = openInterestShort.plus(
                    new BigNumber(event.tokenAmountUsd ? event.tokenAmountUsd : '0'),
                  );
                }
              }
            } else if (event.action === 'addLiquidity' || event.action === 'removeLiquidity') {
              if (!liquidityProviders[event.user]) {
                liquidityProviders[event.user] = true;
              }
              if (event.action === 'addLiquidity') {
                volumeDeposit = volumeDeposit.plus(new BigNumber(event.tokenAmount));
              } else {
                volumeWithdraw = volumeWithdraw.plus(new BigNumber(event.tokenAmount));
              }
            }
          }
        }

        result.snapshots.push({
          chain: marketConfig.chain,
          protocol: marketConfig.protocol,
          address: normalizeAddress(marketConfig.address),
          timestamp: options.timestamp,

          token: token,
          tokenPrice: tokenPrice ? tokenPrice : '0',
          totalLiquidityDeposited: formatFromDecimals(balance.toString(), token.decimals),
          totalTradeFeesUsd: totalFeesCollectedUsd.toString(10),
          volumeTradeLongUsd: volumeLongUsd.toString(10),
          volumeTradeShortUsd: volumeShortUsd.toString(10),
          volumeTradeLiquidatedUsd: volumeLiquidateUsd.toString(10),
          volumeLiquidityDeposited: volumeDeposit.toString(10),
          volumeLiquidityWithdrawn: volumeWithdraw.toString(10),
          volumeTradeOpenInterestLongUsd: openInterestShort.toString(10),
          volumeTradeOpenInterestShortUsd: openInterestShort.toString(10),
          borrowRate: formatFromDecimals(
            new BigNumber(utilization.toString())
              .multipliedBy(0.0001)
              .multipliedBy(YEAR / 60)
              .toString(10),
            6,
          ),
          countTraders: Object.keys(traders).length,
          countLiquidityProviders: Object.keys(liquidityProviders).length,
        });
      }
    }

    return result;
  }
}
