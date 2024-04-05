import { expect, test } from 'vitest';

import { DefaultMemcacheTime, ProtocolConfigs } from '../../../configs';
import { OracleConfigs } from '../../../configs/oracles/configs';
import { CompoundConfigs, CompoundLendingMarketConfig } from '../../../configs/protocols/compound';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import CompoundLibs from '../../libs/compound';
import CompoundAdapter from './compound';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000

test('should have oracle configs for reserves correctly - compound', async function () {
  for (const marketConfig of CompoundConfigs.configs) {
    const cTokens = await CompoundLibs.getComptrollerInfo(marketConfig as CompoundLendingMarketConfig);

    for (const cToken of cTokens) {
      expect(OracleConfigs[cToken.underlying.chain][cToken.underlying.address]).not.equal(null);
      expect(OracleConfigs[cToken.underlying.chain][cToken.underlying.address]).not.equal(undefined);
    }
  }
});

test('should get data correctly at birthday - compound chain ethereum', async function () {
  const compoundAdapter = new CompoundAdapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    CompoundConfigs,
  );

  const configEthereum = ProtocolConfigs.compound.configs.filter((item) => item.chain === 'ethereum')[0];
  if (configEthereum) {
    const dataState = await compoundAdapter.getLendingReservesDataState({
      config: configEthereum,
      timestamp: configEthereum.birthday,
    });

    expect(dataState).not.equal(null);

    if (dataState) {
      expect(dataState.length).equal(6);

      // BAT
      expect(dataState[0].token.address).equal('0x0d8775f648430679a709e98d2b0cb6250d2887ef');
      expect(dataState[0].tokenPrice).equal('0');
      expect(dataState[0].totalDeposited).equal('4583.324763027966659441');
      expect(dataState[0].totalBorrowed).equal('202.0045613374933546');
      expect(dataState[0].rateSupply).equal('0.001520542415922288');
      expect(dataState[0].rateBorrow).equal('0.038333236203101646');
      expect(dataState[0].rateLoanToValue).equal('0.6');
      expect(dataState[0].rateReserveFactor).equal('0.1');

      // ETH
      expect(dataState[1].token.address).equal('0x0000000000000000000000000000000000000000');
      expect(dataState[1].tokenPrice).equal('0');
      expect(dataState[1].totalDeposited).equal('16.300560157857131411');
      expect(dataState[1].totalBorrowed).equal('1.000347046798872304');
      expect(dataState[1].rateSupply).equal('0.000782197799235184');
      expect(dataState[1].rateBorrow).equal('0.014162043203821978');
      expect(dataState[1].rateLoanToValue).equal('0.75');
      expect(dataState[1].rateReserveFactor).equal('0.1');

      // REP
      expect(dataState[2].token.address).equal('0x1985365e9f78359a9b6ad760e32412f4a445e862');
      expect(dataState[2].tokenPrice).equal('0');
      expect(dataState[2].totalDeposited).equal('15.407477596770091452');
      expect(dataState[2].totalBorrowed).equal('1');
      expect(dataState[2].rateSupply).equal('0.002660343341289506');
      expect(dataState[2].rateBorrow).equal('0.045543533815273696');
      expect(dataState[2].rateLoanToValue).equal('0.5');
      expect(dataState[2].rateReserveFactor).equal('0.1');

      // USDC
      expect(dataState[3].token.address).equal('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48');
      expect(dataState[3].tokenPrice).equal('1');
      expect(dataState[3].totalDeposited).equal('1235.849612');
      expect(dataState[3].totalBorrowed).equal('100.000061');
      expect(dataState[3].rateSupply).equal('0.001359845789387448');
      expect(dataState[3].rateBorrow).equal('0.018672931844788202');
      expect(dataState[3].rateLoanToValue).equal('0.75');

      // ZRX
      expect(dataState[4].token.address).equal('0xe41d2489571d322189246dafa5ebde1f4699f498');
      expect(dataState[4].tokenPrice).equal('0');
      expect(dataState[4].totalDeposited).equal('867.43633509853212105');
      expect(dataState[4].totalBorrowed).equal('100.0017247461115888');
      expect(dataState[4].rateSupply).equal('0.006534850476123706');
      expect(dataState[4].rateBorrow).equal('0.0629829886779525');
      expect(dataState[4].rateLoanToValue).equal('0.6');

      // SAI
      expect(dataState[5].token.address).equal('0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359');
      expect(dataState[5].tokenPrice).equal('0');
      expect(dataState[5].totalDeposited).equal('4024.146578585853746165');
      expect(dataState[5].totalBorrowed).equal('200.005117550053707');
      expect(dataState[5].rateSupply).equal('0.002888468341736374');
      expect(dataState[5].rateBorrow).equal('0.064574014342932154');
      expect(dataState[5].rateLoanToValue).equal('0.75');
    }
  }
});

test(`should get data correctly at ${getDateString(timestamp)} - compound chain ethereum`, async function () {
  const compoundAdapter = new CompoundAdapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    CompoundConfigs,
  );

  const configEthereum = ProtocolConfigs.compound.configs.filter((item) => item.chain === 'ethereum')[0];
  if (configEthereum) {
    const dataState = await compoundAdapter.getLendingReservesDataState({
      config: configEthereum,
      timestamp: timestamp,
    });

    expect(dataState).not.equal(null);

    if (dataState) {
      expect(dataState.length).equal(20);

      for (const reserve of dataState) {
        expect(
          reserve.tokenPrice,
          `can not get price of ${reserve.token.chain}:${reserve.token.address} at ${timestamp}`,
        ).not.eq('0');
      }
    }
  }
});
