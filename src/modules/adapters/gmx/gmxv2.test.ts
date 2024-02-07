import { test } from 'vitest';

import { ProtocolConfigs } from '../../../configs';
import { getTimestamp } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import OracleService from '../../../services/oracle/oracle';
import Gmxv2Adapter from './gmxv2';

const oracle = new OracleService();
const blockchain = new BlockchainService();
// const database = new DatabaseService();

const timestamp = getTimestamp(); // Wed Jan 03 2024 00:00:00 GMT+0000

test('should get data state correctly - arbitrum', async function () {
  const gmxv2Adapter = new Gmxv2Adapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    ProtocolConfigs.gmx,
  );

  const dataState = await gmxv2Adapter.getDataState({
    config: ProtocolConfigs.gmxv2.configs[0],
    timestamp,
  });

  console.log(dataState);
});
