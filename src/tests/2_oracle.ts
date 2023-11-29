// import { expect } from 'chai';
// import fs from 'fs';
// import { describe } from 'mocha';
//
// import { OracleConfigs } from '../configs/oracles/configs';
// import { getTimestamp } from '../lib/utils';
// import BlockchainService from '../services/blockchains/blockchain';
// import { IBlockchainService } from '../services/blockchains/domains';
// import DatabaseService from '../services/database/database';
// import { IDatabaseService } from '../services/database/domains';
// import { IOracleService } from '../services/oracle/domains';
// import OracleService from '../services/oracle/oracle';
// import { OracleConfig } from '../types/configs';
//
// interface TokenOracleConfig extends OracleConfig {
//   chain: string;
//   token: string;
// }
//
// function getAllOracles(): Array<TokenOracleConfig> {
//   const allOracles: Array<TokenOracleConfig> = [];
//
//   for (const [chain, tokens] of Object.entries(OracleConfigs)) {
//     for (const [token, config] of Object.entries(tokens)) {
//       allOracles.push({
//         chain: chain,
//         token: token,
//         ...config,
//       });
//     }
//   }
//
//   return allOracles;
// }
//
// const database: IDatabaseService = new DatabaseService();
// const blockchain: IBlockchainService = new BlockchainService();
// const oracle: IOracleService = new OracleService(database);
// const timestamp = getTimestamp();
//
// const reportFile = './getTokenPrices.csv';
//
// fs.writeFileSync(reportFile, 'chain,symbol,priceUsd,address\n');
//
// describe('oracle service', async function () {
//   getAllOracles().map((config: TokenOracleConfig) =>
//     it(`can get token ${config.chain}:${config.token} price`, async function () {
//       const priceUsd = await oracle.getTokenPriceUsd({
//         chain: config.chain,
//         address: config.token,
//         timestamp: timestamp,
//       });
//
//       expect(priceUsd).not.equal(null);
//       expect(priceUsd).not.equal('0');
//
//       const token = await blockchain.getTokenInfo({
//         chain: config.chain,
//         address: config.token,
//       });
//       if (priceUsd && token) {
//         fs.appendFileSync(reportFile, `${config.chain},${token.symbol},${priceUsd},${config.token}\n`);
//       }
//     }),
//   );
// });
