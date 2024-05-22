import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { MakerConfigs } from '../../../configs/protocols/maker';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import MakerAdapter from './maker';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1710892800; // Wed Mar 20 2024 00:00:00 GMT+0000

const makerAdapter = new MakerAdapter(
  {
    blockchain: blockchain,
    oracle: oracle,
  },
  {
    database: database,
    memcache: memcache,
  },
  MakerConfigs,
);

test(`should get state data correctly at ${getDateString(timestamp)} - maker chain ethereum`, async function () {
  const data = await makerAdapter.getLendingAssetData({
    config: MakerConfigs.configs[0],
    fromTime: timestamp,
    toTime: timestamp + 60 * 60,
  });

  expect(data).not.equal(null);

  console.log(data);

  // if (data) {
  //   expect(data.tokenPrice).equal('0.99981422');
  //   expect(data.totalBorrowed).equal('4713932090.15900915820984210398');
  //   expect(data.totalSupply).equal('3233851351.083077469361461939');
  //   expect(data.collaterals.length).equal(27);
  //   expect(data.extended).not.equal(undefined);
  //   expect((data.extended as MakerDataExtended).daiSavingRate).equal('1.00000000443182212978');
  //
  //   const wstETH = data.collaterals[4];
  //   expect(wstETH).not.equal(undefined);
  //   expect(wstETH.tokenPrice).equal('3662.65286811512607');
  //   expect(wstETH.totalDeposited).equal('268853.66358015695696984');
  //   expect(wstETH.totalBorrowed).equal('84683484.81991922449304900545');
  //   expect(wstETH.rateBorrow).equal('0.15489844768357454407');
  //   expect(wstETH.rateBorrowFee).equal('0');
  //   expect(wstETH.rateLoanToValue).equal('0.57142857142857142857');
  // }
});
