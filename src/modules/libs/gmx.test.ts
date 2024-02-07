import { expect, test } from 'vitest';

import { ProtocolConfigs } from '../../configs';
import { AddressZero } from '../../configs/constants';
import { Gmxv2PerpetualMarketConfig } from '../../configs/protocols/gmx';
import GmxLibs from './gmx';

test('should get data correctly - gmxv2 arbitrum market list', async function () {
  const arbitrumPools = await GmxLibs.getMarketListV2(ProtocolConfigs.gmxv2.configs[0] as Gmxv2PerpetualMarketConfig);
  const avalanchePools = await GmxLibs.getMarketListV2(ProtocolConfigs.gmxv2.configs[1] as Gmxv2PerpetualMarketConfig);

  expect(arbitrumPools.length).greaterThan(0);
  expect(avalanchePools.length).greaterThan(0);

  for (const pool of arbitrumPools.concat(avalanchePools)) {
    expect(pool.indexToken.address).not.equal(AddressZero);
  }
});
