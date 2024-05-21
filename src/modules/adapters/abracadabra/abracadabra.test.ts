// import { expect, test } from 'vitest';
//
// import { DefaultMemcacheTime } from '../../../configs';
// import { AbracadabraConfigs } from '../../../configs/protocols/abracadabra';
// import { getDateString } from '../../../lib/utils';
// import BlockchainService from '../../../services/blockchains/blockchain';
// import { MemcacheService } from '../../../services/caching/memcache';
// import DatabaseService from '../../../services/database/database';
// import OracleService from '../../../services/oracle/oracle';
// import AbracadabraAdapter from './abracadabra';
//
// const database = new DatabaseService();
// const memcache = new MemcacheService(DefaultMemcacheTime);
// const oracle = new OracleService();
// const blockchain = new BlockchainService();
//
// // const timestampArbitrum = 1631664000; // Wed Sep 15 2021 00:00:00 GMT+0000
// const timestampEthereum = 1711929600; // Mon Apr 01 2024 00:00:00 GMT+0000
//
// test(`should get data correctly at ${getDateString(timestampEthereum)} - MIM on ethereum`, async (t) => {
//   const adapter = new AbracadabraAdapter(
//     {
//       blockchain: blockchain,
//       oracle: oracle,
//     },
//     {
//       database: database,
//       memcache: memcache,
//     },
//     AbracadabraConfigs,
//   );
//
//   const assetData = await adapter.getLendingAssetDataState({
//     config: AbracadabraConfigs.configs[0],
//     timestamp: timestampEthereum,
//   });
//
//   expect(assetData).not.equal(null);
//   if (assetData) {
//     expect(assetData.tokenPrice).equal('1.012947569218846392');
//     expect(assetData.totalBorrowed).equal('35613395.294828953438236265');
//     expect(assetData.totalSupply).equal('181999311.199543963146813445');
//
//     expect(assetData.collaterals[0].token.address).equal('0x7da96a3891add058ada2e826306d812c638d87a7');
//     expect(assetData.collaterals[0].tokenPrice).equal('1.10844934815739087501');
//     expect(assetData.collaterals[0].totalBorrowed).equal('323024.98329970347169165');
//     expect(assetData.collaterals[0].totalDeposited).equal('449272.125351');
//     expect(assetData.collaterals[0].rateBorrow).equal('0.007994688458688');
//     expect(assetData.collaterals[0].rateBorrowFee).equal('0.0005');
//     expect(assetData.collaterals[0].rateLoanToValue).equal('0.9');
//   }
// });
//
// test('should get data correctly at birthday - MIM on ethereum', async (t) => {
//   const adapter = new AbracadabraAdapter(
//     {
//       blockchain: blockchain,
//       oracle: oracle,
//     },
//     {
//       database: database,
//       memcache: memcache,
//     },
//     AbracadabraConfigs,
//   );
//
//   const assetData = await adapter.getLendingAssetDataState({
//     config: AbracadabraConfigs.configs[0],
//     timestamp: AbracadabraConfigs.configs[0].birthday,
//   });
//
//   expect(assetData).not.equal(null);
//   if (assetData) {
//     expect(assetData.tokenPrice).equal('1.00065666798527655');
//     expect(assetData.totalBorrowed).equal('58411207.828133068440963052');
//   }
// });
//
// test('should get data correctly at birthday - MIM on arbitrum', async (t) => {
//   const adapter = new AbracadabraAdapter(
//     {
//       blockchain: blockchain,
//       oracle: oracle,
//     },
//     {
//       database: database,
//       memcache: memcache,
//     },
//     AbracadabraConfigs,
//   );
//
//   const assetData = await adapter.getLendingAssetDataState({
//     config: AbracadabraConfigs.configs[1],
//     timestamp: AbracadabraConfigs.configs[1].birthday,
//   });
//
//   expect(assetData).not.equal(null);
//   if (assetData) {
//     expect(assetData.tokenPrice).equal('1.002128147630042278');
//     expect(assetData.totalBorrowed).equal('0');
//     expect(assetData.collaterals[0].token.address).equal('0x82af49447d8a07e3bd95bd0d56f35241523fbab1');
//     expect(assetData.collaterals[0].tokenPrice).equal('3420.38146733070886191122');
//   }
// });
//
// test('should get data correctly at birthday - MIM on optimism', async (t) => {
//   const adapter = new AbracadabraAdapter(
//     {
//       blockchain: blockchain,
//       oracle: oracle,
//     },
//     {
//       database: database,
//       memcache: memcache,
//     },
//     AbracadabraConfigs,
//   );
//
//   const assetData = await adapter.getLendingAssetDataState({
//     config: AbracadabraConfigs.configs[2],
//     timestamp: AbracadabraConfigs.configs[2].birthday,
//   });
//
//   expect(assetData).not.equal(null);
//   if (assetData) {
//     expect(assetData.tokenPrice).equal('1.008293184126326245');
//     expect(assetData.totalBorrowed).equal('0');
//     expect(assetData.totalSupply).equal('19432739.321597790624928882');
//     expect(assetData.collaterals[0].address).equal('0x68f498c230015254aff0e1eb6f85da558dff2362');
//     expect(assetData.collaterals[0].tokenPrice).equal('1779599.54635143255249279715');
//   }
// });
//
// test('should get data correctly at birthday - MIM on avalanche', async (t) => {
//   const adapter = new AbracadabraAdapter(
//     {
//       blockchain: blockchain,
//       oracle: oracle,
//     },
//     {
//       database: database,
//       memcache: memcache,
//     },
//     AbracadabraConfigs,
//   );
//
//   const assetData = await adapter.getLendingAssetDataState({
//     config: AbracadabraConfigs.configs[3],
//     timestamp: AbracadabraConfigs.configs[3].birthday,
//   });
//
//   expect(assetData).not.equal(null);
//   if (assetData) {
//     expect(assetData.tokenPrice).equal('1.001837441917205622');
//     expect(assetData.totalBorrowed).equal('0');
//     expect(assetData.totalSupply).equal('5681631.908');
//     expect(assetData.collaterals[0].address).equal('0x3cfed0439ab822530b1ffbd19536d897ef30d2a2');
//     expect(assetData.collaterals[0].tokenPrice).equal('42.38102017890643616887');
//   }
// });
//
// test('should get data correctly at birthday - MIM on fantom', async (t) => {
//   const adapter = new AbracadabraAdapter(
//     {
//       blockchain: blockchain,
//       oracle: oracle,
//     },
//     {
//       database: database,
//       memcache: memcache,
//     },
//     AbracadabraConfigs,
//   );
//
//   const assetData = await adapter.getLendingAssetDataState({
//     config: AbracadabraConfigs.configs[4],
//     timestamp: AbracadabraConfigs.configs[4].birthday,
//   });
//
//   expect(assetData).not.equal(null);
//   if (assetData) {
//     expect(assetData.tokenPrice).equal('1.000953138895538328');
//     expect(assetData.totalBorrowed).equal('2263.387620121158924721');
//     expect(assetData.totalSupply).equal('5512940.47155');
//     expect(assetData.collaterals[0].address).equal('0x8e45af6743422e488afacdad842ce75a09eaed34');
//     expect(assetData.collaterals[0].tokenPrice).equal('0.25791008905599629664');
//   }
// });
//
// test('should get data correctly at birthday - MIM on bnbchain', async (t) => {
//   const adapter = new AbracadabraAdapter(
//     {
//       blockchain: blockchain,
//       oracle: oracle,
//     },
//     {
//       database: database,
//       memcache: memcache,
//     },
//     AbracadabraConfigs,
//   );
//
//   const assetData = await adapter.getLendingAssetDataState({
//     config: AbracadabraConfigs.configs[5],
//     timestamp: AbracadabraConfigs.configs[5].birthday,
//   });
//
//   expect(assetData).not.equal(null);
//   if (assetData) {
//     expect(assetData.tokenPrice).equal('1.003155953744908405');
//     expect(assetData.totalBorrowed).equal('0');
//     expect(assetData.totalSupply).equal('73156.263673216979314618');
//     expect(assetData.collaterals[0].address).equal('0x692cf15f80415d83e8c0e139cabcda67fcc12c90');
//     expect(assetData.collaterals[0].tokenPrice).equal('533.63153029399257567967');
//   }
// });
