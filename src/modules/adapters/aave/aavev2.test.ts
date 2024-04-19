import { expect, test } from 'vitest';

import { DefaultMemcacheTime, ProtocolConfigs, TokenListBase } from '../../../configs';
import { Aavev2Configs } from '../../../configs/protocols/aave';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import Aavev2Adapter from './aavev2';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000

test('should get data correctly at birthday - aavev2 chain ethereum', async function () {
  const aavev2Adapter = new Aavev2Adapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    Aavev2Configs,
  );

  const configEthereum = ProtocolConfigs.aavev2.configs.filter((item) => item.chain === 'ethereum')[0];
  if (configEthereum) {
    const dataState = await aavev2Adapter.getLendingReservesDataState({
      config: configEthereum,
      timestamp: configEthereum.birthday,
    });

    expect(dataState).not.equal(null);

    if (dataState) {
      // have 6 reserves
      expect(dataState.length).equal(6);

      // should can get price of all reserves
      for (const reserve of dataState) {
        expect(
          reserve.tokenPrice,
          `can not get price of ${reserve.token.chain}:${reserve.token.address} at ${configEthereum.birthday}`,
        ).not.equal('0');
      }

      // the first reserve should be USDT
      expect(dataState[0].token.address).equal(TokenListBase.ethereum.USDT.address);
      expect(dataState[0].tokenPrice).equal('1.00089600916404');
      expect(dataState[0].totalDeposited).equal('0');
      expect(dataState[0].totalBorrowed).equal('0');
      expect(dataState[0].totalBorrowedStable).equal('0');
      expect(dataState[0].rateSupply).equal('0');
      expect(dataState[0].rateBorrow).equal('0');
      expect(dataState[0].rateBorrowStable).equal('0');
      expect(dataState[0].rateLoanToValue).equal('0.8');
      expect(dataState[0].rateReserveFactor).equal('0.1');

      // the second reserve should be WBTC
      expect(dataState[1].token.address).equal(TokenListBase.ethereum.WBTC.address);
      expect(dataState[1].tokenPrice).equal('19538.3754123054');
      expect(dataState[1].totalDeposited).equal('0');
      expect(dataState[1].totalBorrowed).equal('0');
      expect(dataState[1].totalBorrowedStable).equal('0');
      expect(dataState[1].rateSupply).equal('0');
      expect(dataState[1].rateBorrow).equal('0');
      expect(dataState[1].rateBorrowStable).equal('0');
      expect(dataState[1].rateLoanToValue).equal('0.7');
      expect(dataState[1].rateReserveFactor).equal('0.2');

      // the second reserve should be WETH
      expect(dataState[2].token.address).equal(TokenListBase.ethereum.WETH.address);
      expect(dataState[2].tokenPrice).equal('614.80098843');
      expect(dataState[2].totalDeposited).equal('0.0002');
      expect(dataState[2].totalBorrowed).equal('0');
      expect(dataState[2].totalBorrowedStable).equal('0');
      expect(dataState[2].rateSupply).equal('0');
      expect(dataState[2].rateBorrow).equal('0');
      expect(dataState[2].rateBorrowStable).equal('0.03');
      expect(dataState[2].rateLoanToValue).equal('0.8');
      expect(dataState[2].rateReserveFactor).equal('0.1');

      // the fourth reserve should be YFI
      expect(dataState[3].token.address).equal('0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e');
      expect(dataState[3].tokenPrice).equal('26416.3739288532824523');
      expect(dataState[3].totalDeposited).equal('0');
      expect(dataState[3].totalBorrowed).equal('0');
      expect(dataState[3].totalBorrowedStable).equal('0');
      expect(dataState[3].rateSupply).equal('0');
      expect(dataState[3].rateBorrow).equal('0');
      expect(dataState[3].rateBorrowStable).equal('0');
      expect(dataState[3].rateLoanToValue).equal('0.4');
      expect(dataState[3].rateReserveFactor).equal('0.2');

      // ZRX
      expect(dataState[4].token.address).equal('0xe41d2489571d322189246dafa5ebde1f4699f498');
      expect(dataState[4].tokenPrice).equal('0.4252639917069153');
      expect(dataState[4].totalDeposited).equal('0');
      expect(dataState[4].totalBorrowed).equal('0');
      expect(dataState[4].totalBorrowedStable).equal('0');
      expect(dataState[4].rateSupply).equal('0');
      expect(dataState[4].rateBorrow).equal('0');
      expect(dataState[4].rateBorrowStable).equal('0');
      expect(dataState[4].rateLoanToValue).equal('0.6');
      expect(dataState[3].rateReserveFactor).equal('0.2');

      // UNI
      expect(dataState[5].token.address).equal('0x1f9840a85d5af5bf1d1762f925bdaddc4201f984');
      expect(dataState[5].tokenPrice).equal('3.7905800862047022');
      expect(dataState[5].totalDeposited).equal('0');
      expect(dataState[5].totalBorrowed).equal('0');
      expect(dataState[5].totalBorrowedStable).equal('0');
      expect(dataState[5].rateSupply).equal('0');
      expect(dataState[5].rateBorrow).equal('0');
      expect(dataState[5].rateBorrowStable).equal('0');
      expect(dataState[5].rateLoanToValue).equal('0.6');
      expect(dataState[3].rateReserveFactor).equal('0.2');
    }
  }
});

