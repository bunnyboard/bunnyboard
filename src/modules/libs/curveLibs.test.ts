import { expect, test } from 'vitest';

import { OracleSourceCustomList } from '../../configs/oracles/custom';
import { OracleSourceCurveMetaPool } from '../../types/oracles';
import CurveLibs from './curve';

test('should get token price from curve meta pool correctly', async function () {
  const blockNumber = 19117180;
  const mimPrice = await CurveLibs.getMetaPoolPrice({
    config: OracleSourceCustomList.MIM_METAPOOL as OracleSourceCurveMetaPool,
    blockNumber: blockNumber,
  });

  console.log(mimPrice);

  expect(mimPrice).equal('1.012242867637683961');
});
