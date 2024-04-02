import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { TimeUnits } from '../../../configs/constants';
import { SushiConfigs, SushiEthereumDexConfig } from '../../../configs/protocols/sushi';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import SushiAdapter from './sushi';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

// const fromTime = 1590969600; // Mon Jun 01 2020 00:00:00 GMT+0000
// const toTime = 1591056000; // Tue Jun 02 2020 00:00:00 GMT+0000

test('should get dex correctly at birthday - sushi - ethereum', async function () {
  const adapter = new SushiAdapter(
    {
      oracle,
      blockchain,
    },
    {
      database: database,
      memcache: memcache,
    },
    SushiConfigs,
  );

  const time = SushiEthereumDexConfig.birthday;
  const dexData = await adapter.getDexDataTimeframe({
    config: SushiEthereumDexConfig,
    fromTime: time,
    toTime: time + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('sushi');
    expect(dexData.totalLiquidityUsd).equal('1139309011.751427521660199158817023');
    expect(dexData.feesTradingUsd).equal('108871.75872862074477468907');
    expect(dexData.feesTradingCumulativeUsd).equal('108871.75872862074477468907');
    expect(dexData.volumeTradingUsd).equal('36290586.24287358159156302179');
    expect(dexData.volumeTradingCumulativeUsd).equal('36290586.24287358159156302179');
    expect(dexData.numberOfTransactions).equal(3792);
    expect(dexData.numberOfTransactionsCumulative).equal(3812);
  }
});
