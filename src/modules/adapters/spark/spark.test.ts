import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { SparkConfigs } from '../../../configs/protocols/spark';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import SparkAdapter from './spark';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000

const adapter = new SparkAdapter(
  {
    blockchain: blockchain,
    oracle: oracle,
  },
  {
    database: database,
    memcache: memcache,
  },
  SparkConfigs,
);

test(`should get data correctly at birthday - spark`, async function () {
  for (const config of SparkConfigs.configs) {
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

test(`should get data correctly at ${getDateString(1704240000)} - spark`, async function () {
  for (const config of SparkConfigs.configs) {
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