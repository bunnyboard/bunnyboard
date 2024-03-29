import { expect, test } from 'vitest';

import { DefaultMemcacheTime, ProtocolConfigs } from '../../../configs';
import { OracleConfigs } from '../../../configs/oracles/configs';
import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import { RadiantConfigs } from '../../../configs/protocols/radiant';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import AaveLibs from '../../libs/aave';
import RadiantAdapter from './radiant';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000

test('should have oracle configs for reserves correctly', async function () {
  for (const marketConfig of RadiantConfigs.configs) {
    const marketInfo = await AaveLibs.getMarketInfo(marketConfig as AaveLendingMarketConfig);
    expect(marketInfo).not.equal(null);
    if (marketInfo) {
      for (const token of marketInfo.reserves) {
        expect(OracleConfigs[token.chain][token.address]).not.equal(null);
        expect(OracleConfigs[token.chain][token.address]).not.equal(undefined);
      }
    }
  }
});

test('should get data correctly - radiant chain ethereum', async function () {
  const radiantAdapter = new RadiantAdapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    RadiantConfigs,
  );

  const configEthereum = ProtocolConfigs.radiant.configs.filter((item) => item.chain === 'ethereum')[0];
  if (configEthereum) {
    const dataState = await radiantAdapter.getLendingReservesDataState({
      config: configEthereum,
      timestamp: timestamp,
    });

    expect(dataState).not.equal(undefined);

    if (dataState) {
      expect(dataState.length).equal(7);
    }
  }
});
