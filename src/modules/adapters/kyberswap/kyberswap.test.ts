import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { TimeUnits } from '../../../configs/constants';
import {
  KyberswapArbitrumDexConfig,
  KyberswapAvalancheDexConfig,
  KyberswapBaseDexConfig,
  KyberswapBnbchainDexConfig,
  KyberswapConfigs,
  KyberswapEthereumDexConfig,
  KyberswapFantomDexConfig,
  KyberswapOptimismDexConfig,
  KyberswapPolygonDexConfig,
  KyberswapScrollDexConfig,
} from '../../../configs/protocols/kyberswap';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import KyberswapAdapter from './kyberswap';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

// const fromTime = 1590969600; // Mon Jun 01 2020 00:00:00 GMT+0000
// const toTime = 1591056000; // Tue Jun 02 2020 00:00:00 GMT+0000

test('should get dex correctly at birthday - kyberswap - ethereum', async function () {
  const adapter = new KyberswapAdapter(
    {
      oracle,
      blockchain,
    },
    {
      database: database,
      memcache: memcache,
    },
    KyberswapConfigs,
  );

  const time = KyberswapEthereumDexConfig.birthday;
  const dexData = await adapter.getDexDataTimeframe({
    config: KyberswapEthereumDexConfig,
    fromTime: time,
    toTime: time + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('kyberswap');
    expect(dexData.totalLiquidityUsd).equal('1046407.621886441531496679460224663');
    expect(dexData.feesTradingUsd).equal('0.52432229841080383585');
    expect(dexData.volumeTradingUsd).equal('174.77409947026794528241');
    expect(dexData.numberOfTransactions).equal(20);
  }
});

test('should get dex correctly at birthday - kyberswap - arbitrum', async function () {
  const adapter = new KyberswapAdapter(
    {
      oracle,
      blockchain,
    },
    {
      database: database,
      memcache: memcache,
    },
    KyberswapConfigs,
  );

  const time = KyberswapArbitrumDexConfig.birthday;
  const dexData = await adapter.getDexDataTimeframe({
    config: KyberswapArbitrumDexConfig,
    fromTime: time,
    toTime: time + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('kyberswap');
    expect(dexData.totalLiquidityUsd).equal('15926378.81432061909602907376393237');
    expect(dexData.feesTradingUsd).equal('62466.23615134272822167726');
    expect(dexData.volumeTradingUsd).equal('23080999.64488316089003055036');
    expect(dexData.numberOfTransactions).equal(10602);
  }
});

test('should get dex correctly at birthday - kyberswap - polygon', async function () {
  const adapter = new KyberswapAdapter(
    {
      oracle,
      blockchain,
    },
    {
      database: database,
      memcache: memcache,
    },
    KyberswapConfigs,
  );

  const time = KyberswapPolygonDexConfig.birthday;
  const dexData = await adapter.getDexDataTimeframe({
    config: KyberswapPolygonDexConfig,
    fromTime: time,
    toTime: time + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('kyberswap');
    expect(dexData.totalLiquidityUsd).equal('9017439.366458025466831692924798951');
    expect(dexData.feesTradingUsd).equal('17012.61885237031957245241');
    expect(dexData.volumeTradingUsd).equal('8300250.17132919187973824041');
    expect(dexData.numberOfTransactions).equal(11161);
  }
});

test('should get dex correctly at birthday - kyberswap - optimism', async function () {
  const adapter = new KyberswapAdapter(
    {
      oracle,
      blockchain,
    },
    {
      database: database,
      memcache: memcache,
    },
    KyberswapConfigs,
  );

  const time = KyberswapOptimismDexConfig.birthday;
  const dexData = await adapter.getDexDataTimeframe({
    config: KyberswapOptimismDexConfig,
    fromTime: time,
    toTime: time + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('kyberswap');
    expect(dexData.totalLiquidityUsd).equal('7000302.189371018691829280401801234');
    expect(dexData.feesTradingUsd).equal('9933.19086489386168804056');
    expect(dexData.volumeTradingUsd).equal('3396563.36767314707032284741');
    expect(dexData.numberOfTransactions).equal(2076);
  }
});

test('should get dex correctly at birthday - kyberswap - base', async function () {
  const adapter = new KyberswapAdapter(
    {
      oracle,
      blockchain,
    },
    {
      database: database,
      memcache: memcache,
    },
    KyberswapConfigs,
  );

  const time = KyberswapBaseDexConfig.birthday;
  const dexData = await adapter.getDexDataTimeframe({
    config: KyberswapBaseDexConfig,
    fromTime: time,
    toTime: time + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('kyberswap');
    expect(dexData.totalLiquidityUsd).equal('5616.586738987200115573520828747288');
    expect(dexData.feesTradingUsd).equal('0.69354900881601108503');
    expect(dexData.volumeTradingUsd).equal('152.59758680595545988901');
    expect(dexData.numberOfTransactions).equal(7);
  }
});

test('should get dex correctly at birthday - kyberswap - bnbchain', async function () {
  const adapter = new KyberswapAdapter(
    {
      oracle,
      blockchain,
    },
    {
      database: database,
      memcache: memcache,
    },
    KyberswapConfigs,
  );

  const time = KyberswapBnbchainDexConfig.birthday;
  const dexData = await adapter.getDexDataTimeframe({
    config: KyberswapBnbchainDexConfig,
    fromTime: time,
    toTime: time + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('kyberswap');
    expect(dexData.totalLiquidityUsd).equal('13297.78428855410611692599453965118');
    expect(dexData.feesTradingUsd).equal('0.43317034398852569696');
    expect(dexData.volumeTradingUsd).equal('43.49035459945956600225');
    expect(dexData.numberOfTransactions).equal(2);
  }
});

test('should get dex correctly at birthday - kyberswap - fantom', async function () {
  const adapter = new KyberswapAdapter(
    {
      oracle,
      blockchain,
    },
    {
      database: database,
      memcache: memcache,
    },
    KyberswapConfigs,
  );

  const time = KyberswapFantomDexConfig.birthday;
  const dexData = await adapter.getDexDataTimeframe({
    config: KyberswapFantomDexConfig,
    fromTime: time,
    toTime: time + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('kyberswap');
    expect(dexData.totalLiquidityUsd).equal('36902.53288004574754959590308972995');
    expect(dexData.feesTradingUsd).equal('21.22269027409334464661');
    expect(dexData.volumeTradingUsd).equal('2660.67421607317547350868');
    expect(dexData.numberOfTransactions).equal(53);
  }
});

test('should get dex correctly at birthday - kyberswap - avalanche', async function () {
  const adapter = new KyberswapAdapter(
    {
      oracle,
      blockchain,
    },
    {
      database: database,
      memcache: memcache,
    },
    KyberswapConfigs,
  );

  const time = KyberswapAvalancheDexConfig.birthday;
  const dexData = await adapter.getDexDataTimeframe({
    config: KyberswapAvalancheDexConfig,
    fromTime: time,
    toTime: time + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('kyberswap');
    expect(dexData.totalLiquidityUsd).equal('622479.1247642699908458847667470366');
    expect(dexData.feesTradingUsd).equal('305.66732244055929675129');
    expect(dexData.volumeTradingUsd).equal('93459.64617272597802398482');
    expect(dexData.numberOfTransactions).equal(206);
  }
});

test('should get dex correctly at birthday - kyberswap - scroll', async function () {
  const adapter = new KyberswapAdapter(
    {
      oracle,
      blockchain,
    },
    {
      database: database,
      memcache: memcache,
    },
    KyberswapConfigs,
  );

  const time = KyberswapScrollDexConfig.birthday;
  const dexData = await adapter.getDexDataTimeframe({
    config: KyberswapScrollDexConfig,
    fromTime: time,
    toTime: time + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('kyberswap');
    expect(dexData.totalLiquidityUsd).equal('4433302.332253665668300178213998308');
    expect(dexData.feesTradingUsd).equal('2124.35037350648416204641');
    expect(dexData.volumeTradingUsd).equal('3014410.2024048941276434246');
    expect(dexData.numberOfTransactions).equal(3530);
  }
});
