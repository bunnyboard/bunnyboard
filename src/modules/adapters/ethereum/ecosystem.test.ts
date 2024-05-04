import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { EthereumEcosystemConfigs } from '../../../configs/boards/ethereum';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import EthereumEcosystemAdapter from './ecosystem';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const adapter = new EthereumEcosystemAdapter(
  {
    blockchain: blockchain,
    oracle: oracle,
  },
  {
    database: database,
    memcache: memcache,
  },
);

test('should get ethereum ecosystem layer 2 data correctly', async function () {
  const fromTime = 1704067200;
  const toTime = 1704078000;
  const optimismData = await adapter.getEthereumLayer2Stats(
    {
      fromTime,
      toTime,
    },
    EthereumEcosystemConfigs.layer2[0],
  );

  expect(optimismData).not.equal(null);
  if (optimismData) {
    expect(optimismData.bridgeTotalDeposited).equal('333849.06122972545938078');
    expect(optimismData.bridgeVolumeDeposit).equal('116.159526698287744425');
    expect(optimismData.bridgeVolumeWithdraw).equal('23.304849530230223059');
  }
});
