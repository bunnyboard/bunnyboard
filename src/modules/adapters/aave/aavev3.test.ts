import { describe, expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { OracleConfigs } from '../../../configs/oracles/configs';
import { AaveLendingMarketConfig, Aavev3Configs } from '../../../configs/protocols/aave';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import AaveLibs from '../../libs/aave';
import Aavev2Adapter from './aavev2';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1706745600; // Thu Feb 01 2024 00:00:00 GMT+0000

test('should have oracle configs for reserves correctly', async function () {
  for (const marketConfig of Aavev3Configs.configs) {
    const marketInfo = await AaveLibs.getMarketInfo(marketConfig as AaveLendingMarketConfig);
    expect(marketInfo).not.equal(null);
    if (marketInfo) {
      for (const token of marketInfo.reserves) {
        const oracleSource = (OracleConfigs as any)[token.chain][token.address];
        expect(oracleSource).not.equal(null);
        expect(oracleSource).not.equal(undefined);
      }
    }
  }
});

describe('should get data correctly at birthday', async function () {
  Aavev3Configs.configs.map((config) =>
    test(`should get data correctly at birthday chain ${config.chain}`, async function () {
      const aavev3Adapter = new Aavev2Adapter(
        {
          blockchain: blockchain,
          oracle: oracle,
        },
        {
          database: database,
          memcache: memcache,
        },
        Aavev3Configs,
      );

      const dataState = await aavev3Adapter.getLendingReservesDataState({
        config: config,
        timestamp: config.birthday,
      });

      if (dataState) {
        // should can get price of all reserves
        for (const reserve of dataState) {
          expect(
            reserve.tokenPrice,
            `can not get price of ${reserve.token.chain}:${reserve.token.address} at ${config.birthday}`,
          ).not.equal('0');
        }
      }
    }),
  );
});

describe(`should get data correctly at ${getDateString(timestamp)}`, async function () {
  Aavev3Configs.configs.map((config) =>
    test(`should get data correctly at ${getDateString(timestamp)} chain ${config.chain}`, async function () {
      const aavev3Adapter = new Aavev2Adapter(
        {
          blockchain: blockchain,
          oracle: oracle,
        },
        {
          database: database,
          memcache: memcache,
        },
        Aavev3Configs,
      );

      const dataState = await aavev3Adapter.getLendingReservesDataState({
        config: config,
        timestamp: timestamp,
      });

      if (dataState) {
        // should can get price of all reserves
        for (const reserve of dataState) {
          expect(
            reserve.tokenPrice,
            `can not get price of ${reserve.token.chain}:${reserve.token.address} at ${timestamp}`,
          ).not.equal('0');
        }
      }
    }),
  );
});
