import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { TimeUnits } from '../../../configs/constants';
import { YethConfigs } from '../../../configs/protocols/yearn';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import { DataMetrics } from '../../../types/configs';
import YethAdapter from './yeth';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const adapter = new YethAdapter(
  {
    oracle,
    blockchain,
  },
  {
    database: database,
    memcache: memcache,
  },
  YethConfigs,
);

// test('should get staking data correctly at birthday - yeth', async function () {
//   for (const config of YethConfigs.configs) {
//     if (config.metric === DataMetrics.staking) {
//       const data = await adapter.getStakingDataTimeframe({
//         config: config,
//         fromTime: config.birthday,
//         toTime: config.birthday + TimeUnits.SecondsPerDay,
//       });
//
//       console.log(data);
//
//       expect(data).not.equal(null);
//       if (data) {
//         // const stakingData = data[0];
//         //
//         // expect(stakingData.protocol).equal('sushi');
//         // expect(stakingData.tokenPrice).equal('2.83461014968637850149');
//         // expect(stakingData.rewardTokenPrice).equal('2.83461014968637850149');
//         // expect(stakingData.totalSupply).equal('88702633.227777841768008159');
//         // expect(stakingData.totalDeposited).equal('5795856.589573536680999581');
//         // expect(stakingData.rateReward).equal('0');
//         // expect(stakingData.volumeDeposited).equal('2100149.565523724121105162');
//         // expect(stakingData.volumeWithdrawn).equal('1010756.745499970142614657');
//         // expect(stakingData.volumeRewardDistributed).equal('0');
//         // expect(stakingData.volumeRewardCollected).equal('0');
//       }
//     }
//   }
// });

const timestamp = 1715040000; // Tue May 07 2024 00:00:00 GMT+0000
const totalDeposited = [
  '965.36283352269800554',
  '850.650148237964576587',
  '589.621929916222487084',
  '502.011378098140949576',
  '395.579194586613657795',
  '1402.65926305060987488',
  '411.158585940139616185',
  '237.903432790397354158',
];
test(`should get staking data correctly at ${timestamp} - yeth`, async function () {
  for (const config of YethConfigs.configs) {
    if (config.metric === DataMetrics.staking) {
      const data = await adapter.getStakingDataTimeframe({
        config: config,
        fromTime: timestamp,
        toTime: timestamp + TimeUnits.SecondsPerDay,
      });

      expect(data).not.equal(null);
      if (data) {
        const rateReward = data[0].rateReward;

        for (const item of data) {
          expect(item.protocol).equal('yeth');

          expect(item.tokenPrice).not.equal(null);
          expect(item.tokenPrice).not.equal('0');

          // the same reward rate
          expect(item.rateReward).equal(rateReward);
          expect(item.totalDeposited).equal(totalDeposited[data.indexOf(item)]);
        }
      }
    }
  }
});
