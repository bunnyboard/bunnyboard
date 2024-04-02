import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { TimeUnits } from '../../../configs/constants';
import { Uniswapv3Configs, Uniswapv3EthereumDexConfig } from '../../../configs/protocols/uniswap';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import Uniswapv3Adapter from './uniswapv3';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

test('should get dex correctly at birthday - uniswapv3 - ethereum', async function () {
  const adapter = new Uniswapv3Adapter(
    {
      oracle,
      blockchain,
    },
    {
      database: database,
      memcache: memcache,
    },
    Uniswapv3Configs,
  );

  const dexData = await adapter.getDexDataTimeframe({
    config: Uniswapv3EthereumDexConfig,
    fromTime: Uniswapv3EthereumDexConfig.birthday,
    toTime: Uniswapv3EthereumDexConfig.birthday + TimeUnits.SecondsPerDay,
    props: {
      disableGetEvents: true,
    },
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('uniswapv3');
    expect(dexData.totalLiquidityUsd).equal('137394340.5345573759570441859540094');
    expect(dexData.feesTradingUsd).equal('58451.08847582384028074319');
    expect(dexData.volumeTradingUsd).equal('16937182.15483943561610092783');
    expect(dexData.numberOfTransactions).equal(4624);
  }
});

const timestamp = 1704067200; // Mon Jan 01 2024 00:00:00 GMT+0000
test(`should get dex correctly at ${getDateString(timestamp)} - uniswapv3 - ethereum`, async function () {
  const adapter = new Uniswapv3Adapter(
    {
      oracle,
      blockchain,
    },
    {
      database: database,
      memcache: memcache,
    },
    Uniswapv3Configs,
  );

  const dexDataTimeframe = await adapter.getDexDataTimeframe({
    config: Uniswapv3EthereumDexConfig,
    fromTime: timestamp,
    toTime: timestamp + TimeUnits.SecondsPerDay,
  });

  if (dexDataTimeframe) {
    expect(dexDataTimeframe.protocol).equal('uniswapv3');
    expect(dexDataTimeframe.totalLiquidityUsd).equal('1977364172562.412927410608713074858');
    expect(dexDataTimeframe.feesTradingUsd).equal('1091394.94938159270307919002');
    expect(dexDataTimeframe.volumeTradingUsd).equal('618432381.66442523015304619071');
    expect(dexDataTimeframe.numberOfTransactions).equal(73213);
    expect(dexDataTimeframe.traders.length).greaterThan(0);
  }
});
