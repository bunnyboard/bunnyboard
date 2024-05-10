import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { TimeUnits } from '../../../configs/constants';
import { SushiConfigs } from '../../../configs/protocols/sushi';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import { DataMetrics } from '../../../types/configs';
import SushiAdapter from './sushi';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const adapter = new SushiAdapter(
  {
    oracle,
    blockchain,
  },
  {
    database: database,
    memcache: memcache,
  },
  SushiConfigs,
);

// test('should get staking data correctly at birthday - sushi', async function () {
//   for (const config of SushiConfigs.configs) {
//     if (config.metric === DataMetrics.staking) {
//       const data = await adapter.getStakingDataTimeframe({
//         config: config,
//         fromTime: config.birthday,
//         toTime: config.birthday + TimeUnits.SecondsPerDay,
//       });
//
//       expect(data).not.equal(null);
//       if (data) {
//         const stakingData = data[0];
//
//         expect(stakingData.protocol).equal('sushi');
//         expect(stakingData.tokenPrice).equal('2.83461014968637850149');
//         expect(stakingData.rewardTokenPrice).equal('2.83461014968637850149');
//         expect(stakingData.totalSupply).equal('88702633.227777841768008159');
//         expect(stakingData.totalDeposited).equal('5795856.589573536680999581');
//         expect(stakingData.rateReward).equal('0');
//         expect(stakingData.volumeDeposited).equal('2100149.565523724121105162');
//         expect(stakingData.volumeWithdrawn).equal('1010756.745499970142614657');
//         expect(stakingData.volumeRewardDistributed).equal('0');
//         expect(stakingData.volumeRewardCollected).equal('0');
//       }
//     }
//   }
// });

const timestamp = 1715040000; // Tue May 07 2024 00:00:00 GMT+0000
test(`should get staking data correctly at ${timestamp} - sushi`, async function () {
  for (const config of SushiConfigs.configs) {
    if (config.metric === DataMetrics.staking) {
      const data = await adapter.getStakingDataTimeframe({
        config: config,
        fromTime: timestamp,
        toTime: timestamp + TimeUnits.SecondsPerDay,
      });

      expect(data).not.equal(null);
      if (data) {
        const stakingData = data[0];

        console.log(stakingData);

        expect(stakingData.protocol).equal('sushi');
        expect(stakingData.tokenPrice).equal('1.25559293636069633552');
        expect(stakingData.totalSupply).equal('250205911.901002845010395247');
        expect(stakingData.totalDeposited).equal('16983898.415793123658233163');
        expect(stakingData.rateReward).equal('0.05492705679594121404');
        expect(stakingData.volumeDeposited).equal('2653.286819719159164821');
        expect(stakingData.volumeWithdrawn).equal('2362.662248094086957715');
        expect(stakingData.volumeRewardDistributed).equal('67928.763971981875487096');
        expect(stakingData.volumeRewardCollected).equal('0');
      }
    }
  }
});
