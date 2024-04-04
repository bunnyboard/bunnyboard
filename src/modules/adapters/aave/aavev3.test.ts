import { describe, expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { ChainNames } from '../../../configs/names';
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

        if (config.chain === ChainNames.ethereum) {
          const reserveWETH = dataState[0];
          expect(reserveWETH.token.address).equal('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2');
          expect(reserveWETH.tokenPrice).equal('1596.8');
          expect(reserveWETH.totalDeposited).equal('1310.334610042306971678');
          expect(reserveWETH.totalBorrowed).equal('1310.333246453993068451');
          expect(reserveWETH.totalBorrowedStable).equal('0.001363588313903227');
          expect(reserveWETH.rateSupply).equal('0');
          expect(reserveWETH.rateBorrow).equal('0.00000071751420258995');
          expect(reserveWETH.rateBorrowStable).equal('0.01676066733810686886');
          expect(reserveWETH.rateLoanToValue).equal('0.8');
          expect(reserveWETH.rateReserveFactor).equal('0.15');
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
