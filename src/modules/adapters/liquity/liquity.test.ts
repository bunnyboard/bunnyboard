import { expect, test } from 'vitest';

import { DefaultMemcacheTime } from '../../../configs';
import { TimeUnits } from '../../../configs/constants';
import { LiquityConfigs } from '../../../configs/protocols/liquity';
import BlockchainService from '../../../services/blockchains/blockchain';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import OracleService from '../../../services/oracle/oracle';
import LiquityAdapter from './liquity';

const database = new DatabaseService();
const memcache = new MemcacheService(DefaultMemcacheTime);
const oracle = new OracleService();
const blockchain = new BlockchainService();

const timestamp = 1704240000; // Wed Jan 03 2024 00:00:00 GMT+0000

const liquityAdapter = new LiquityAdapter(
  {
    blockchain: blockchain,
    oracle: oracle,
  },
  {
    database: database,
    memcache: memcache,
  },
  LiquityConfigs,
);

test('should get state data correctly - liquity chain ethereum', async function () {
  for (const config of LiquityConfigs.configs) {
    const assetData = await liquityAdapter.getLendingAssetData({
      config: config,
      fromTime: timestamp - TimeUnits.SecondsPerDay,
      toTime: timestamp,
    });

    expect(assetData).not.equal(null);
    if (assetData && config.chain === 'ethereum') {
      expect(assetData.chain).equal('ethereum');
      expect(assetData.protocol).equal('liquity');
      expect(assetData.token.symbol).equal('LUSD');
      expect(assetData.tokenPrice).equal('0.99590622231989577419');
      expect(assetData.totalBorrowed).equal('176239346.77244703879448363');
      expect(assetData.totalSupply).equal('176239346.77244703879448363');
      expect(assetData.volumeBorrowed).equal('984795.306526581252191492');
      expect(assetData.volumeRepaid).equal('748145.764442248218734515');
      expect(assetData.feesPaid).equal('4562.367412826779664102');

      const ethCollateral = assetData.collaterals[0];
      expect(ethCollateral.token.symbol).equal('ETH');
      expect(ethCollateral.tokenPrice).equal('2350.6');
      expect(ethCollateral.totalBorrowed).equal('176239346.77244703879448363');
      expect(ethCollateral.totalDeposited).equal('317089.767024618363476336');
      expect(ethCollateral.volumeDeposited).equal('1018.521073085510762708');
      expect(ethCollateral.volumeWithdrawn).equal('708.48372804398418527');
      expect(ethCollateral.volumeLiquidated).equal('0');
      expect(ethCollateral.rateBorrow).equal('0');
      expect(ethCollateral.rateBorrowOpeningFee).equal('0.006901347066874394');
      expect(ethCollateral.rateLoanToValue).equal('0.9');
    }
  }
});
