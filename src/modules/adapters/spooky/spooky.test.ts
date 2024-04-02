import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { TimeUnits } from '../../../configs/constants';
import { SpookyConfigs, SpookyFantomDexConfig } from '../../../configs/protocols/spooky';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import SpookyAdapter from './spooky';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

test('should get dex correctly at birthday - spooky - ethereum', async function () {
  const adapter = new SpookyAdapter(
    {
      oracle,
      blockchain,
    },
    {
      database: database,
      memcache: memcache,
    },
    SpookyConfigs,
  );

  const time = SpookyFantomDexConfig.birthday;
  const dexData = await adapter.getDexDataTimeframe({
    config: SpookyFantomDexConfig,
    fromTime: time,
    toTime: time + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('spooky');
    expect(dexData.totalLiquidityUsd).equal('3139095.250651139513913419370406897');
    expect(dexData.feesTradingUsd).equal('811.02186337902968108938');
    expect(dexData.volumeTradingUsd).equal('405510.93168951484054468925');
    expect(dexData.numberOfTransactions).equal(7083);
    expect(dexData.traders.length).greaterThan(0);
  }
});
