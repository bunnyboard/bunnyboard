import { expect } from 'chai';
import fs from 'fs';
import { describe } from 'mocha';

import { OracleConfigs } from '../configs/oracles/configs';
import { getTimestamp } from '../lib/utils';
import BlockchainService from '../services/blockchains/blockchain';
import OracleService from '../services/oracle/oracle';

interface SimpleToken {
  chain: string;
  address: string;
}

function getOracleConfigs(): Array<SimpleToken> {
  const tokens: Array<SimpleToken> = [];

  for (const [chain, configs] of Object.entries(OracleConfigs)) {
    for (const address of Object.keys(configs)) {
      tokens.push({
        chain,
        address,
      });
    }
  }

  return tokens;
}

const oracle = new OracleService();
const blockchain = new BlockchainService();
const timestamp = getTimestamp();

const TokenPriceReportFile = './TokenPriceReport.csv';
fs.writeFileSync(TokenPriceReportFile, 'chain,address,symbol,time,price\n');

describe('get token prices', async function () {
  getOracleConfigs().map((token: SimpleToken) =>
    it(`should be able to get token price ${token.chain} ${token.address}`, async function () {
      const tokenInfo = await blockchain.getTokenInfo({
        chain: token.chain,
        address: token.address,
      });
      const priceUsd = await oracle.getTokenPriceUsd({
        chain: token.chain,
        address: token.address,
        timestamp: timestamp,
      });
      expect(priceUsd).not.equal(null);
      expect(priceUsd).not.equal('0');

      if (tokenInfo) {
        fs.appendFileSync(
          TokenPriceReportFile,
          `${tokenInfo.chain},${tokenInfo.address},${tokenInfo.symbol},${new Date(
            timestamp * 1000,
          ).toISOString()},${priceUsd}\n`,
        );
      }
    }),
  );
});
