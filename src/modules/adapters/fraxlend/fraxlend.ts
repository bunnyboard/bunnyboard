import FraxlendPairAbi from '../../../configs/abi/frax/FraxlendPair.json';
import FraxlendPairV2Abi from '../../../configs/abi/frax/FraxlendPairV2.json';
import FraxlendPairDeployerAbi from '../../../configs/abi/frax/FraxlendPairDeployer.json';
import { ProtocolConfig } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetAdapterDataTimeframeOptions } from '../../../types/options';
import IsolatedLendingProtocolAdapter from '../isolatedLending';
import { FraxlendLendingConfig } from '../../../configs/protocols/fraxlend';
import { IsolatedLendingPoolDataTimeframe } from '../../../types/domains/isolatedLending';
import BigNumber from 'bignumber.js';
import { formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { TimeUnits } from '../../../configs/constants';
import logger from '../../../lib/logger';

const FraxPairEvents = {
  Deposit: '0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7',
  Withdraw: '0xfbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db',
  BorrowAsset: '0x01348584ec81ac7acd52b7d66d9ade986dd909f3d513881c190fc31c90527efe',
  RepayAsset: '0x9dc1449a0ff0c152e18e8289d865b47acc6e1b76b1ecb239c13d6ee22a9206a7',
  AddCollateral: '0xa32435755c235de2976ed44a75a2f85cb01faf0c894f639fe0c32bb9455fea8f',
  RemoveCollateral: '0xbc290bb45104f73cf92115c9603987c3f8fd30c182a13603d8cffa49b5f59952',
  Liquidate: '0x35f432a64bd3767447a456650432406c6cacb885819947a202216eeea6820ecf',
}

export default class FraxlendAdapter extends IsolatedLendingProtocolAdapter {
  public readonly name: string = 'adapter.fraxlend';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getLendingPoolData(
    options: GetAdapterDataTimeframeOptions,
  ): Promise<Array<IsolatedLendingPoolDataTimeframe> | null> {
    const marketConfig = options.config as FraxlendLendingConfig;

    const beginBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(
      options.config.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.tryGetBlockNumberAtTimestamp(options.config.chain, options.toTime);

    const stateTime = options.latestState ? options.toTime : options.fromTime;
    const stateBlock = options.latestState ? endBlock : beginBlock;

    const pools: Array<IsolatedLendingPoolDataTimeframe> = [];

    const allPairAddresses = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: FraxlendPairDeployerAbi,
      target: marketConfig.address,
      method: 'getAllPairAddresses',
      params: [],
      blockNumber: stateBlock,
    });

    for (const pairAddress of allPairAddresses) {
      const [asset, collateralContract, maxLTV, totalAsset, totalBorrow, totalCollateral, currentRateInfo] =
        await this.services.blockchain.multicall({
          chain: marketConfig.chain,
          blockNumber: stateBlock,
          calls: [
            {
              abi: FraxlendPairAbi,
              target: pairAddress,
              method: 'asset',
              params: [],
            },
            {
              abi: FraxlendPairAbi,
              target: pairAddress,
              method: 'collateralContract',
              params: [],
            },
            {
              abi: FraxlendPairAbi,
              target: pairAddress,
              method: 'maxLTV',
              params: [],
            },
            {
              abi: FraxlendPairAbi,
              target: pairAddress,
              method: 'totalAsset',
              params: [],
            },
            {
              abi: FraxlendPairAbi,
              target: pairAddress,
              method: 'totalBorrow',
              params: [],
            },
            {
              abi: FraxlendPairAbi,
              target: pairAddress,
              method: 'totalCollateral',
              params: [],
            },
            {
              abi: marketConfig.fraxlendPairVersion === 1 ? FraxlendPairAbi : FraxlendPairV2Abi,
              target: pairAddress,
              method: 'currentRateInfo',
              params: [],
            },
          ],
        });

      const token = await this.services.blockchain.getTokenInfo({
        chain: marketConfig.chain,
        address: asset,
      });
      const collateral = await this.services.blockchain.getTokenInfo({
        chain: marketConfig.chain,
        address: collateralContract,
      });
      if (token && collateral) {
        const tokenPrice = await this.services.oracle.getTokenPriceUsd({
          chain: marketConfig.chain,
          address: token.address,
          timestamp: stateTime,
        });
        const collateralPrice = await this.services.oracle.getTokenPriceUsd({
          chain: marketConfig.chain,
          address: collateral.address,
          timestamp: stateTime,
        });

        if (!tokenPrice) {
          logger.warn('failed to get token price on-chain', {
            service: this.name,
            chain: token.chain,
            address: token.address,
            timestamp: stateTime,
          });
        }

        if (!collateralPrice) {
          logger.warn('failed to get token price on-chain', {
            service: this.name,
            chain: collateral.chain,
            address: collateral.address,
            timestamp: stateTime,
          });
        }

        const totalDeposited = formatBigNumberToString(totalAsset[0].toString(), token.decimals);
        const totalBorrowed = formatBigNumberToString(totalBorrow[0].toString(), token.decimals);
        const totalCollateralDeposited = formatBigNumberToString(totalCollateral.toString(), collateral.decimals);

        // RatePerSec * SecondsPerYear
        const borrowRate = formatBigNumberToString(
          new BigNumber(currentRateInfo[3].toString()).multipliedBy(TimeUnits.SecondsPerYear).toString(10),
          18,
        );
        const supplyRate =
          totalBorrow !== '0'
            ? new BigNumber(borrowRate)
                .multipliedBy(new BigNumber(totalBorrow))
                .dividedBy(new BigNumber(totalDeposited))
                .toString(10)
            : '0';

        const rateLoanToValue = formatBigNumberToString(maxLTV, 5);

        // const logs = await this.services.blockchain.getContractLogs({
          
        // })

        pools.push({
          chain: marketConfig.chain,
          protocol: marketConfig.protocol,
          metric: marketConfig.metric,
          timestamp: stateTime,
          timefrom: options.fromTime,
          timeto: options.toTime,
          address: normalizeAddress(pairAddress),

          token: token,
          tokenPrice: tokenPrice ? tokenPrice : '0',
          totalDeposited: totalDeposited,
          totalBorrowed: totalBorrowed,
          volumeDeposited: '0',
          volumeWithdrawn: '0',
          volumeBorrowed: '0',
          volumeRepaid: '0',
          rateSupply: supplyRate,
          rateBorrow: borrowRate,
          addresses: [],
          transactions: [],
          collaterals: [
            {
              token: collateral,
              tokenPrice: collateralPrice ? collateralPrice : '0',
              totalDeposited: totalCollateralDeposited,
              volumeDeposited: '0',
              volumeWithdrawn: '0',
              volumeLiquidated: '0',
              rateLoanToValue: rateLoanToValue,
            },
          ],
        });
      }
    }

    return pools;
  }
}
