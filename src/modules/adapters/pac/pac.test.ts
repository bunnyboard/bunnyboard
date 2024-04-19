import { expect, test } from 'vitest';

import { DefaultMemcacheTime, ProtocolConfigs } from '../../../configs';
import { PacConfigs } from '../../../configs/protocols/pac';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import PacAdapter from './pac';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1713139200; // Mon Apr 15 2024 00:00:00 GMT+0000

test('should get data correctly at birthday - pac chain blast', async function () {
  const adapter = new PacAdapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    PacConfigs,
  );

  const configBlast = ProtocolConfigs.pac.configs.filter((item) => item.chain === 'blast')[0];
  if (configBlast) {
    const dataState = await adapter.getLendingReservesDataState({
      config: configBlast,
      timestamp: configBlast.birthday,
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

test(`should get data correctly at ${getDateString(timestamp)} - pac chain blast`, async function () {
  const adapter = new PacAdapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    PacConfigs,
  );

  const configBlast = ProtocolConfigs.pac.configs.filter((item) => item.chain === 'blast')[0];
  if (configBlast) {
    const dataState = await adapter.getLendingReservesDataState({
      config: configBlast,
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
