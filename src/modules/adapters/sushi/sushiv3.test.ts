import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { TimeUnits } from '../../../configs/constants';
import {
  Sushiv3ArbitrumDexConfig,
  Sushiv3BaseDexConfig,
  Sushiv3Configs,
  Sushiv3EthereumDexConfig,
  Sushiv3OptimismDexConfig,
  Sushiv3PolygonDexConfig,
} from '../../../configs/protocols/sushi';
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

test('should get dex correctly at birthday - sushiv3 - arbitrum', async function () {
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
    config: Sushiv3ArbitrumDexConfig,
    fromTime: Sushiv3ArbitrumDexConfig.birthday,
    toTime: Sushiv3ArbitrumDexConfig.birthday + TimeUnits.SecondsPerDay,
    props: {
      disableGetEvents: true,
    },
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('sushiv3');
    expect(dexData.totalLiquidityUsd).equal('28633.67069863358930417133494563198');
    expect(dexData.feesTradingUsd).equal('1.93320559898444687642');
    expect(dexData.volumeTradingUsd).equal('3217.73048243908786213902');
    expect(dexData.numberOfTransactions).equal(63);
  }
});

test('should get dex correctly at birthday - sushiv3 - optimism', async function () {
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
    config: Sushiv3OptimismDexConfig,
    fromTime: Sushiv3OptimismDexConfig.birthday,
    toTime: Sushiv3OptimismDexConfig.birthday + TimeUnits.SecondsPerDay,
    props: {
      disableGetEvents: true,
    },
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('sushiv3');
    expect(dexData.totalLiquidityUsd).equal('22748.92382826008194104195613005289');
    expect(dexData.feesTradingUsd).equal('1.41217324474611233543');
    expect(dexData.volumeTradingUsd).equal('1523.69211886706625244074');
    expect(dexData.numberOfTransactions).equal(9);
  }
});

test('should get dex correctly at birthday - sushiv3 - polygon', async function () {
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
    config: Sushiv3PolygonDexConfig,
    fromTime: Sushiv3PolygonDexConfig.birthday,
    toTime: Sushiv3PolygonDexConfig.birthday + TimeUnits.SecondsPerDay,
    props: {
      disableGetEvents: true,
    },
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('sushiv3');
    expect(dexData.totalLiquidityUsd).equal('24577.71262638236897873028854941955');
    expect(dexData.feesTradingUsd).equal('1.23473795197410508802');
    expect(dexData.volumeTradingUsd).equal('2457.06299894821017603676');
    expect(dexData.numberOfTransactions).equal(53);
  }
});

test('should get dex correctly at birthday - sushiv3 - base', async function () {
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
    config: Sushiv3BaseDexConfig,
    fromTime: Sushiv3BaseDexConfig.birthday,
    toTime: Sushiv3BaseDexConfig.birthday + TimeUnits.SecondsPerDay,
    props: {
      disableGetEvents: true,
    },
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('sushiv3');
    expect(dexData.totalLiquidityUsd).equal('7181969.08863620588646914779408739');
    expect(dexData.feesTradingUsd).equal('57841.80819857531496014315');
    expect(dexData.volumeTradingUsd).equal('9743233.41729992235437819472');
    expect(dexData.numberOfTransactions).equal(15248);
  }
});
