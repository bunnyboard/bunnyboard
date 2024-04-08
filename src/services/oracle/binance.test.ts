import { expect, test } from 'vitest';

import { OffchainOracleSourcesFromBinance } from '../../configs/oracles/binance';
import { getTokenPriceFromBinance } from './binance';

test('should get token price from binance correctly', async function () {
  const timestamp = 1572566400;
  const ethPrice = await getTokenPriceFromBinance(OffchainOracleSourcesFromBinance.ETH, timestamp);
  expect(ethPrice).equal('182.19000000');
});
