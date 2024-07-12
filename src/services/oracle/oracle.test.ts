import { test } from 'vitest';

import { getTimestamp } from '../../lib/utils';
import OracleService from './oracle';

const oracle = new OracleService(null);

// const customCases = [
//   {
//     chain: 'ethereum',
//     address: TokenListBase.ethereum.USDT.address,
//     timestamp: 1704240000, // Wed Jan 03 2024 00:00:00 GMT+0000
//     expectedPriceUsd: '1.00063367',
//   },
//   {
//     chain: 'ethereum',
//     address: TokenListBase.ethereum.USDT.address,
//     timestamp: 1606780800, // Tue Dec 01 2020 00:00:00 GMT+0000
//     expectedPriceUsd: '1',
//   },
//   {
//     chain: 'ethereum',
//     address: '0x1985365e9f78359a9b6ad760e32412f4a445e862',
//     timestamp: 1704240000, // Tue Dec 01 2020 00:00:00 GMT+0000
//     expectedPriceUsd: '0.95884040831543141418',
//   },
// ];
//
// describe('should get token price correctly', async function () {
//   customCases.map((testcase) =>
//     test(`should get token price correctly - ${testcase.chain} - ${testcase.address} - ${testcase.timestamp}`, async function () {
//       const tokenPriceUsd = await oracle.getTokenPriceUsd({
//         chain: testcase.chain,
//         address: testcase.address,
//         timestamp: testcase.timestamp,
//       });
//
//       expect(tokenPriceUsd).equal(testcase.expectedPriceUsd);
//     }),
//   );
// });
//
// const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000
//
// const tokens: Array<any> = [];
// for (const [chain, configs] of Object.entries(OracleConfigs)) {
//   for (const address of Object.keys(configs)) {
//     tokens.push({
//       chain: chain,
//       address: address,
//     });
//   }
// }
//
// test('should be able to get token prices', async function () {
//   const reportFile = './TestReportOracle.csv';
//
//   fs.writeFileSync(reportFile, 'chain,symbol,price,address,timestamp\n');
//
//   for (const token of tokens) {
//     const tokenPriceUsd = await oracle.getTokenPriceUsd({
//       chain: token.chain,
//       address: token.address,
//       timestamp: timestamp,
//     });
//
//     const tokenSymbol = TokenList[token.chain][token.address] ? TokenList[token.chain][token.address].symbol : '';
//     fs.appendFileSync(reportFile, `${token.chain},${tokenSymbol},${tokenPriceUsd},${token.address},${timestamp}\n`);
//
//     expect(tokenPriceUsd, `chain:${token.chain} address:${token.address} at ${timestamp}`).not.equal(null);
//     expect(tokenPriceUsd, `chain:${token.chain} address:${token.address} at ${timestamp}`).not.equal('0');
//   }
// });

const chain = 'ethereum';

const tokens = [
  // '0xa35b1b31ce002fbf2058d22f30f95d405200a15b',
  // '0x24ae2da0f361aa4be46b48eb19c91e02c5e4f27e',
  // '0x04c154b66cb340f3ae24111cc767e0184ed00cc6',
  // '0x9ba021b0a9b958b5e75ce9f6dff97c7ee52cb3e6',
  // '0xa663b02cf0a4b149d2ad41910cb81e23e1c41c32',
  '0xb45ad160634c528cc3d2926d9807104fa3157305',
];

const timestamp = getTimestamp();

test('should be able to get token prices', async function () {
  for (const token of tokens) {
    const tokenPriceUsd = await oracle.getTokenPriceUsd({
      chain: chain,
      address: token,
      timestamp: timestamp,
    });

    console.log(token, tokenPriceUsd);
  }
});
