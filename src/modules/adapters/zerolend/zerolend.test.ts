import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { ZerolendConfigs } from '../../../configs/protocols/zerolend';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import ZerolendAdapter from './zerolend';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1713139200; // Mon Apr 15 2024 00:00:00 GMT+0000

const adapter = new ZerolendAdapter(
  {
    blockchain: blockchain,
    oracle: oracle,
  },
  {
    database: database,
    memcache: memcache,
  },
  ZerolendConfigs,
);

test('should get data correctly at birthday - zerolend', async function () {
  for (const config of ZerolendConfigs.configs) {
    const dataState = await adapter.getLendingReservesDataState({
      config: config,
      timestamp: config.birthday,
    });

    expect(dataState).not.equal(undefined);

    if (dataState) {
      for (const item of dataState) {
        expect(item.tokenPrice).not.equal(null);
        expect(item.tokenPrice).not.equal('0');
      }
    }
  }
});

test(`should get data correctly at ${getDateString(timestamp)} - zerolend`, async function () {
  for (const config of ZerolendConfigs.configs) {
    const dataState = await adapter.getLendingReservesDataState({
      config: config,
      timestamp: timestamp,
    });

    expect(dataState).not.equal(undefined);

    if (dataState) {
      for (const item of dataState) {
        expect(item.tokenPrice).not.equal(null);
        expect(item.tokenPrice).not.equal('0');
      }
    }
  }
});
