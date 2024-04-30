import { test } from 'vitest';

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
  const toTime = 1704070800;
  const dataTimeframe = await adapter.getDataTimeframe({
    config: ChainBoardConfigs[0],
    fromTime,
    toTime,
  });

  console.log(dataTimeframe);
});
