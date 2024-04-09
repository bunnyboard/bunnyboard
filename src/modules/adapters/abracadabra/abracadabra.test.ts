import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { TimeUnits } from '../../../configs/constants';
import { AbracadabraConfigs } from '../../../configs/protocols/abracadabra';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import AbracadabraAdapter from './abracadabra';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestampArbitrum = 1631664000; // Wed Sep 15 2021 00:00:00 GMT+0000

test('should get data correctly at birthday - MIM on ethereum', async (t) => {
  const adapter = new AbracadabraAdapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    AbracadabraConfigs,
  );

  const assetData = await adapter.getLendingAssetDataTimeframe({
    config: AbracadabraConfigs.configs[0],
    fromTime: AbracadabraConfigs.configs[0].birthday,
    toTime: AbracadabraConfigs.configs[0].birthday + TimeUnits.SecondsPerDay,
  });

  expect(assetData).not.equal(null);
  if (assetData) {
    expect(assetData.tokenPrice).equal('0.97173923798018293678');
    expect(assetData.totalBorrowed).equal('58411207.828133068440963052');
    expect(assetData.volumeBorrowed).equal('1693338.893417453499688009');
    expect(assetData.volumeRepaid).equal('6851278.029101084960991664');

    expect(assetData.collaterals[0].tokenPrice).equal('0.98119600507711618255');
    expect(assetData.collaterals[0].totalBorrowed).equal('27764330.234232099772456621');
    expect(assetData.collaterals[0].totalDeposited).equal('35324958.308971');
    expect(assetData.collaterals[0].rateBorrow).equal('0.007994688458688');
    expect(assetData.collaterals[0].rateBorrowFee).equal('0.0005');
    expect(assetData.collaterals[0].rateLoanToValue).equal('0.9');
    expect(assetData.collaterals[0].volumeDeposited).equal('1790012.024058');
    expect(assetData.collaterals[0].volumeWithdrawn).equal('7146217.888387');

    expect(assetData.collaterals[1].tokenPrice).equal('1.03081854102176325417');
    expect(assetData.collaterals[1].totalBorrowed).equal('18608621.319807056605635561');
    expect(assetData.collaterals[1].totalDeposited).equal('20940040.47424');
    expect(assetData.collaterals[1].rateBorrow).equal('0.007994688458688');
    expect(assetData.collaterals[1].rateBorrowFee).equal('0.0005');
    expect(assetData.collaterals[1].rateLoanToValue).equal('0.9');

    expect(assetData.collaterals[2].tokenPrice).equal('38876.02845763554974629926');
    expect(assetData.collaterals[2].totalBorrowed).equal('2974175.332546460130315399');
    expect(assetData.collaterals[2].totalDeposited).equal('182.135222973033116253');
    expect(assetData.collaterals[2].rateBorrow).equal('0.014990040875808');
    expect(assetData.collaterals[2].rateBorrowFee).equal('0.0005');
    expect(assetData.collaterals[2].rateLoanToValue).equal('0.75');
  }
});

test(`should get data correctly at ${getDateString(timestampArbitrum)} - MIM on arbitrum`, async (t) => {
  const adapter = new AbracadabraAdapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    AbracadabraConfigs,
  );

  const assetData = await adapter.getLendingAssetDataState({
    config: AbracadabraConfigs.configs[1],
    timestamp: AbracadabraConfigs.configs[1].birthday,
  });

  expect(assetData).not.equal(null);
  if (assetData) {
    expect(assetData.tokenPrice).equal('1.00670927364769588485');
    expect(assetData.totalBorrowed).equal('0');
    expect(assetData.totalSupply).equal('411163.285816841388650012');

    expect(assetData.collaterals[0].tokenPrice).equal('3436.01739030856893606341');
    expect(assetData.collaterals[0].totalBorrowed).equal('0');
    expect(assetData.collaterals[0].totalDeposited).equal('0');
    expect(assetData.collaterals[0].rateBorrow).equal('0.004996577684304');
    expect(assetData.collaterals[0].rateBorrowFee).equal('0.005');
    expect(assetData.collaterals[0].rateLoanToValue).equal('0.85');
  }
});
