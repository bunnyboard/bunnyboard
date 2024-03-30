import fs from 'fs';
import { describe, expect, test } from 'vitest';

import { TokenList, TokenListBase } from '../../configs';
import { OracleConfigs } from '../../configs/oracles/configs';
import OracleService from './oracle';

const oracle = new OracleService();

const customCases = [
  {
    chain: 'ethereum',
    address: TokenListBase.ethereum.USDT.address,
    timestamp: 1704240000, // Wed Jan 03 2024 00:00:00 GMT+0000
    expectedPriceUsd: '1.00063367',
  },
  {
    chain: 'ethereum',
    address: TokenListBase.ethereum.USDT.address,
    timestamp: 1606780800, // Tue Dec 01 2020 00:00:00 GMT+0000
    expectedPriceUsd: '1',
  },
  {
    chain: 'ethereum',
    address: '0x1985365e9f78359a9b6ad760e32412f4a445e862',
    timestamp: 1704240000, // Tue Dec 01 2020 00:00:00 GMT+0000
    expectedPriceUsd: '0.95884040831543141418',
  },
];

describe('should get token price correctly', async function () {
  customCases.map((testcase) =>
    test(`should get token price correctly - ${testcase.chain} - ${testcase.address} - ${testcase.timestamp}`, async function () {
      const tokenPriceUsd = await oracle.getTokenPriceUsd({
        chain: testcase.chain,
        address: testcase.address,
        timestamp: testcase.timestamp,
      });

      expect(tokenPriceUsd).equal(testcase.expectedPriceUsd);
    }),
  );
});

const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000

const tokens: Array<any> = [];
for (const [chain, configs] of Object.entries(OracleConfigs)) {
  for (const address of Object.keys(configs)) {
    tokens.push({
      chain: chain,
      address: address,
    });
  }
}

test('should be able to get token prices', async function () {
  const reportFile = './TestReportOracle.csv';

  fs.writeFileSync(reportFile, 'chain,symbol,price,address,timestamp\n');

  for (const token of tokens) {
    const tokenPriceUsd = await oracle.getTokenPriceUsd({
      chain: token.chain,
      address: token.address,
      timestamp: timestamp,
    });

    const tokenSymbol = TokenList[token.chain][token.address] ? TokenList[token.chain][token.address].symbol : '';
    fs.appendFileSync(reportFile, `${token.chain},${tokenSymbol},${tokenPriceUsd},${token.address},${timestamp}\n`);

    expect(tokenPriceUsd, `chain:${token.chain} address:${token.address} at ${timestamp}`).not.equal(null);
    expect(tokenPriceUsd, `chain:${token.chain} address:${token.address} at ${timestamp}`).not.equal('0');
  }
});
