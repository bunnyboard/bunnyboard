import { expect, test } from 'vitest';

import { ProtocolConfigs } from '../../../configs';
import { TimeUnits } from '../../../configs/constants';
import BlockchainService from '../../../services/blockchains/blockchain';
import OracleService from '../../../services/oracle/oracle';
import LiquityAdapter from './liquity';

const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000

const startDayTimestamp = 1704412800; // Fri Jan 05 2024 00:00:00 GMT+0000
const endDayTimestamp = startDayTimestamp + TimeUnits.SecondsPerDay - 1;

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
    expect(dataTimeframe.cdpLending.length).equal(1);

    const lusdAsset = dataTimeframe.cdpLending[0];
    expect(lusdAsset.tokenPrice).equal('0.995534663349');
    expect(lusdAsset.totalBorrowed).equal('171879481.574101426834080889');
    expect(lusdAsset.collaterals.length).equal(1);
    expect(lusdAsset.addresses.length).equal(24);
    expect(lusdAsset.transactions.length).equal(39);

    const ethCollateral = dataTimeframe.cdpLending[0].collaterals[0];
    expect(ethCollateral.tokenPrice).equal('2272.4358');
    expect(ethCollateral.totalDeposited).equal('314534.448799775444888795');
    expect(ethCollateral.rateBorrow).equal('0');
    expect(ethCollateral.feeBorrow).equal('0.007981282307015172');
    expect(ethCollateral.rateLoanToValue).equal('0.9');
    expect(ethCollateral.volumeDeposited).equal('30381.14355736033796454');
    expect(ethCollateral.volumeWithdrawn).equal('1028.081505919843299124');
    expect(ethCollateral.volumeLiquidated).equal('0');
  }
});
