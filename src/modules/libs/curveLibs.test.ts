import { expect, test } from 'vitest';

import CurveLibs from './curve';
import { OracleSourceCurveList } from '../../configs/oracles/curve';

test('should get token price from curve meta pool correctly', async function () {
  const blockNumber = 20232154;
  for (const config of Object.values(OracleSourceCurveList)) {
    const price = await CurveLibs.getCurvePoolPrice({
      config: config,
      blockNumber: blockNumber,
    });

    expect(price).not.equal(null);
    expect(price).not.equal('0');
  }
});
