import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { TimeUnits } from '../../../configs/constants';
import { Sushiv3Configs, Sushiv3EthereumDexConfig } from '../../../configs/protocols/sushi';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import Sushiv3Adapter from './sushiv3';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

test('should get dex correctly at birthday - sushiv3 - ethereum', async function () {
  const adapter = new Sushiv3Adapter(
    {
      oracle,
      blockchain,
    },
    {
      database: database,
      memcache: memcache,
    },
    Sushiv3Configs,
  );

  const dexData = await adapter.getDexDataTimeframe({
    config: Sushiv3EthereumDexConfig,
    fromTime: Sushiv3EthereumDexConfig.birthday,
    toTime: Sushiv3EthereumDexConfig.birthday + TimeUnits.SecondsPerDay,
    props: {
      disableGetEvents: true,
    },
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('sushiv3');
    expect(dexData.totalLiquidityUsd).equal('17339.1055699835369674737322508101');
    expect(dexData.feesTradingUsd).equal('0.25015841596401640732');
    expect(dexData.volumeTradingUsd).equal('500.31683192803281464518');
    expect(dexData.numberOfTransactions).equal(7);
  }
});

const timestamp = 1704067200; // Mon Jan 01 2024 00:00:00 GMT+0000
test(`should get dex correctly at ${getDateString(timestamp)} - uniswapv2 - ethereum`, async function () {
  const adapter = new Sushiv3Adapter(
    {
      oracle,
      blockchain,
    },
    {
      database: database,
      memcache: memcache,
    },
    Sushiv3Configs,
  );

  const dexDataTimeframe = await adapter.getDexDataTimeframe({
    config: Sushiv3EthereumDexConfig,
    fromTime: timestamp,
    toTime: timestamp + TimeUnits.SecondsPerDay,
  });

  if (dexDataTimeframe) {
    expect(dexDataTimeframe.protocol).equal('sushiv3');
    expect(dexDataTimeframe.totalLiquidityUsd).equal('2081965.082459591246553806450103639');
    expect(dexDataTimeframe.feesTradingUsd).equal('161.12537479885424703925');
    expect(dexDataTimeframe.volumeTradingUsd).equal('328915.91563758767186678132');
    expect(dexDataTimeframe.numberOfTransactions).equal(95);
    expect(dexDataTimeframe.traders.length).greaterThan(0);
  }
});