test('should get data correctly at birthday - aavev2 chain polygon', async function () {
  const aavev2Adapter = new Aavev2Adapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    Aavev2Configs,
  );

  const configPolygon = ProtocolConfigs.aavev2.configs.filter((item) => item.chain === 'polygon')[0];
  if (configPolygon) {
    const dataState = await aavev2Adapter.getLendingReservesDataState({
      config: configPolygon,
      timestamp: configPolygon.birthday,
    });

    expect(dataState).not.equal(null);

    if (dataState) {
      // should have 7 reserves
      expect(dataState.length).equal(7);

      // should can get price of all reserves
      for (const reserve of dataState) {
        expect(
          reserve.tokenPrice,
          `can not get price of ${reserve.token.chain}:${reserve.token.address} at ${configPolygon.birthday}`,
        ).not.equal('0');
      }

      // DAI
      expect(dataState[0].token.address).equal('0x8f3cf7ad23cd3cadbd9735aff958023239c6a063');
      expect(dataState[0].tokenPrice).equal('0.998636333');
      expect(dataState[0].totalDeposited).equal('101332.107924560982045932');
      expect(dataState[0].totalBorrowed).equal('48062.49239215150484135');
      expect(dataState[0].totalBorrowedStable).equal('0');
      expect(dataState[0].rateSupply).equal('0.01012350049836042152');
      expect(dataState[0].rateBorrow).equal('0.02371532614899817799');
      expect(dataState[0].rateBorrowStable).equal('0.050857663074499089');
      expect(dataState[0].rateLoanToValue).equal('0.75');

      // USDC
      expect(dataState[1].token.address).equal('0x2791bca1f2de4661ed88a30c99a7a9449aa84174');
      expect(dataState[1].tokenPrice).equal('1.00063513585');
      expect(dataState[1].totalDeposited).equal('137335.638894');
      expect(dataState[1].totalBorrowed).equal('39697.691309');
      expect(dataState[1].totalBorrowedStable).equal('0');
      expect(dataState[1].rateSupply).equal('0.00334212868139191082');
      expect(dataState[1].rateBorrow).equal('0.0128469214862423211');
      expect(dataState[1].rateBorrowStable).equal('0.04542346074312116055');
      expect(dataState[1].rateLoanToValue).equal('0.8');

      // USDT
      expect(dataState[2].token.address).equal('0xc2132d05d31c914a87c6611c10748aeb04b58e8f');
      expect(dataState[2].tokenPrice).equal('1.000740336');
      expect(dataState[2].totalDeposited).equal('100005.000601');
      expect(dataState[2].totalBorrowed).equal('2212.017328');
      expect(dataState[2].totalBorrowedStable).equal('0');
      expect(dataState[2].rateSupply).equal('0.00001957012454484763');
      expect(dataState[2].rateBorrow).equal('0.00098306963306231042');
      expect(dataState[2].rateBorrowStable).equal('0.03549153481653115521');
      expect(dataState[2].rateLoanToValue).equal('0');

      // WBTC
      expect(dataState[3].token.address).equal('0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6');
      expect(dataState[3].tokenPrice).equal('58854.7021');
      expect(dataState[3].totalDeposited).equal('0.8016695');
      expect(dataState[3].totalBorrowed).equal('0.000005');
      expect(dataState[3].totalBorrowedStable).equal('0');
      expect(dataState[3].rateSupply).equal('0.00000000000383014696');
      expect(dataState[3].rateBorrow).equal('0.00000076762882382904');
      expect(dataState[3].rateBorrowStable).equal('0.0300009595360297863');
      expect(dataState[3].rateLoanToValue).equal('0.7');

      // WETH
      expect(dataState[4].token.address).equal('0x7ceb23fd6bc0add59e62ac25578270cff1b9f619');
      expect(dataState[4].tokenPrice).equal('1912.73');
      expect(dataState[4].totalDeposited).equal('63.64353641527537142');
      expect(dataState[4].totalBorrowed).equal('0.30742216909714705');
      expect(dataState[4].totalBorrowedStable).equal('0');
      expect(dataState[4].rateSupply).equal('0.00000258452571597713');
      expect(dataState[4].rateBorrow).equal('0.0005945077073938726');
      expect(dataState[4].rateBorrowStable).equal('0.03074313463424234076');
      expect(dataState[4].rateLoanToValue).equal('0.8');

      // WMATIC
      expect(dataState[5].token.address).equal('0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270');
      expect(dataState[5].tokenPrice).equal('0.358636875');
      expect(dataState[5].totalDeposited).equal('903247.537711746305793554');
      expect(dataState[5].totalBorrowed).equal('811.578351360703817082');
      expect(dataState[5].totalBorrowedStable).equal('0');
      expect(dataState[5].rateSupply).equal('0.00000010046686361475');
      expect(dataState[5].rateBorrow).equal('0.00013976846382730721');
      expect(dataState[5].rateBorrowStable).equal('0.0501996692340390103');
      expect(dataState[5].rateLoanToValue).equal('0.5');

      // AAVE
      expect(dataState[6].token.address).equal('0xd6df932a45c0f255f85145f286ea0b292b21c90b');
      expect(dataState[6].tokenPrice).equal('381.5393321110013376366');
      expect(dataState[6].totalDeposited).equal('139.9739583265055626');
      expect(dataState[6].totalBorrowed).equal('0');
      expect(dataState[6].totalBorrowedStable).equal('0');
      expect(dataState[6].rateSupply).equal('0');
      expect(dataState[6].rateBorrow).equal('0');
      expect(dataState[6].rateBorrowStable).equal('0.03');
      expect(dataState[6].rateLoanToValue).equal('0.5');
    }
  }
});

