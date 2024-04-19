import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { OrbitConfigs } from '../../../configs/protocols/orbit';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import OrbitAdapter from './orbit';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1712275200; // Fri Apr 05 2024 00:00:00 GMT+0000

const adapter = new OrbitAdapter(
  {
    blockchain: blockchain,
    oracle: oracle,
  },
  {
    database: database,
    memcache: memcache,
  },
  OrbitConfigs,
);

test('should get data correctly at birthday - orbit', async function () {
  for (const config of OrbitConfigs.configs) {
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

test(`should get data correctly at ${getDateString(timestamp)} - orbit`, async function () {
  for (const config of OrbitConfigs.configs) {
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
