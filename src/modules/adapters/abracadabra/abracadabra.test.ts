import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { TimeUnits } from '../../../configs/constants';
import { AbracadabraConfigs } from '../../../configs/protocols/abracadabra';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import AbracadabraAdapter from './abracadabra';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const adapter = new AbracadabraAdapter(
  {
    blockchain: blockchain,
    oracle: oracle,
  },
  {
    database: database,
    memcache: memcache,
  },
  AbracadabraConfigs,
);

const timestamp = 1711929600; // Mon Apr 01 2024 00:00:00 GMT+0000

test(`should get data correctly at ${getDateString(timestamp)} - abracadabra`, async (t) => {
  for (const config of AbracadabraConfigs.configs.slice(0)) {
    const assetData = await adapter.getLendingAssetData({
      config: config,
      fromTime: timestamp,
      toTime: timestamp + TimeUnits.SecondsPerDay,
    });

    expect(assetData).not.equal(null);
    if (assetData) {
      expect(assetData.tokenPrice).not.equal(null);
      expect(assetData.tokenPrice).not.equal('0');

      expect(assetData.collaterals.length).greaterThan(0);
    }
  }
});
