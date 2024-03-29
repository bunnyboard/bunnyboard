import { expect, test } from 'vitest';

import { DefaultMemcacheTime, ProtocolConfigs } from '../../../configs';
import { OracleConfigs } from '../../../configs/oracles/configs';
import { CompoundLendingMarketConfig } from '../../../configs/protocols/compound';
import { VenusConfigs } from '../../../configs/protocols/venus';
import { compareAddress } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import CompoundLibs from '../../libs/compound';
import VenusAdapter from './venus';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000

const TokenCAN = '0x20bff4bbeda07536ff00e073bd8359e5d80d733d';

test('should have oracle configs for reserves correctly - venus chain bnbchain', async function () {
  for (const marketConfig of VenusConfigs.configs) {
    const cTokens = await CompoundLibs.getComptrollerInfo(marketConfig as CompoundLendingMarketConfig);

    for (const cToken of cTokens) {
      if (!compareAddress(TokenCAN, cToken.underlying.address)) {
        expect(
          OracleConfigs[cToken.underlying.chain][cToken.underlying.address],
          `${cToken.underlying.chain}:${cToken.underlying.address}`,
        ).not.equal(null);
        expect(
          OracleConfigs[cToken.underlying.chain][cToken.underlying.address],
          `${cToken.underlying.chain}:${cToken.underlying.address}`,
        ).not.equal(undefined);
      }
    }
  }
});

test('should get data correctly - venus chain bnbchain', async function () {
  const adapter = new VenusAdapter(
    {
      blockchain: blockchain,
      oracle: oracle,
    },
    {
      database: database,
      memcache: memcache,
    },
    VenusConfigs,
  );

  const configBnbchain = ProtocolConfigs.venus.configs.filter((item) => item.chain === 'bnbchain')[0];
  if (configBnbchain) {
    const dataState = await adapter.getLendingReservesDataState({
      config: configBnbchain,
      timestamp: timestamp,
    });

    expect(dataState).not.equal(null);

    if (dataState) {
      expect(dataState.length).equal(30);
    }
  }
});
