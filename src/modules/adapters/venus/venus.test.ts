import { expect, test } from 'vitest';

import { DefaultMemcacheTime, ProtocolConfigs } from '../../../configs';
import { VenusConfigs } from '../../../configs/protocols/venus';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import VenusAdapter from './venus';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1711929600; // Mon Apr 01 2024 00:00:00 GMT+0000

test('should get data correctly at birthday - venus chain bnbchain', async function () {
  const adapter = new VenusAdapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    VenusConfigs,
  );

  const configBnbchain = ProtocolConfigs.venus.configs.filter((item) => item.chain === 'bnbchain')[0];
  if (configBnbchain) {
    const dataState = await adapter.getLendingReservesDataState({
      config: configBnbchain,
      timestamp: configBnbchain.birthday,
    });

    expect(dataState).not.equal(null);

    if (dataState) {
      expect(dataState.length).equal(17);
    }
  }
});

test(`should get data correctly at ${getDateString(timestamp)} - venus chain bnbchain`, async function () {
  const adapter = new VenusAdapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    VenusConfigs,
  );

  const configBnbchain = ProtocolConfigs.venus.configs.filter((item) => item.chain === 'bnbchain')[0];
  if (configBnbchain) {
    const dataState = await adapter.getLendingReservesDataState({
      config: configBnbchain,
      timestamp: timestamp,
    });

    expect(dataState).not.equal(null);

    if (dataState) {
      expect(dataState.length).equal(30);

      for (const reserve of dataState) {
        expect(
          reserve.tokenPrice,
          `can not get price of ${reserve.token.chain}:${reserve.token.address} at ${timestamp}`,
        ).not.eq('0');
      }
    }
  }
});

const currentTimestamp = 1716508800;
test(`should get data correctly at ${getDateString(currentTimestamp)} - venus chain ethereum`, async function () {
  const adapter = new VenusAdapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    VenusConfigs,
  );

  const configEthereum = ProtocolConfigs.venus.configs.filter((item) => item.chain === 'ethereum')[0];
  if (configEthereum) {
    const dataTimeframe = await adapter.getLendingReservesDataTimeframe({
      config: configEthereum,
      fromTime: currentTimestamp,
      toTime: currentTimestamp + 24 * 60 * 60,
    });

    expect(dataTimeframe).not.equal(null);

    if (dataTimeframe) {
      expect(dataTimeframe.length).equal(9);

      for (const reserve of dataTimeframe) {
        expect(
          reserve.tokenPrice,
          `can not get price of ${reserve.token.chain}:${reserve.token.address} at ${currentTimestamp}`,
        ).not.eq('0');
      }
    }
  }
});
