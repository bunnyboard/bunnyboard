import BigNumber from 'bignumber.js';

import CompoundCometAbi from '../../../configs/abi/compound/Comet.json';
import { YEAR } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { CompoundLendingMarketConfig } from '../../../configs/protocols/compound';
import logger from '../../../lib/logger';
import { queryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { formatFromDecimals, getDateString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/configs';
import { LendingMarketSnapshot } from '../../../types/domains';
import { ContextServices } from '../../../types/namespaces';
import { GetLendingMarketSnapshotOptions } from '../../../types/options';
import ProtocolAdapter from '../adapter';

export default class Compoundv3Adapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.compoundv3';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);
  }

  public async getLendingMarketSnapshots(
    options: GetLendingMarketSnapshotOptions,
  ): Promise<Array<LendingMarketSnapshot> | null> {
    const marketConfig = options.config as CompoundLendingMarketConfig;

    const blockNumber = await queryBlockNumberAtTimestamp(
      EnvConfig.blockchains[marketConfig.chain].blockSubgraph,
      options.timestamp,
    );
    if (blockNumber === 0) {
      return null;
    }

    const snapshots: Array<LendingMarketSnapshot> = [];

    const baseTokenAddress = await this.services.blockchain.singlecall({
      chain: marketConfig.chain,
      abi: CompoundCometAbi,
      target: marketConfig.address,
      method: 'baseToken',
      params: [],
      blockNumber,
    });
    const baseToken = await this.services.blockchain.getTokenInfo({
      chain: marketConfig.chain,
      address: baseTokenAddress,
    });
    if (baseToken) {
      const totalSupply = await this.services.blockchain.singlecall({
        chain: marketConfig.chain,
        abi: CompoundCometAbi,
        target: marketConfig.address,
        method: 'totalSupply',
        params: [],
        blockNumber,
      });
      const totalBorrow = await this.services.blockchain.singlecall({
        chain: marketConfig.chain,
        abi: CompoundCometAbi,
        target: marketConfig.address,
        method: 'totalBorrow',
        params: [],
        blockNumber,
      });
      const utilization = await this.services.blockchain.singlecall({
        chain: marketConfig.chain,
        abi: CompoundCometAbi,
        target: marketConfig.address,
        method: 'getUtilization',
        params: [],
        blockNumber,
      });
      const supplyRate = await this.services.blockchain.singlecall({
        chain: marketConfig.chain,
        abi: CompoundCometAbi,
        target: marketConfig.address,
        method: 'getSupplyRate',
        params: [utilization.toString()],
        blockNumber,
      });
      const borrowRate = await this.services.blockchain.singlecall({
        chain: marketConfig.chain,
        abi: CompoundCometAbi,
        target: marketConfig.address,
        method: 'getBorrowRate',
        params: [utilization.toString()],
        blockNumber,
      });

      snapshots.push({
        marketId: `${marketConfig.protocol}-${marketConfig.chain}-${normalizeAddress(
          marketConfig.address,
        )}-${normalizeAddress(baseToken.address)}`,

        chain: marketConfig.chain,
        protocol: marketConfig.protocol,
        address: normalizeAddress(marketConfig.address),
        timestamp: options.timestamp,

        token: baseToken,
        tokenPrice: '0',

        totalDeposited: formatFromDecimals(new BigNumber(totalSupply.toString()).toString(10), baseToken.decimals),
        totalBorrowed: formatFromDecimals(new BigNumber(totalBorrow.toString()).toString(10), baseToken.decimals),

        supplyRate: formatFromDecimals(new BigNumber(supplyRate.toString()).multipliedBy(YEAR).toString(10), 18),
        borrowRate: formatFromDecimals(new BigNumber(borrowRate.toString()).multipliedBy(YEAR).toString(10), 18),
      });

      logger.debug('got lending market snapshot', {
        service: this.name,
        protocol: this.config.protocol,
        chain: marketConfig.chain,
        version: marketConfig.version,
        token: `${baseToken.symbol}:${baseToken.address}`,
        date: getDateString(options.timestamp),
      });
    }

    const numAssets = await this.services.blockchain.singlecall({
      chain: marketConfig.chain,
      abi: CompoundCometAbi,
      target: marketConfig.address,
      method: 'numAssets',
      params: [],
      blockNumber,
    });
    for (let i = 0; i < Number(numAssets); i++) {
      const assetInfo = await this.services.blockchain.singlecall({
        chain: marketConfig.chain,
        abi: CompoundCometAbi,
        target: marketConfig.address,
        method: 'getAssetInfo',
        params: [i],
        blockNumber,
      });
      const collateral = await this.services.blockchain.getTokenInfo({
        chain: marketConfig.chain,
        address: assetInfo[1],
      });
      if (collateral) {
        const totalsCollateral = await this.services.blockchain.singlecall({
          chain: marketConfig.chain,
          abi: CompoundCometAbi,
          target: marketConfig.address,
          method: 'totalsCollateral',
          params: [collateral.address],
          blockNumber,
        });

        snapshots.push({
          marketId: `${marketConfig.protocol}-${marketConfig.chain}-${normalizeAddress(
            marketConfig.address,
          )}-${normalizeAddress(collateral.address)}`,

          chain: marketConfig.chain,
          protocol: marketConfig.protocol,
          address: normalizeAddress(marketConfig.address),
          timestamp: options.timestamp,

          token: collateral,
          tokenPrice: '0',

          totalDeposited: formatFromDecimals(
            new BigNumber(totalsCollateral.totalSupplyAsset.toString()).toString(10),
            collateral.decimals,
          ),

          totalBorrowed: '0',
          supplyRate: '0',
          borrowRate: '0',
        });

        logger.debug('got lending market snapshot', {
          service: this.name,
          protocol: this.config.protocol,
          chain: marketConfig.chain,
          version: marketConfig.version,
          token: `${collateral.symbol}:${collateral.address}`,
          date: getDateString(options.timestamp),
        });
      }
    }

    return snapshots;
  }
}
