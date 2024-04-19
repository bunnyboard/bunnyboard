import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { RadiantConfigs } from '../../../configs/protocols/radiant';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import RadiantAdapter from './radiant';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000

test(`should get data correctly at birthday - radiant`, async function () {
  const radiantAdapter = new RadiantAdapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    RadiantConfigs,
  );

  for (const config of RadiantConfigs.configs) {
    const dataState = await radiantAdapter.getLendingReservesDataState({
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

test(`should get data correctly at ${getDateString(1704240000)} - radiant`, async function () {
  const radiantAdapter = new RadiantAdapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    RadiantConfigs,
  );

  for (const config of RadiantConfigs.configs) {
    const dataState = await radiantAdapter.getLendingReservesDataState({
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
