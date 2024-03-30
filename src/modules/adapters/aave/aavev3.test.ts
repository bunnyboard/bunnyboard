import { expect, test } from 'vitest';

import { DefaultMemcacheTime, ProtocolConfigs } from '../../../configs';
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

const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000

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

test('should get data correctly at birthday - aavev3 chain ethereum', async function () {
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

  const configEthereum = ProtocolConfigs.aavev3.configs.filter((item) => item.chain === 'ethereum')[0];
  if (configEthereum) {
    const dataState = await aavev3Adapter.getLendingReservesDataState({
      config: configEthereum,
      timestamp: configEthereum.birthday,
    });

    if (dataState) {
      // have 7 reserves
      expect(dataState.length).equal(7);

      // should can get price of all reserves
      for (const reserve of dataState) {
        expect(
          reserve.tokenPrice,
          `can not get price of ${reserve.token.chain}:${reserve.token.address} at ${configEthereum.birthday}`,
        ).not.equal('0');
      }

      // WETH
      expect(dataState[0].token.address).equal('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2');
      expect(dataState[0].tokenPrice).equal('1596.8');
      expect(dataState[0].totalDeposited).equal('1310.334610042306971678');
      expect(dataState[0].totalBorrowed).equal('1310.333246453993068451');
      expect(dataState[0].totalBorrowedStable).equal('0.001363588313903227');
      expect(dataState[0].rateSupply).equal('0');
      expect(dataState[0].rateBorrow).equal('0.00000071751420258995');
      expect(dataState[0].rateBorrowStable).equal('0.01676066733810686886');
      expect(dataState[0].rateLoanToValue).equal('0.8');
    }
  }
});

test(`should get data correctly at ${getDateString(timestamp)} - aavev3 chain ethereum`, async function () {
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

  const configEthereum = ProtocolConfigs.aavev3.configs.filter((item) => item.chain === 'ethereum')[0];
  if (configEthereum) {
    const dataState = await aavev3Adapter.getLendingReservesDataState({
      config: configEthereum,
      timestamp: timestamp,
    });

    if (dataState) {
      // have 27 reserves
      expect(dataState.length).equal(27);

      // should can get price of all reserves
      for (const reserve of dataState) {
        expect(
          reserve.tokenPrice,
          `can not get price of ${reserve.token.chain}:${reserve.token.address} at ${timestamp}`,
        ).not.equal('0');
      }

      // WETH
      expect(dataState[0].token.address).equal('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2');
      expect(dataState[0].tokenPrice).equal('2358.45');
      expect(dataState[0].totalDeposited).equal('497860.465381326357488966');
      expect(dataState[0].totalBorrowed).equal('497842.947675340877416283');
      expect(dataState[0].totalBorrowedStable).equal('17.517705985480072683');
      expect(dataState[0].rateSupply).equal('0');
      expect(dataState[0].rateBorrow).equal('0.00038482068448128758');
      expect(dataState[0].rateBorrowStable).equal('0.01777411301810360863');
      expect(dataState[0].rateLoanToValue).equal('0.805');
    }
  }
});
