import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { TimeUnits } from '../../../configs/constants';
import {
  SushiArbitrumDexConfig,
  SushiAvalancheDexConfig,
  SushiBnbchainDexConfig,
  SushiConfigs,
  SushiEthereumDexConfig,
  SushiFantomDexConfig,
  SushiPolygonDexConfig,
} from '../../../configs/protocols/sushi';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import SushiAdapter from './sushi';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

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
    expect(dexData.volumeTradingUsd).equal('36290586.24287358159156302179');
    expect(dexData.numberOfTransactions).equal(3792);
  }
});

test('should get dex correctly at birthday - sushi - arbitrum', async function () {
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

  const time = SushiArbitrumDexConfig.birthday;
  const dexData = await adapter.getDexDataTimeframe({
    config: SushiArbitrumDexConfig,
    fromTime: time,
    toTime: time + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('sushi');
    expect(dexData.totalLiquidityUsd).equal('4679798.556110116152790518626919942');
    expect(dexData.feesTradingUsd).equal('15704.14092649863231233848');
    expect(dexData.volumeTradingUsd).equal('5234713.64216621077077949341');
    expect(dexData.numberOfTransactions).equal(9285);
  }
});

test('should get dex correctly at birthday - sushi - polygon', async function () {
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

  const time = SushiPolygonDexConfig.birthday;
  const dexData = await adapter.getDexDataTimeframe({
    config: SushiPolygonDexConfig,
    fromTime: time,
    toTime: time + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('sushi');
    expect(dexData.totalLiquidityUsd).equal('960696874.72038614081689423146831');
    expect(dexData.feesTradingUsd).equal('415434.99310756879518148804');
    expect(dexData.volumeTradingUsd).equal('138478331.03585626506049601341');
    expect(dexData.numberOfTransactions).equal(117696);
  }
});

test('should get dex correctly at birthday - sushi - bnbchain', async function () {
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

  const time = SushiBnbchainDexConfig.birthday;
  const dexData = await adapter.getDexDataTimeframe({
    config: SushiBnbchainDexConfig,
    fromTime: time,
    toTime: time + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('sushi');
    expect(dexData.totalLiquidityUsd).equal('2306507.396905919276038129266631703');
    expect(dexData.feesTradingUsd).equal('131.8001777684143080193');
    expect(dexData.volumeTradingUsd).equal('43933.39258947143600643349');
    expect(dexData.numberOfTransactions).equal(944);
  }
});

test('should get dex correctly at birthday - sushi - avalanche', async function () {
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

  const time = SushiAvalancheDexConfig.birthday;
  const dexData = await adapter.getDexDataTimeframe({
    config: SushiAvalancheDexConfig,
    fromTime: time,
    toTime: time + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('sushi');
    expect(dexData.totalLiquidityUsd).equal('2113555.231883823816366515188307248');
    expect(dexData.feesTradingUsd).equal('281.39339546547793260377');
    expect(dexData.volumeTradingUsd).equal('93797.79848849264420125562');
    expect(dexData.numberOfTransactions).equal(229);
  }
});

test('should get dex correctly at birthday - sushi - fantom', async function () {
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

  const time = SushiFantomDexConfig.birthday;
  const dexData = await adapter.getDexDataTimeframe({
    config: SushiFantomDexConfig,
    fromTime: time,
    toTime: time + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('sushi');
    expect(dexData.totalLiquidityUsd).equal('8134600.098565192801818228351950732');
    expect(dexData.feesTradingUsd).equal('2097.05248107217241704538');
    expect(dexData.volumeTradingUsd).equal('699017.49369072413901512765');
    expect(dexData.numberOfTransactions).equal(17488);
  }
});
