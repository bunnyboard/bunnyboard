import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { TimeUnits } from '../../../configs/constants';
import { AaveConfigs } from '../../../configs/protocols/aave';
import { getDateString } from '../../../lib/utils';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import AaveAdapter from './aave';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const adapter = new AaveAdapter(
  {
    blockchain: blockchain,
    oracle: oracle,
  },
  {
    database: database,
    memcache: memcache,
  },
  AaveConfigs,
);

test('should get data correctly at birthday - aave staking', async function () {
  for (const config of AaveConfigs.configs) {
    const data = await adapter.getStakingDataTimeframe({
      config: config,
      fromTime: config.birthday,
      toTime: config.birthday + TimeUnits.SecondsPerDay,
    });

    expect(data).not.equal(null);
    if (data) {
      expect(data.length).equal(1);
    }
  }
});

const timestamp = 1714521600; // Wed May 01 2024 00:00:00 GMT+0000
test(`should get data correctly at ${getDateString(timestamp)} - aave staking`, async function () {
  for (const config of AaveConfigs.configs) {
    const data = await adapter.getStakingDataTimeframe({
      config: config,
      fromTime: timestamp,
      toTime: timestamp + TimeUnits.SecondsPerDay,
    });

    expect(data).not.equal(null);
    if (data) {
      expect(data.length).equal(1);

      const stakingData = data[0];
      if (stakingData.token.symbol === 'AAVE') {
        expect(stakingData.poolId).equal('stkAAVE');
        expect(stakingData.tokenPrice).equal('83.32273275192201211533');
        expect(stakingData.rewardTokenPrice).equal('83.32273275192201211533');
        expect(stakingData.totalSupply).equal('16000000');
        expect(stakingData.totalDeposited).equal('2747453.765557816471623216');
        expect(stakingData.rateReward).equal('0.04782610053251316217');
        expect(stakingData.volumeDeposited).equal('998.570408892988964367');
        expect(stakingData.volumeWithdrawn).equal('764.002202446182283413');
        expect(stakingData.volumeRewardDistributed).equal('109.729350564815179089');
        expect(stakingData.volumeRewardCollected).equal('143.787292742193300887');
      } else if (stakingData.token.symbol === 'ABPT') {
        expect(stakingData.poolId).equal('stkABPT');
        expect(stakingData.tokenPrice).equal('0.13003203974132378362');
        expect(stakingData.rewardTokenPrice).equal('83.32273275192201211533');
        expect(stakingData.totalSupply).equal('19239088.826174931543587037');
        expect(stakingData.totalDeposited).equal('18420101.935901496220187186');
        expect(stakingData.rateReward).equal('0');
        expect(stakingData.volumeDeposited).equal('0');
        expect(stakingData.volumeWithdrawn).equal('2975248.539368515992698322');
        expect(stakingData.volumeRewardDistributed).equal('188.469570205054631341');
        expect(stakingData.volumeRewardCollected).equal('0');
      } else if (stakingData.token.symbol === 'ABPTv2') {
        expect(stakingData.poolId).equal('stkABPTv2');
        expect(stakingData.tokenPrice).equal('145.72208471959575121548');
        expect(stakingData.rewardTokenPrice).equal('83.32273275192201211533');
        expect(stakingData.totalSupply).equal('721412.791198779559696423');
        expect(stakingData.totalDeposited).equal('718182.216431982671969839');
        expect(stakingData.rateReward).equal('0.10461617753306711701');
        expect(stakingData.volumeDeposited).equal('16.133205326003809429');
        expect(stakingData.volumeWithdrawn).equal('0');
        expect(stakingData.volumeRewardDistributed).equal('113.864134708219582823');
        expect(stakingData.volumeRewardCollected).equal('113.849540341023579401');
      } else if (stakingData.token.symbol === 'GHO') {
        expect(stakingData.poolId).equal('stkGHO');
        expect(stakingData.tokenPrice).equal('0.99618191');
        expect(stakingData.rewardTokenPrice).equal('83.32273275192201211533');
        expect(stakingData.totalSupply).equal('48998570.031811264712340205');
        expect(stakingData.totalDeposited).equal('23198778.861657593281070412');
        expect(stakingData.rateReward).equal('0.13159900133368322709');
        expect(stakingData.volumeDeposited).equal('324247.013130939140935858');
        expect(stakingData.volumeWithdrawn).equal('922.59242983322086771');
        expect(stakingData.volumeRewardDistributed).equal('73.348288040591881352');
        expect(stakingData.volumeRewardCollected).equal('54.016496113359424407');
      }
    }
  }
});
