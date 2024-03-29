import { expect, test } from 'vitest';

import { DefaultMemcacheTime, ProtocolConfigs } from '../../../configs';
import { LiquityConfigs } from '../../../configs/protocols/liquity';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import LiquityAdapter from './liquity';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000

const startDayTimestamp = 1708041600; // Fri Feb 16 2024 00:00:00 GMT+0000
const endDayTimestamp = 1708128000; // Sat Feb 17 2024 00:00:00 GMT+0000

const liquityAdapter = new LiquityAdapter(
  {
    blockchain: blockchain,
    oracle: oracle,
  },
  {
    database: database,
    memcache: memcache,
  },
  LiquityConfigs,
);
const configEthereum = ProtocolConfigs.liquity.configs.filter((item) => item.chain === 'ethereum')[0];

test('should get state data correctly - liquity chain ethereum', async function () {
  const dataState = await liquityAdapter.getLendingAssetDataState({
    config: configEthereum,
    timestamp: timestamp,
  });

  expect(dataState).not.equal(null);

  if (dataState) {
    expect(dataState.tokenPrice).equal('0.98319929447070801584');
    expect(dataState.totalBorrowed).equal('174892809.938681132585837145');
    expect(dataState.collaterals.length).equal(1);

    const ethCollateral = dataState.collaterals[0];
    expect(ethCollateral.tokenPrice).equal('2358.45');
    expect(ethCollateral.totalDeposited).equal('316094.699304118193290095');
    expect(ethCollateral.rateBorrow).equal('0');
    expect(ethCollateral.feeBorrow).equal('0.008052092360099089');
    expect(ethCollateral.rateLoanToValue).equal('0.9');
  }
});

test('should get state data correctly at birthday - liquity chain ethereum', async function () {
  const dataState = await liquityAdapter.getLendingAssetDataState({
    config: configEthereum,
    timestamp: configEthereum.birthday,
  });

  expect(dataState).not.equal(null);

  if (dataState) {
    expect(dataState.tokenPrice).equal('1.0711946834743807403');
    expect(dataState.totalBorrowed).equal('114200523.539');
    expect(dataState.collaterals.length).equal(1);

    const ethCollateral = dataState.collaterals[0];
    expect(ethCollateral.tokenPrice).equal('2101.36069975');
    expect(ethCollateral.totalDeposited).equal('96112.941441063868722705');
    expect(ethCollateral.rateBorrow).equal('0');
    expect(ethCollateral.feeBorrow).equal('0.005');
    expect(ethCollateral.rateLoanToValue).equal('0.9');
  }
});

test('should get timeframe data correctly - liquity chain ethereum', async function () {
  const dataTimeframe = await liquityAdapter.getLendingAssetDataTimeframe({
    config: configEthereum,
    fromTime: startDayTimestamp,
    toTime: endDayTimestamp,
  });

  expect(dataTimeframe).not.equal(null);
  if (dataTimeframe) {
    expect(dataTimeframe.tokenPrice).equal('0.99171302850382854518');
    expect(dataTimeframe.totalBorrowed).equal('153195539.082185262742860794');
    expect(dataTimeframe.volumeBorrowed).equal('296948.444550847122605949');
    expect(dataTimeframe.volumeRepaid).equal('166675.316445822536652491');

    const ethCollateral = dataTimeframe.collaterals[0];
    expect(ethCollateral).not.equal(undefined);
    expect(ethCollateral.tokenPrice).equal('2823.43011038');
    expect(ethCollateral.totalDeposited).equal('263802.267428494003463684');
    expect(ethCollateral.volumeDeposited).equal('1034.250583049392519259');
    expect(ethCollateral.volumeWithdrawn).equal('271.695408744045811863');
    expect(ethCollateral.volumeLiquidated).equal('12.022359242949938296');
  }
});
