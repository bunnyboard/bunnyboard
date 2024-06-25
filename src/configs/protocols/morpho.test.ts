import { expect, test } from 'vitest';

import { OracleConfigs } from '../oracles/configs';
import { MorphoConfigs } from './morpho';

const ignores = ['0xcbfb9b444d9735c345df3a0f66cd89bd741692e9', '0xc982b228c7b1c49a7187216ce885f396904024f0'];

test('should have configs correctly', async () => {
  for (const config of MorphoConfigs.configs) {
    for (const market of config.markets) {
      if (ignores.indexOf(market.debtToken.address) === -1) {
        expect(market.debtToken).not.equal(undefined);
        expect(market.debtToken).not.equal(null);

        expect(
          OracleConfigs[market.debtToken.chain][market.debtToken.address],
          `token ${market.debtToken.chain}:${market.debtToken.address}`,
        ).not.equal(undefined);
        expect(
          OracleConfigs[market.debtToken.chain][market.debtToken.address],
          `token ${market.debtToken.chain}:${market.debtToken.address}`,
        ).not.equal(null);
      }
    }
  }
});
