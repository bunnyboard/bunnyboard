import { expect, test } from 'vitest';

import { DefaultMemcacheTime, ProtocolConfigs } from '../../../configs';
import { OracleConfigs } from '../../../configs/oracles/configs';
import { CompoundConfigs, CompoundLendingMarketConfig } from '../../../configs/protocols/compound';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import CompoundLibs from '../../libs/compound';
import CompoundAdapter from './compound';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000

test('should have oracle configs for reserves correctly - compound', async function () {
  for (const marketConfig of CompoundConfigs.configs) {
    const cTokens = await CompoundLibs.getComptrollerInfo(marketConfig as CompoundLendingMarketConfig);

    for (const cToken of cTokens) {
      expect(OracleConfigs[cToken.underlying.chain][cToken.underlying.address]).not.equal(null);
      expect(OracleConfigs[cToken.underlying.chain][cToken.underlying.address]).not.equal(undefined);
    }
  }
});

test('should get data correctly - compound chain ethereum', async function () {
  const compoundAdapter = new CompoundAdapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    CompoundConfigs,
  );

  const configEthereum = ProtocolConfigs.compound.configs.filter((item) => item.chain === 'ethereum')[0];
  if (configEthereum) {
    const dataState = await compoundAdapter.getLendingReservesDataState({
      config: configEthereum,
      timestamp: timestamp,
    });

    expect(dataState).not.equal(null);

    if (dataState) {
      expect(dataState.length).equal(20);
    }
  }
});