test('should get data correctly at birthday - aavev2 chain avalanche', async function () {
  const aavev2Adapter = new Aavev2Adapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    Aavev2Configs,
  );

  const configAvalanche = ProtocolConfigs.aavev2.configs.filter((item) => item.chain === 'avalanche')[0];
  if (configAvalanche) {
    const dataState = await aavev2Adapter.getLendingReservesDataState({
      config: configAvalanche,
      timestamp: configAvalanche.birthday,
    });

    expect(dataState).not.equal(null);

    if (dataState) {
      // should have 7 reserves
      expect(dataState.length).equal(7);

      // should can get price of all reserves
      for (const reserve of dataState) {
        expect(
          reserve.tokenPrice,
          `can not get price of ${reserve.token.chain}:${reserve.token.address} at ${configAvalanche.birthday}`,
        ).not.equal('0');
      }

      // WETH.e
      expect(dataState[0].token.address).equal('0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab');
      expect(dataState[0].tokenPrice).equal('2973.48054557');
      expect(dataState[0].totalDeposited).equal('0');
      expect(dataState[0].totalBorrowed).equal('0');
      expect(dataState[0].totalBorrowedStable).equal('0');
      expect(dataState[0].rateSupply).equal('0');
      expect(dataState[0].rateBorrow).equal('0');
      expect(dataState[0].rateBorrowStable).equal('0');
      expect(dataState[0].rateLoanToValue).equal('0.8');

      // DAI.e
      expect(dataState[1].token.address).equal('0xd586e7f844cea2f87f50152665bcbc2c279d8d70');
      expect(dataState[1].tokenPrice).equal('1.0001085');
      expect(dataState[1].totalDeposited).equal('0');
      expect(dataState[1].totalBorrowed).equal('0');
      expect(dataState[1].totalBorrowedStable).equal('0');
      expect(dataState[1].rateSupply).equal('0');
      expect(dataState[1].rateBorrow).equal('0');
      expect(dataState[1].rateBorrowStable).equal('0');
      expect(dataState[1].rateLoanToValue).equal('0.75');
    }
  }
});

test(`should get data correctly at ${getDateString(timestamp)} - aavev2 chain polygon`, async function () {
  const aavev2Adapter = new Aavev2Adapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    Aavev2Configs,
  );

  const configPolygon = ProtocolConfigs.aavev2.configs.filter((item) => item.chain === 'polygon')[0];
  if (configPolygon) {
    const dataState = await aavev2Adapter.getLendingReservesDataState({
      config: configPolygon,
      timestamp: timestamp,
    });

    expect(dataState).not.equal(null);

    if (dataState) {
      // should can get price of all reserves
      for (const reserve of dataState) {
        expect(
          reserve.tokenPrice,
          `can not get price of ${reserve.token.chain}:${reserve.token.address} at ${timestamp}`,
        ).not.equal('0');
      }
    }
  }
});

test(`should get data correctly at ${getDateString(timestamp)} - aavev2 chain avalanche`, async function () {
  const aavev2Adapter = new Aavev2Adapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    Aavev2Configs,
  );

  const configAvalanche = ProtocolConfigs.aavev2.configs.filter((item) => item.chain === 'avalanche')[0];
  if (configAvalanche) {
    const dataState = await aavev2Adapter.getLendingReservesDataState({
      config: configAvalanche,
      timestamp: timestamp,
    });

    expect(dataState).not.equal(null);

    if (dataState) {
      // should can get price of all reserves
      for (const reserve of dataState) {
        expect(
          reserve.tokenPrice,
          `can not get price of ${reserve.token.chain}:${reserve.token.address} at ${timestamp}`,
        ).not.equal('0');
      }
    }
  }
});
