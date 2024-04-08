// import { expect, test } from 'vitest';
//
// import { DefaultMemcacheTime, ProtocolConfigs } from '../../../configs';
// import { MakerConfigs } from '../../../configs/protocols/maker';
// import { getDateString } from '../../../lib/utils';
// import BlockchainService from '../../../services/blockchains/blockchain';
// import { MemcacheService } from '../../../services/caching/memcache';
// import DatabaseService from '../../../services/database/database';
// import OracleService from '../../../services/oracle/oracle';
// import MakerAdapter from './maker';
//
// const database = new DatabaseService();
// const memcache = new MemcacheService(DefaultMemcacheTime);
// const oracle = new OracleService();
// const blockchain = new BlockchainService();
//
// const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000
//
// const makerAdapter = new MakerAdapter(
//   {
//     blockchain: blockchain,
//     oracle: oracle,
//   },
//   {
//     database: database,
//     memcache: memcache,
//   },
//   MakerConfigs,
// );
//
// const configEthereum = ProtocolConfigs.maker.configs.filter((item) => item.chain === 'ethereum')[0];
//
// test('should get state data correctly at birthday - maker chain ethereum', async function () {
//   const dataState = await makerAdapter.getLendingAssetDataState({
//     config: configEthereum,
//     timestamp: configEthereum.birthday,
//   });
//
//   // because there is no collateral is available
//   // we got null state
//   expect(dataState).equal(null);
// });
//
// test(`should get state data correctly at ${getDateString(timestamp)} - maker chain ethereum`, async function () {
//   const dataState = await makerAdapter.getLendingAssetDataState({
//     config: configEthereum,
//     timestamp: timestamp,
//   });
//
//   expect(dataState).not.equal(undefined);
//   if (dataState) {
//     expect(dataState.tokenPrice).equal('0.99987297');
//     expect(dataState.totalBorrowed).equal('5286041331.8292899703329106007');
//     expect(dataState.collaterals.length).equal(27);
//   }
// });
