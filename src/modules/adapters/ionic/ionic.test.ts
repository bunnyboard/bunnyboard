import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { IonicConfigs } from '../../../configs/protocols/ionic';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import IonicAdapter from './ionic';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1715299200;
test(`should get data correctly at ${getDateString(timestamp)} - ionic`, async function () {
  const adapter = new IonicAdapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    IonicConfigs,
  );

  const modeConfig = IonicConfigs.configs[0];
  const modeMarkets = await adapter.getLendingReservesDataState({
    config: modeConfig,
    timestamp: timestamp,
  });

  expect(modeMarkets).not.equal(null);

  console.log(modeMarkets);

  if (modeMarkets) {
    expect(modeMarkets.length).equal(10);
  }

  // if (modeMarkets) {
  //   expect(optimismMarkets[0].protocol).equal('sonne');
  //   expect(optimismMarkets[0].chain).equal('optimism');
  //   expect(optimismMarkets[0].token.address).equal('0x4200000000000000000000000000000000000006');
  //   expect(optimismMarkets[0].tokenPrice).equal('2093.03');
  //   expect(optimismMarkets[0].totalDeposited).equal('9020.172911670320916388');
  //   expect(optimismMarkets[0].totalBorrowed).equal('6263.566302875095949279');
  //
  //   for (const marketData of optimismMarkets) {
  //     expect(marketData.rateSupply).not.equal('NaN');
  //     expect(marketData.rateBorrow).not.equal('NaN');
  //     expect(marketData.rateLoanToValue).not.equal('NaN');
  //     expect(marketData.rateReserveFactor).not.equal('NaN');
  //   }
  // }
});
