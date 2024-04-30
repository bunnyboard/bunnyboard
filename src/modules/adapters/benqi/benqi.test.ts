import { expect, test } from 'vitest';

import { DefaultMemcacheTime, ProtocolConfigs } from '../../../configs';
import { BenqiConfigs } from '../../../configs/protocols/benqi';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import BenqiAdapter from './benqi';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const adapter = new BenqiAdapter(
  {
    blockchain: blockchain,
    oracle: oracle,
  },
  {
    database: database,
    memcache: memcache,
  },
  BenqiConfigs,
);

test('should get data correctly at birthday - venus chain bnbchain', async function () {
  for (const config of ProtocolConfigs.benqi.configs) {
    const dataState = await adapter.getLendingReservesDataState({
      config: config,
      timestamp: config.birthday,
    });

    expect(dataState).not.equal(null);

    if (dataState) {
      for (const market of dataState) {
        expect(market.tokenPrice).not.equal(null);
        expect(market.tokenPrice).not.equal('0');
      }
    }
  }
});

const timestamp = 1704067200;
test(`should get data correctly at ${getDateString(timestamp)} - venus chain bnbchain`, async function () {
  for (const config of ProtocolConfigs.benqi.configs) {
    const dataState = await adapter.getLendingReservesDataState({
      config: config,
      timestamp: timestamp,
    });

    expect(dataState).not.equal(null);

    if (dataState) {
      for (const market of dataState) {
        expect(market.tokenPrice).not.equal(null);
        expect(market.tokenPrice).not.equal('0');
      }
    }
  }
});
