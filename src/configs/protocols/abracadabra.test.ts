import { expect, test } from 'vitest';

import { OracleConfigs } from '../oracles/configs';
import { AbracadabraConfigs } from './abracadabra';

test('should have configs correctly', async () => {
  for (const config of AbracadabraConfigs.configs) {
    expect(config.debtToken).not.equal(undefined);
    expect(config.debtToken).not.equal(null);
    expect(
      OracleConfigs[config.debtToken.chain][config.debtToken.address],
      `token ${config.debtToken.chain}:${config.debtToken.address}`,
    ).not.equal(undefined);
    expect(
      OracleConfigs[config.debtToken.chain][config.debtToken.address],
      `token ${config.debtToken.chain}:${config.debtToken.address}`,
    ).not.equal(null);

    for (const cauldron of config.cauldrons) {
      expect(cauldron.collateralToken, `cauldron ${cauldron.chain}:${cauldron.address}`).not.equal(undefined);
      expect(cauldron.collateralToken, `cauldron ${cauldron.chain}:${cauldron.address}`).not.equal(null);
    }
  }
});
