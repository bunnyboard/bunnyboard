import { expect, test } from 'vitest';

import { ChainBoardConfigs, DefaultMemcacheTime } from '../../../configs';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import EvmChainAdapter from './evm';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const adapter = new EvmChainAdapter(
  {
    blockchain: blockchain,
    oracle: oracle,
  },
  {
    database: database,
    memcache: memcache,
  },
);

test('should get evm block stats correctly', async function () {
  const fromTime = 1704067200;
  const toTime = 1704067800;
  const dataTimeframe = await adapter.getDataTimeframe({
    config: ChainBoardConfigs[0],
    fromTime,
    toTime,
  });

  expect(dataTimeframe).not.equal(null);
  if (dataTimeframe) {
    expect(dataTimeframe.fromBlock).equal(18908894);
    expect(dataTimeframe.toBlock).equal(18908942);
    expect(dataTimeframe.totalGasUsed).equal('730915898');
    expect(dataTimeframe.totalCoinBurnt).equal('9.05291964860071523');
    expect(dataTimeframe.volumeCoinTransfer).equal('3808.916869365437301255');
    expect(dataTimeframe.numberOfTransactions).equal(7642);
    expect(dataTimeframe.numberOfAddresses).equal(4476);
    expect(dataTimeframe.numberOfDeployedContracts).equal(15);
  }
});
