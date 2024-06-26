// import { expect, test } from 'vitest';
//
// import { DefaultMemcacheTime } from '../../../configs';
// import { TimeUnits } from '../../../configs/constants';
// import { Uniswapv2Configs, Uniswapv2EthereumDexConfig } from '../../../configs/protocols/uniswap';
// import { getDateString } from '../../../lib/utils';
// import BlockchainService from '../../../services/blockchains/blockchain';
// import { MemcacheService } from '../../../services/caching/memcache';
// import DatabaseService from '../../../services/database/database';
// import OracleService from '../../../services/oracle/oracle';
// import Uniswapv2Adapter from './uniswapv2';
//
// const database = new DatabaseService();
// const memcache = new MemcacheService(DefaultMemcacheTime);
// const oracle = new OracleService();
// const blockchain = new BlockchainService();
//
// const fromTime = 1590969600; // Mon Jun 01 2020 00:00:00 GMT+0000
// const toTime = 1591056000; // Tue Jun 02 2020 00:00:00 GMT+0000
//
// test('should get dex correctly at birthday - uniswapv2 - ethereum', async function () {
//   const adapter = new Uniswapv2Adapter(
//     {
//       oracle,
//       blockchain,
//     },
//     {
//       database: database,
//       memcache: memcache,
//     },
//     Uniswapv2Configs,
//   );
//
//   const dexData = await adapter.getDexDataTimeframe({
//     config: Uniswapv2EthereumDexConfig,
//     fromTime: Uniswapv2EthereumDexConfig.birthday,
//     toTime: Uniswapv2EthereumDexConfig.birthday + TimeUnits.SecondsPerDay,
//     props: {
//       disableGetEvents: true,
//     },
//   });
//
//   expect(dexData).not.equal(null);
//   if (dexData) {
//     expect(dexData.protocol).equal('uniswapv2');
//     expect(dexData.totalLiquidityUsd).equal('23890083.5096110076151830692203312');
//     expect(dexData.feesTradingUsd).equal('6309.47233542288049176908');
//     expect(dexData.volumeTradingUsd).equal('2103157.44514096016392302546');
//     expect(dexData.numberOfTransactions).equal(7998);
//   }
// });
//
// test(`should get dex correctly at ${getDateString(fromTime)} - uniswapv2 - ethereum`, async function () {
//   const adapter = new Uniswapv2Adapter(
//     {
//       oracle,
//       blockchain,
//     },
//     {
//       database: database,
//       memcache: memcache,
//     },
//     Uniswapv2Configs,
//   );
//
//   const dexDataState = await adapter.getDexDataState({
//     config: Uniswapv2EthereumDexConfig,
//     timestamp: fromTime,
//   });
//
//   const dexDataTimeframe = await adapter.getDexDataTimeframe({
//     config: Uniswapv2EthereumDexConfig,
//     fromTime: fromTime,
//     toTime: toTime,
//   });
//
//   expect(dexDataState).not.equal(null);
//   expect(dexDataTimeframe).not.equal(null);
//
//   if (dexDataState && dexDataTimeframe) {
//     expect(dexDataState.totalLiquidityUsd).equal('21965164.51289245023160291925431319');
//
//     expect(dexDataTimeframe.protocol).equal('uniswapv2');
//     expect(dexDataTimeframe.totalLiquidityUsd).equal('23890083.5096110076151830692203312');
//     expect(dexDataTimeframe.feesTradingUsd).equal('6309.47233542288049176908');
//     expect(dexDataTimeframe.volumeTradingUsd).equal('2103157.44514096016392302546');
//     expect(dexDataTimeframe.numberOfTransactions).equal(7998);
//   }
// });
