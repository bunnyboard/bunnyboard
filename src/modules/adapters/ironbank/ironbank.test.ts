import { expect, test } from 'vitest';

import { OracleConfigs } from '../../../configs/oracles/configs';
import { CompoundLendingMarketConfig } from '../../../configs/protocols/compound';
import { IronbankConfigs } from '../../../configs/protocols/ironbank';
import CompoundLibs from '../../libs/compound';

test('should have oracle configs for reserves correctly - ironbank', async function () {
  for (const marketConfig of IronbankConfigs.configs) {
    const cTokens = await CompoundLibs.getComptrollerInfo(marketConfig as CompoundLendingMarketConfig);

    for (const cToken of cTokens) {
      if (!marketConfig.blacklists || !marketConfig.blacklists[cToken.underlying.address]) {
        expect(
          OracleConfigs[cToken.underlying.chain][cToken.underlying.address],
          `${cToken.underlying.chain}:${cToken.underlying.address}`,
        ).not.equal(null);
        expect(
          OracleConfigs[cToken.underlying.chain][cToken.underlying.address],
          `${cToken.underlying.chain}:${cToken.underlying.address}`,
        ).not.equal(undefined);
      }
    }
  }
});
