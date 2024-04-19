import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { SeamlessConfigs } from '../../../configs/protocols/seamless';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import SeamlessAdapter from './seamless';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1713139200; // Mon Apr 15 2024 00:00:00 GMT+0000

test('should get data correctly at birthday - seamless chain base', async function () {
  const adapter = new SeamlessAdapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    SeamlessConfigs,
  );

  const configBase = SeamlessConfigs.configs.filter((item) => item.chain === 'base')[0];
  if (configBase) {
    const dataState = await adapter.getLendingReservesDataState({
      config: configBase,
      timestamp: configBase.birthday,
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

test(`should get data correctly at ${getDateString(timestamp)} - seamless chain base`, async function () {
  const adapter = new SeamlessAdapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    SeamlessConfigs,
  );

  const configBase = SeamlessConfigs.configs.filter((item) => item.chain === 'base')[0];
  if (configBase) {
    const dataState = await adapter.getLendingReservesDataState({
      config: configBase,
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
