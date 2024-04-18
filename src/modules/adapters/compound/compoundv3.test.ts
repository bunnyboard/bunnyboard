import { describe, expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { TimeUnits } from '../../../configs/constants';
import { Compoundv3Configs } from '../../../configs/protocols/compound';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import Compoundv3Adapter from './compoundv3';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

describe('can get data correctly at birthday - compoundv3 comet', async function () {
  Compoundv3Configs.configs.map((config) =>
    test(`can get data correctly token ${config.debtToken.symbol} chain ${config.chain}`, async function () {
      const compoundv3Adapter = new Compoundv3Adapter(
        {
          blockchain: blockchain,
          oracle: oracle,
        },
        {
          database: database,
          memcache: memcache,
        },
        Compoundv3Configs,
      );

      const dataState = await compoundv3Adapter.getLendingAssetDataState({
        config: config,
        timestamp: config.birthday,
      });

      expect(dataState).not.equal(null);
      if (dataState) {
        expect(dataState.tokenPrice).not.equal(null);
        expect(dataState.tokenPrice).not.equal('0');
      }
    }),
  );
});

const timestamp = 1704067200; // Mon Jan 01 2024 00:00:00 GMT+0000
test(`should get data correctly at ${getDateString(timestamp)} - compoundv3 comet USDC - ethereum`, async function () {
  const compoundv3Adapter = new Compoundv3Adapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    Compoundv3Configs,
  );

  const dataState = await compoundv3Adapter.getLendingAssetDataTimeframe({
    config: Compoundv3Configs.configs[0],
    fromTime: timestamp,
    toTime: timestamp + TimeUnits.SecondsPerDay,
  });

  expect(dataState).not.equal(null);
  if (dataState) {
    expect(dataState.tokenPrice).equal('1.0003');
    expect(dataState.totalDeposited).equal('386940435.391073');
    expect(dataState.totalBorrowed).equal('365694248.641656');
    expect(dataState.rateSupply).equal('0.054257177242944');
    expect(dataState.rateBorrow).equal('0.063606177203328');
    expect(dataState.volumeDeposited).equal('5911358.186397');
    expect(dataState.volumeWithdrawn).equal('2796187.000438');
    expect(dataState.volumeBorrowed).equal('2230030');
    expect(dataState.volumeRepaid).equal('340539.470732');
    expect(dataState.collaterals.length).equal(5);

    expect(dataState.collaterals[0].totalDeposited).equal('896007.971926784383480098');
    expect(dataState.collaterals[0].rateLoanToValue).equal('0.65');
    expect(dataState.collaterals[1].totalDeposited).equal('11225.10350487');
    expect(dataState.collaterals[1].rateLoanToValue).equal('0.7');
    expect(dataState.collaterals[1].volumeDeposited).equal('50.383914');
    expect(dataState.collaterals[1].volumeWithdrawn).equal('2.89999999244372226');
  }
});
