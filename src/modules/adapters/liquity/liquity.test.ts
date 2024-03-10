import { expect, test } from 'vitest';

import { ProtocolConfigs } from '../../../configs';
import BlockchainService from '../../../services/blockchains/blockchain';
import OracleService from '../../../services/oracle/oracle';
import LiquityAdapter from './liquity';

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
  ProtocolConfigs.liquity,
);
const configEthereum = ProtocolConfigs.liquity.configs.filter((item) => item.chain === 'ethereum')[0];

test('should get state data correctly - liquity chain ethereum', async function () {
  const dataState = await liquityAdapter.getDataState({
    config: configEthereum,
    timestamp: timestamp,
  });

  expect(dataState.cdpLending).not.equal(undefined);

  if (dataState.cdpLending) {
    expect(dataState.cdpLending.length).equal(1);

    const lusdAsset = dataState.cdpLending[0];
    expect(lusdAsset.tokenPrice).equal('0.99439893273');
    expect(lusdAsset.totalBorrowed).equal('174892809.938681132585837145');
    expect(lusdAsset.collaterals.length).equal(1);

    const ethCollateral = dataState.cdpLending[0].collaterals[0];
    expect(ethCollateral.tokenPrice).equal('2358.45');
    expect(ethCollateral.totalDeposited).equal('316094.699304118193290095');
    expect(ethCollateral.rateBorrow).equal('0');
    expect(ethCollateral.feeBorrow).equal('0.008052092360099089');
    expect(ethCollateral.rateLoanToValue).equal('0.9');
  }
});

test('should get timeframe data correctly - liquity chain ethereum', async function () {
  const dataTimeframe = await liquityAdapter.getDataTimeframe({
    config: configEthereum,
    fromTime: startDayTimestamp,
    toTime: endDayTimestamp,
  });

  expect(dataTimeframe.cdpLending).not.equal(undefined);
  if (dataTimeframe.cdpLending) {
    expect(dataTimeframe.cdpLending[0]).not.equal(undefined);

    const lusdAsset = dataTimeframe.cdpLending[0];
    expect(lusdAsset.tokenPrice).equal('0.99686470095');
    expect(lusdAsset.totalBorrowed).equal('153195539.082185262742860794');
    expect(lusdAsset.volumeBorrowed).equal('296948.444550847122605949');
    expect(lusdAsset.volumeRepaid).equal('166675.316445822536652491');

    const ethCollateral = lusdAsset.collaterals[0];
    expect(ethCollateral).not.equal(undefined);
    expect(ethCollateral.tokenPrice).equal('2823.43011038');
    expect(ethCollateral.totalDeposited).equal('263802.267428494003463684');
    expect(ethCollateral.volumeDeposited).equal('1034.250583049392519259');
    expect(ethCollateral.volumeWithdrawn).equal('271.695408744045811863');
    expect(ethCollateral.volumeLiquidated).equal('12.022359242949938296');
  }
});
