import BigNumber from 'bignumber.js';

import CompoundComptrollerAbi from '../../../configs/abi/compound/Comptroller.json';
import CompoundComptrollerV1Abi from '../../../configs/abi/compound/ComptrollerV1.json';
import cErc20Abi from '../../../configs/abi/compound/cErc20.json';
import { ChainBlockPeriods, YEAR } from '../../../configs/constants';
import EnvConfig from '../../../configs/envConfig';
import { CompoundLendingMarketConfig } from '../../../configs/protocols/compound';
import { tryQueryBlockNumberAtTimestamp } from '../../../lib/subsgraph';
import { formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { DataMetrics, ProtocolConfig, Token } from '../../../types/configs';
import { TokenAmountEntry } from '../../../types/domains/base';
import { LendingMarketState } from '../../../types/domains/lending';
import { ContextServices } from '../../../types/namespaces';
import { GetAdapterDataOptions, GetStateDataResult } from '../../../types/options';
import ProtocolAdapter from '../adapter';
import { CompoundEventSignatures } from './abis';

interface Rates {
  supplyRate: string;
  borrowRate: string;
}

interface Speeds {
  supplySpeed: string;
  borrowSpeed: string;
}

interface Rewards {
  forLenders: Array<TokenAmountEntry>;
  forBorrowers: Array<TokenAmountEntry>;
}

export default class CompoundAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.compound';

  constructor(services: ContextServices, config: ProtocolConfig) {
    super(services, config);

    this.abiConfigs.eventSignatures = CompoundEventSignatures;
    this.abiConfigs.eventAbis = {
      cErc20: cErc20Abi,
      comptroller: CompoundComptrollerAbi,
    };
  }

  protected async getMarketLoanToValueRate(
    config: CompoundLendingMarketConfig,
    cTokenContract: string,
    blockNumber: number,
  ): Promise<any> {
    let mrketInfo = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: this.abiConfigs.eventAbis.comptroller,
      target: config.address,
      method: 'markets',
      params: [cTokenContract],
      blockNumber,
    });
    if (mrketInfo) {
      return formatBigNumberToString(mrketInfo[1].toString(), 18);
    }

    mrketInfo = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: CompoundComptrollerV1Abi,
      target: config.address,
      method: 'markets',
      params: [cTokenContract],
      blockNumber,
    });

    return formatBigNumberToString(mrketInfo[1].toString(), 18);
  }

  protected async getMarketCompSpeeds(
    config: CompoundLendingMarketConfig,
    cTokenContract: string,
    blockNumber: number,
  ): Promise<Speeds | null> {
    const compSupplySpeeds = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: this.abiConfigs.eventAbis.comptroller,
      target: config.address,
      method: 'compSupplySpeeds',
      params: [cTokenContract],
      blockNumber,
    });
    const compBorrowSpeeds = await this.services.blockchain.readContract({
      chain: config.chain,
      abi: this.abiConfigs.eventAbis.comptroller,
      target: config.address,
      method: 'compBorrowSpeeds',
      params: [cTokenContract],
      blockNumber,
    });

    if (compSupplySpeeds && compBorrowSpeeds) {
      return {
        supplySpeed: formatBigNumberToString(compSupplySpeeds.toString(), 18),
        borrowSpeed: formatBigNumberToString(compBorrowSpeeds.toString(), 18),
      };
    } else {
      return null;
    }
  }

  protected async getMarketRewards(
    config: CompoundLendingMarketConfig,
    cTokenContract: string,
    blockNumber: number,
  ): Promise<Rewards | null> {
    if (!config.governanceToken) {
      return null;
    }

    const speeds = await this.getMarketCompSpeeds(config, cTokenContract, blockNumber);

    if (speeds) {
      const blockPerYear = YEAR / ChainBlockPeriods[config.chain];
      const compPerYearForSuppliers = new BigNumber(speeds.supplySpeed).multipliedBy(blockPerYear).toString(10);
      const compPerYearForBorrowers = new BigNumber(speeds.supplySpeed).multipliedBy(blockPerYear).toString(10);

      return {
        forLenders: [
          {
            token: config.governanceToken,
            amount: compPerYearForSuppliers,
          },
        ],
        forBorrowers: [
          {
            token: config.governanceToken,
            amount: compPerYearForBorrowers,
          },
        ],
      };
    }

    return null;
  }

  protected async getMarketRates(chain: string, cTokenContract: string, blockNumber: number): Promise<Rates> {
    const supplyRatePerBlock = await this.services.blockchain.readContract({
      chain: chain,
      abi: this.abiConfigs.eventAbis.cErc20,
      target: cTokenContract,
      method: 'supplyRatePerBlock',
      params: [],
      blockNumber,
    });
    const borrowRatePerBlock = await this.services.blockchain.readContract({
      chain: chain,
      abi: this.abiConfigs.eventAbis.cErc20,
      target: cTokenContract,
      method: 'borrowRatePerBlock',
      params: [],
      blockNumber,
    });

    const supplyRate = new BigNumber(supplyRatePerBlock ? supplyRatePerBlock : '0').multipliedBy(
      Math.floor(YEAR / ChainBlockPeriods[chain]),
    );
    const borrowRate = new BigNumber(borrowRatePerBlock).multipliedBy(Math.floor(YEAR / ChainBlockPeriods[chain]));

    return {
      supplyRate: formatBigNumberToString(supplyRate.toString(10), 18),
      borrowRate: formatBigNumberToString(borrowRate.toString(10), 18),
    };
  }

  public async getStateData(options: GetAdapterDataOptions): Promise<GetStateDataResult> {
    const result: GetStateDataResult = {
      data: [],
    };

    const marketConfig = options.config as CompoundLendingMarketConfig;
    const blockNumber = await tryQueryBlockNumberAtTimestamp(
      EnvConfig.blockchains[marketConfig.chain].blockSubgraph,
      options.timestamp,
    );

    const allMarkets = await this.services.blockchain.readContract({
      chain: marketConfig.chain,
      abi: this.abiConfigs.eventAbis.comptroller,
      target: marketConfig.address,
      method: 'getAllMarkets',
      params: [],
      blockNumber,
    });
    for (let cTokenContract of allMarkets) {
      cTokenContract = normalizeAddress(cTokenContract);

      let token: Token | null = null;
      if (marketConfig.underlying[cTokenContract]) {
        token = marketConfig.underlying[cTokenContract];
      } else {
        const underlying = await this.services.blockchain.readContract({
          chain: marketConfig.chain,
          abi: this.abiConfigs.eventAbis.cErc20,
          target: cTokenContract,
          method: 'underlying',
          params: [],
          blockNumber,
        });
        token = await this.services.blockchain.getTokenInfo({
          chain: marketConfig.chain,
          address: underlying.toString(),
        });
      }

      if (token) {
        const totalCash = await this.services.blockchain.readContract({
          chain: marketConfig.chain,
          abi: this.abiConfigs.eventAbis.cErc20,
          target: cTokenContract,
          method: 'getCash',
          params: [],
          blockNumber,
        });
        const totalBorrows = await this.services.blockchain.readContract({
          chain: marketConfig.chain,
          abi: this.abiConfigs.eventAbis.cErc20,
          target: cTokenContract,
          method: 'totalBorrows',
          params: [],
          blockNumber,
        });
        const totalReserves = await this.services.blockchain.readContract({
          chain: marketConfig.chain,
          abi: this.abiConfigs.eventAbis.cErc20,
          target: cTokenContract,
          method: 'totalReserves',
          params: [],
          blockNumber,
        });
        const reserveFactorMantissa = await this.services.blockchain.readContract({
          chain: marketConfig.chain,
          abi: this.abiConfigs.eventAbis.cErc20,
          target: cTokenContract,
          method: 'reserveFactorMantissa',
          params: [],
          blockNumber,
        });
        const ltv = await this.getMarketLoanToValueRate(marketConfig, cTokenContract, blockNumber);

        const totalDeposited = new BigNumber(totalCash.toString())
          .plus(new BigNumber(totalBorrows.toString()))
          .minus(new BigNumber(totalReserves.toString()));
        const totalBorrowed = new BigNumber(totalBorrows.toString());

        // get market rates
        const { supplyRate, borrowRate } = await this.getMarketRates(marketConfig.chain, cTokenContract, blockNumber);

        const tokenPrice = await this.services.oracle.getTokenPriceUsd({
          chain: token.chain,
          address: token.address,
          timestamp: options.timestamp,
        });

        let rewardSupplyRate = '0';
        let rewardBorrowRate = '0';

        if (marketConfig.governanceToken) {
          const compPerYear = await this.getMarketRewards(marketConfig, cTokenContract, blockNumber);
          if (compPerYear) {
            const governanceTokenPrice = await this.services.oracle.getTokenPriceUsd({
              chain: marketConfig.governanceToken.chain,
              address: marketConfig.governanceToken.address,
              timestamp: options.timestamp,
            });
            if (governanceTokenPrice && tokenPrice) {
              rewardSupplyRate = new BigNumber(compPerYear.forLenders[0].amount)
                .multipliedBy(governanceTokenPrice)
                .dividedBy(
                  new BigNumber(formatBigNumberToString(totalDeposited.toString(10), token.decimals)).multipliedBy(
                    tokenPrice,
                  ),
                )
                .toString(10);
              rewardBorrowRate = new BigNumber(compPerYear.forBorrowers[0].amount)
                .multipliedBy(governanceTokenPrice)
                .dividedBy(
                  new BigNumber(formatBigNumberToString(totalBorrowed.toString(10), token.decimals)).multipliedBy(
                    tokenPrice,
                  ),
                )
                .toString(10);
            }
          }
        }

        const dataState: LendingMarketState = {
          type: marketConfig.type,
          metric: DataMetrics.lending,
          chain: marketConfig.chain,
          protocol: marketConfig.protocol,
          address: cTokenContract,
          timestamp: options.timestamp,

          token: token,
          tokenPrice: tokenPrice ? tokenPrice : '0',

          totalDeposited: formatBigNumberToString(totalDeposited.toString(10), token.decimals),
          totalBorrowed: formatBigNumberToString(totalBorrowed.toString(10), token.decimals),

          supplyRate: supplyRate,
          borrowRate: borrowRate,
          loanToValueRate: ltv,
          reserveRate: formatBigNumberToString(reserveFactorMantissa.toString(), 18),
          liquidationThresholdRate: ltv,

          rewardSupplyRate: rewardSupplyRate,
          rewardBorrowRate: rewardBorrowRate,
        };

        console.log(dataState);

        result.data.push(dataState);
      }
    }

    return result;
  }
}
