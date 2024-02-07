import { test } from 'vitest';

import { ProtocolConfigs } from '../../../configs';
import BlockchainService from '../../../services/blockchains/blockchain';
import OracleService from '../../../services/oracle/oracle';
import Aavev2Adapter from './aavev2';

const oracle = new OracleService();
const blockchain = new BlockchainService();
// const database = new DatabaseService();

const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000

test('should get data correctly - aavev2 chain ethereum', async function () {
  const aavev2Adapter = new Aavev2Adapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    ProtocolConfigs.aavev2,
  );

  const configEthereum = ProtocolConfigs.aavev2.configs.filter((item) => item.chain === 'ethereum')[0];
  if (configEthereum) {
    const dataState = await aavev2Adapter.getDataState({
      config: configEthereum,
      timestamp: timestamp,
    });

    console.log(dataState);
  }
});
