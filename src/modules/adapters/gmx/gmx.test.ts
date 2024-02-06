import BigNumber from 'bignumber.js';
import { expect, test } from 'vitest';

import { ProtocolConfigs } from '../../../configs';
import { DAY } from '../../../configs/constants';
import BlockchainService from '../../../services/blockchains/blockchain';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import GmxAdapter from './gmx';

const oracle = new OracleService();
const blockchain = new BlockchainService();
const database = new DatabaseService();

const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000

const ArbAddressWbtc = '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f';
const ArbAddressWeth = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';

test('should get data state correctly - adapter:gmx', async function () {
  const gmxAdapter = new GmxAdapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    ProtocolConfigs.gmx,
  );

  //
  //// Arbitrum Vault
  //

  const arbDataState = await gmxAdapter.getDataState({
    config: ProtocolConfigs.gmx.configs[0],
    timestamp: timestamp,
  });
  const arbDataSnapshots = await gmxAdapter.getDataTimeframe(
    {
      config: ProtocolConfigs.gmx.configs[0],
      fromTime: timestamp,
      toTime: timestamp + DAY - 1,
    },
    {
      database: database,
    },
  );

  // there are 10 whitelisted tokens
  expect(arbDataState.perpetual).not.equal(undefined);
  expect(arbDataSnapshots.perpetual).not.equal(undefined);
  expect(arbDataState.perpetual && arbDataState.perpetual.length === 10).equal(true);
  expect(arbDataSnapshots.perpetual && arbDataSnapshots.perpetual.length === 10).equal(true);

  let totalVolumeTrading = 0;
  let totalVolumeLiquidation = 0;
  for (const market of arbDataSnapshots.perpetual ? arbDataSnapshots.perpetual : []) {
    totalVolumeTrading += new BigNumber(market.volumeLongUsd).plus(new BigNumber(market.volumeShortUsd)).toNumber();
    totalVolumeLiquidation += new BigNumber(market.volumeLiquidatedUsd).toNumber();
  }

  expect(totalVolumeTrading).equal(91457499.59782092);
  expect(totalVolumeLiquidation).equal(9308527.715284247);

  // WBTC market
  const wbtcMarket = arbDataState.perpetual
    ? arbDataState.perpetual.filter((item) => item.token.address === ArbAddressWbtc)[0]
    : undefined;

  expect(wbtcMarket).not.equal(true);
  if (wbtcMarket) {
    expect(wbtcMarket.totalDeposited).equal('1944.86350936');
    expect(wbtcMarket.totalOpenInterestShortUsd).equal('3640806.80117581288937953368');
    expect(wbtcMarket.totalOpenInterestLongUsd).equal('37398272.94409096503187631141');
    expect(wbtcMarket.rateBorrow).equal('0.42705332174000947034');
  }

  // WETH market
  const wethMarket = arbDataState.perpetual
    ? arbDataState.perpetual.filter((item) => item.token.address === ArbAddressWeth)[0]
    : undefined;

  expect(wethMarket).not.equal(true);
  if (wethMarket) {
    expect(wethMarket.totalDeposited).equal('31865.280280292376151297');
    expect(wethMarket.totalOpenInterestShortUsd).equal('4102858.51087095307334490969');
    expect(wethMarket.totalOpenInterestLongUsd).equal('22367855.29182393897482273698');
    expect(wethMarket.rateBorrow).equal('0.29343707990830092885');
  }
});
