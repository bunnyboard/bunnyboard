import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { TimeUnits } from '../../../configs/constants';
import {
  Uniswapv3ArbitrumDexConfig,
  Uniswapv3BaseDexConfig,
  Uniswapv3BnbchainDexConfig,
  Uniswapv3Configs,
  Uniswapv3EthereumDexConfig,
  Uniswapv3OptimismDexConfig,
} from '../../../configs/protocols/uniswap';
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

test('should get dex correctly at birthday - uniswapv3 - arbitrum', async function () {
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
    config: Uniswapv3ArbitrumDexConfig,
    fromTime: Uniswapv3ArbitrumDexConfig.birthday,
    toTime: Uniswapv3ArbitrumDexConfig.birthday + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('uniswapv3');
    expect(dexData.totalLiquidityUsd).equal('1781601.072869737277836648752458035');
    expect(dexData.feesTradingUsd).equal('686.35314516870742088084');
    expect(dexData.volumeTradingUsd).equal('547511.44090903908701347059');
    expect(dexData.numberOfTransactions).equal(859);
  }
});

test('should get dex correctly at birthday - uniswapv3 - optimism', async function () {
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
    config: Uniswapv3OptimismDexConfig,
    fromTime: Uniswapv3OptimismDexConfig.birthday,
    toTime: Uniswapv3OptimismDexConfig.birthday + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('uniswapv3');
    expect(dexData.totalLiquidityUsd).equal('35410328.76572047964127773920848008');
    expect(dexData.feesTradingUsd).equal('23557.38363315055423841869');
    expect(dexData.volumeTradingUsd).equal('16321818.49262120481939521455');
    expect(dexData.numberOfTransactions).equal(5042);
  }
});

test('should get dex correctly at birthday - uniswapv3 - bnbchain', async function () {
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
    config: Uniswapv3BnbchainDexConfig,
    fromTime: Uniswapv3BnbchainDexConfig.birthday,
    toTime: Uniswapv3BnbchainDexConfig.birthday + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('uniswapv3');
    expect(dexData.totalLiquidityUsd).equal('1290.128505556085996292386430181786');
    expect(dexData.feesTradingUsd).equal('1.01144876908800014183');
    expect(dexData.volumeTradingUsd).equal('337.14958969600004727518');
    expect(dexData.numberOfTransactions).equal(29);
  }
});

test('should get dex correctly at birthday - uniswapv3 - base', async function () {
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
    config: Uniswapv3BaseDexConfig,
    fromTime: Uniswapv3BaseDexConfig.birthday,
    toTime: Uniswapv3BaseDexConfig.birthday + TimeUnits.SecondsPerDay,
  });

  expect(dexData).not.equal(null);
  if (dexData) {
    expect(dexData.protocol).equal('uniswapv3');
    expect(dexData.totalLiquidityUsd).equal('99697.00197078393364981585377596407');
    expect(dexData.feesTradingUsd).equal('46.19003613231938602296');
    expect(dexData.volumeTradingUsd).equal('92380.07226406463412740439');
    expect(dexData.numberOfTransactions).equal(126);
  }
});
