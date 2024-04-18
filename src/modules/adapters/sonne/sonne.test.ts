import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { OracleConfigs } from '../../../configs/oracles/configs';
import { CompoundLendingMarketConfig } from '../../../configs/protocols/compound';
import { SonneConfigs } from '../../../configs/protocols/sonne';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import CompoundLibs from '../../libs/compound';
import SonneAdapter from './sonne';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1681603200; // Sun Apr 16 2023 00:00:00 GMT+0000

test('should have oracle configs for reserves correctly - sonne', async function () {
  for (const marketConfig of SonneConfigs.configs) {
    const cTokens = await CompoundLibs.getComptrollerInfo(marketConfig as CompoundLendingMarketConfig);

    for (const cToken of cTokens) {
      if (!marketConfig.blacklists || !marketConfig.blacklists[cToken.underlying.address]) {
        expect(
          OracleConfigs[cToken.underlying.chain][cToken.underlying.address],
          `${cToken.underlying.chain}:${cToken.underlying.address}`,
        ).not.equal(null);
        expect(
          OracleConfigs[cToken.underlying.chain][cToken.underlying.address],
          `${cToken.underlying.chain}:${cToken.underlying.address}`,
        ).not.equal(undefined);
      }
    }
  }
});

test(`should get data correctly at ${getDateString(timestamp)} - sonne`, async function () {
  const adapter = new SonneAdapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    SonneConfigs,
  );

  const optimismConfig = SonneConfigs.configs[0];
  const optimismMarkets = await adapter.getLendingReservesDataState({
    config: optimismConfig,
    timestamp: timestamp,
  });

  expect(optimismMarkets).not.equal(null);
  if (optimismMarkets) {
    expect(optimismMarkets[0].protocol).equal('sonne');
    expect(optimismMarkets[0].chain).equal('optimism');
    expect(optimismMarkets[0].token.address).equal('0x4200000000000000000000000000000000000006');
    expect(optimismMarkets[0].tokenPrice).equal('2093.03');
    expect(optimismMarkets[0].totalDeposited).equal('9020.172911670320916388');
    expect(optimismMarkets[0].totalBorrowed).equal('6263.566302875095949279');

    for (const marketData of optimismMarkets) {
      expect(marketData.rateSupply).not.equal('NaN');
      expect(marketData.rateBorrow).not.equal('NaN');
      expect(marketData.rateLoanToValue).not.equal('NaN');
      expect(marketData.rateReserveFactor).not.equal('NaN');
    }
  }
});
