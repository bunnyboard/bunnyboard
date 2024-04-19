import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { MendiConfigs } from '../../../configs/protocols/mendi';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import MendiAdapter from './mendi';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000

const adapter = new MendiAdapter(
  {
    blockchain: blockchain,
    oracle: oracle,
  },
  {
    database: database,
    memcache: memcache,
  },
  MendiConfigs,
);

test('should get data correctly at birthday - mendi', async function () {
  for (const config of MendiConfigs.configs) {
    const dataState = await adapter.getLendingReservesDataState({
      config: config,
      timestamp: config.birthday,
    });

    expect(dataState).not.equal(null);

    if (dataState) {
      for (const item of dataState) {
        expect(item.tokenPrice).not.equal(null);
        expect(item.tokenPrice).not.equal('0');
      }
    }
  }
});

test(`should get data correctly at ${getDateString(timestamp)} - mendi`, async function () {
  for (const config of MendiConfigs.configs) {
    const dataState = await adapter.getLendingReservesDataState({
      config: config,
      timestamp: timestamp,
    });

    expect(dataState).not.equal(null);

    if (dataState) {
      for (const item of dataState) {
        expect(item.tokenPrice).not.equal(null);
        expect(item.tokenPrice).not.equal('0');
      }
    }
  }
});
