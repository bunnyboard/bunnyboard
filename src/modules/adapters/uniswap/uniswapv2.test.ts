import { expect, test } from 'vitest';

import { Uniswapv2EthereumDexConfig } from '../../../configs/protocols/uniswap';
import BlockchainService from '../../../services/blockchains/blockchain';
import OracleService from '../../../services/oracle/oracle';
import Uniswapv2Adapter from './uniswapv2';

const oracle = new OracleService();
const blockchain = new BlockchainService();

const fromTime = 1640995200; // Sat Jan 01 2022 00:00:00 GMT+0000
const toTime = 1641081600; // Sun Jan 02 2022 00:00:00 GMT+0000

test('should get dex correctly - uniswapv2 - ethereum', async function () {
  const adapter = new Uniswapv2Adapter({
    oracle,
    blockchain,
  });

  const dexDataState = await adapter.getDataState({
    config: Uniswapv2EthereumDexConfig,
    timestamp: fromTime,
  });

  const dexDataTimeframe = await adapter.getDataTimeframe({
    config: Uniswapv2EthereumDexConfig,
    fromTime: fromTime,
    toTime: toTime,
  });

  expect(dexDataState).not.equal(null);
  expect(dexDataTimeframe).not.equal(null);

  if (dexDataState && dexDataTimeframe) {
    expect(dexDataState.totalLiquidity).equal('4608788258.400094230081435324129104');

    expect(dexDataTimeframe.protocol).equal('uniswapv2');
    expect(dexDataTimeframe.totalLiquidity).equal('4692280090.774402495362390068393937');
    expect(dexDataTimeframe.feesTrading).equal('1132712.22559683331681223456');
    expect(dexDataTimeframe.volumeTrading).equal('377570741.86561110560407818738');
    expect(dexDataTimeframe.volumeTradingCumulative).equal('408440234025.31514429904276570087');
    expect(dexDataTimeframe.numberOfTransactions).equal(68006);
    expect(dexDataTimeframe.numberOfTransactionsCumulative).equal(71069420);
  }
});
