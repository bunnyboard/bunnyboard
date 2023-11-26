import { expect } from 'chai';
import { describe } from 'mocha';

import { OracleConfigs } from '../configs/oracles/configs';
import { getTimestamp } from '../lib/utils';
import DatabaseService from '../services/database/database';
import { IDatabaseService } from '../services/database/domains';
import { IOracleService } from '../services/oracle/domains';
import OracleService from '../services/oracle/oracle';
import { OracleConfig } from '../types/configs';

interface TokenOracleConfig extends OracleConfig {
  chain: string;
  token: string;
}

function getAllOracles(): Array<TokenOracleConfig> {
  const allOracles: Array<TokenOracleConfig> = [];

  for (const [chain, tokens] of Object.entries(OracleConfigs)) {
    for (const [token, config] of Object.entries(tokens)) {
      allOracles.push({
        chain: chain,
        token: token,
        ...config,
      });
    }
  }

  return allOracles;
}

const database: IDatabaseService = new DatabaseService();
const oracle: IOracleService = new OracleService(database);
const timestamp = getTimestamp();

describe('oracle service', async function () {
  getAllOracles().map((config: TokenOracleConfig) =>
    it(`can get token ${config.token} price`, async function () {
      const priceUsd = await oracle.getTokenPriceUsd({
        chain: config.chain,
        address: config.token,
        timestamp: timestamp,
      });

      expect(priceUsd).not.equal(null);
      expect(priceUsd).not.equal('0');
    }),
  );
});
