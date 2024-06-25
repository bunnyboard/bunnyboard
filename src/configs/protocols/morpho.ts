import {
  DataMetrics,
  IsolatedLendingMarketConfig,
  LendingMarketVersions,
  ProtocolConfig,
  Token,
} from '../../types/configs';
import MorphoFoundMarkets from '../data/statics/MorphoBlueMarkets.json';
import { ChainNames, ProtocolNames } from '../names';

export interface MorphoMarketConfig {
  id: string;
  debtToken: Token;
  collateral: Token;
  oracle: string;
  irm: string;
  ltv: string;
  birthday: number;
}

export interface MorphoBlueConfig extends IsolatedLendingMarketConfig {
  // other isolated lending pools has an unique smart contract address
  // but Morpho Blue manages all pools in a single Morpho Blue contract
  // so, we determine Morpho Market by it's marketId

  // https://docs.morpho.org/morpho-blue/contracts/morpho-blue#market-id
  // https://gist.github.com/tomrpl/3cfd34e04a01f9cbae2b16887f8026cf
  markets: Array<MorphoMarketConfig>;
}

export interface MorphoProtocolConfig extends ProtocolConfig {
  configs: Array<MorphoBlueConfig>;
}

function getMarkets(chain: string): Array<MorphoMarketConfig> {
  const markets: Array<MorphoMarketConfig> = [];

  for (const [id, config] of Object.entries(MorphoFoundMarkets)) {
    if (config.chain === chain) {
      markets.push({
        id: id,
        debtToken: config.debtToken,
        collateral: config.collateral,
        oracle: config.oracle,
        irm: config.irm,
        ltv: config.ltv,
        birthday: config.birthday,
      });
    }
  }

  return markets;
}

export const MorphoConfigs: MorphoProtocolConfig = {
  protocol: ProtocolNames.morpho,
  configs: [
    {
      chain: ChainNames.ethereum,
      protocol: ProtocolNames.morpho,
      metric: DataMetrics.isolatedLending,
      birthday: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
      birthblock: 18883124,
      version: LendingMarketVersions.isolated.morpho,
      address: '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb',
      markets: getMarkets(ChainNames.ethereum),
    },
    {
      chain: ChainNames.base,
      protocol: ProtocolNames.morpho,
      metric: DataMetrics.isolatedLending,
      birthday: 1714780800, // Sat May 04 2024 00:00:00 GMT+0000
      birthblock: 13977148,
      version: LendingMarketVersions.isolated.morpho,
      address: '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb',
      markets: getMarkets(ChainNames.base),
    },
  ],
};
