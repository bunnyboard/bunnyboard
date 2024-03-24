import { expect, test } from 'vitest';

import { ProtocolConfigs } from '../../../configs';
import BlockchainService from '../../../services/blockchains/blockchain';
import OracleService from '../../../services/oracle/oracle';
import TokenBoardErc20Adapter from './erc20';

const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000
const afterTimestamp = 1704326400; // Thu Jan 04 2024 00:00:00 GMT+0000

const daiConfig = ProtocolConfigs.tokenBoard.configs[0];

test('should get data correctly - DAI on ethereum at 1704240000', async function () {
  const erc20Adapter = new TokenBoardErc20Adapter({
    blockchain: blockchain,
    oracle: oracle,
  });

  const daiErc20data = await erc20Adapter.getDataTimeframe({
    config: daiConfig,
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

    const dataOnUniswapv2 = daiErc20data.dataOnDex[0];
    expect(dataOnUniswapv2.protocol).equal('uniswapv2');
    expect(dataOnUniswapv2.version).equal('univ2');
    expect(dataOnUniswapv2.totalLiquidity).equal('57115738.199073655877809773');
    expect(dataOnUniswapv2.volumeTrading).equal('17850018.328892968774457868');
  }
});
