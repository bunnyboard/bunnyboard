import { expect, test } from 'vitest';

import BlockchainService from '../../../services/blockchains/blockchain';
import OracleService from '../../../services/oracle/oracle';
import TokenBoardErc20Adapter from './erc20';
import { ProtocolConfigs } from '../../../configs';

const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000
const afterTimestamp = 1704326400; // Thu Jan 04 2024 00:00:00 GMT+0000

test('should get data correctly - DAI on ethereum at 1704240000', async function () {
  const erc20Adapter = new TokenBoardErc20Adapter({
    blockchain: blockchain,
    oracle: oracle,
  });

  const daiErc20data = await erc20Adapter.getDataTimeframe({
    config: ProtocolConfigs.tokenboard.configs[0],
    fromTime: timestamp,
    toTime: afterTimestamp,
  });

  expect(daiErc20data).not.equal(undefined);
  expect(daiErc20data).not.equal(null);

  if (daiErc20data) {
    expect(daiErc20data.tokenPrice).equal('0.99987297');
    expect(daiErc20data.totalSupply).equal('3743256243.762451788710876067');
    expect(daiErc20data.volumeTransfer).equal('6042551819.035898071353784991');
    expect(daiErc20data.volumeMint).equal('1120697073.366964930233022859');
    expect(daiErc20data.volumeBurn).equal('1108138340.995936841009856534');
  }
});

test('should get data correctly - MKR on ethereum at 1704240000', async function () {
  const erc20Adapter = new TokenBoardErc20Adapter({
    blockchain: blockchain,
    oracle: oracle,
  });

  const mkrTokenData = await erc20Adapter.getDataTimeframe({
    config: ProtocolConfigs.tokenboard.configs[1],
    fromTime: timestamp,
    toTime: afterTimestamp,
  });

  expect(mkrTokenData).not.equal(undefined);
  expect(mkrTokenData).not.equal(null);
  if (mkrTokenData) {
    expect(mkrTokenData.tokenPrice).equal('1833.04047550049586185826');
    expect(mkrTokenData.totalSupply).equal('977631.036950888222010062');
  }
});
