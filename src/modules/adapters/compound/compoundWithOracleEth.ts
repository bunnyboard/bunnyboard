import BigNumber from 'bignumber.js';

import { AddressZero } from '../../../configs/constants';
import { CompoundLendingMarketConfig } from '../../../configs/protocols/compound';
import { formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig, Token } from '../../../types/configs';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import CompoundAdapter from './compound';

interface MarketAndPrice {
  cToken: string;
  underlying: Token;
  underlyingPrice: string | null;
}

// extend the Compound adapter
// with query token price using Compound Oracle
export default class CompoundWithOracleEthAdapter extends CompoundAdapter {
  public readonly name: string = 'adapter.compound';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  protected async getAllMarketsAndPrices(
    config: CompoundLendingMarketConfig,
    blockNumber: number,
    timestamp: number,
  ): Promise<Array<MarketAndPrice>> {
    const markets: Array<MarketAndPrice> = [];

    const allMarkets = await this.getAllMarkets(config, blockNumber);
    if (allMarkets) {
      const oracleAddress = await this.services.blockchain.readContract({
        chain: config.chain,
        target: config.address,
        abi: this.abiConfigs.eventAbis.comptroller,
        method: 'oracle',
        params: [],
        blockNumber: blockNumber,
      });

      for (const cTokenAddress of allMarkets) {
        let underlying = null;

        if (config.underlying[normalizeAddress(cTokenAddress)]) {
          underlying = config.underlying[normalizeAddress(cTokenAddress)];
        } else {
          const underlyingAddress = await this.services.blockchain.readContract({
            chain: config.chain,
            abi: this.abiConfigs.eventAbis.cErc20,
            target: cTokenAddress,
            method: 'underlying',
            params: [],
            blockNumber,
          });

          if (underlyingAddress) {
            underlying = await this.services.blockchain.getTokenInfo({
              chain: config.chain,
              address: underlyingAddress.toString(),
            });
          }
        }

        if (underlying) {
          const oraclePrice = await this.services.blockchain.readContract({
            chain: config.chain,
            target: oracleAddress,
            abi: this.abiConfigs.eventAbis.oracle,
            method: 'getUnderlyingPrice',
            params: [cTokenAddress],
            blockNumber: blockNumber,
          });

          let underlyingPrice = null;
          if (oraclePrice) {
            // Comptroller needs prices in the format: ${raw price} * 1e36 / baseUnit
            // The baseUnit of an asset is the amount of the smallest denomination of that asset per whole.
            // For example, the baseUnit of ETH is 1e18.
            // Since the prices in this view have 6 decimals, we must scale them by 1e(36 - 6)/baseUnit
            underlyingPrice = formatBigNumberToString(oraclePrice.toString(), 36 - underlying.decimals);
          }

          const ethPrice = await this.services.oracle.getTokenPriceUsd({
            chain: 'ethereum',
            address: AddressZero,
            timestamp: timestamp,
          });
          if (ethPrice && underlyingPrice) {
            underlyingPrice = new BigNumber(underlyingPrice).multipliedBy(ethPrice).toString(10);
          }

          markets.push({
            cToken: normalizeAddress(cTokenAddress),
            underlying: underlying,
            underlyingPrice: underlyingPrice,
          });
        }
      }
    }

    return markets;
  }
}
