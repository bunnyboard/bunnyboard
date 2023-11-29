import { expect } from 'chai';
import { describe } from 'mocha';

import { ProtocolConfigs } from '../configs';
import AaveLendingPoolV1Abi from '../configs/abi/aave/LendingPoolV1.json';
import AaveLendingPoolV2Abi from '../configs/abi/aave/LendingPoolV2.json';
import { OracleConfigs } from '../configs/oracles/configs';
import { CompoundLendingMarketConfig } from '../configs/protocols/compound';
import { normalizeAddress } from '../lib/utils';
import BlockchainService from '../services/blockchains/blockchain';
import { LendingMarketConfig } from '../types/configs';

function getAllLendingMarketConfigs(): Array<LendingMarketConfig> {
  let allMarkets: Array<LendingMarketConfig> = [];

  for (const [, config] of Object.entries(ProtocolConfigs)) {
    if (config.lendingMarkets) {
      allMarkets = allMarkets.concat(config.lendingMarkets);
    }
  }

  return allMarkets;
}

const blockchain = new BlockchainService();

describe('configurations', async function () {
  describe('lending market token price', async function () {
    getAllLendingMarketConfigs().map((market: LendingMarketConfig) =>
      it(`should have oracle config for tokens in lending market ${market.protocol}:${market.chain}:${market.address}`, async function () {
        if (market.version === 'compound') {
          expect(
            OracleConfigs[market.chain][(market as CompoundLendingMarketConfig).underlying.address],
            `token: ${normalizeAddress((market as CompoundLendingMarketConfig).underlying.address)}`,
          ).not.equal(undefined);
        } else if (market.version === 'aavev1' || market.version === 'aavev2' || market.version === 'aavev3') {
          // get reserve list
          const reserveList: Array<string> = await blockchain.singlecall({
            chain: market.chain,
            abi: market.version === 'aavev1' ? AaveLendingPoolV1Abi : AaveLendingPoolV2Abi,
            target: market.address,
            method: market.version === 'aavev1' ? 'getReserves' : 'getReservesList',
            params: [],
          });
          for (const reserve of reserveList) {
            expect(
              OracleConfigs[market.chain][normalizeAddress(reserve)],
              `token:${market.chain}:${normalizeAddress(reserve)}`,
            ).not.equal(undefined);
          }
        }
      }),
    );
  });
});
