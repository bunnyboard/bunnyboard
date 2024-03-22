import { expect, test } from 'vitest';

import { DexConfigs, TokenListBase } from '../../configs';
import UniswapLibs, { UniswapLiquidityPoolBalance } from './uniswap';

const blockNumber = 19490072; // Mar-22-2024 12:09:47 PM +UTC

test('should get data liquidity pool correctly - DAI - ethereum', async function () {
  const pools: Array<UniswapLiquidityPoolBalance> = await UniswapLibs.getLiquidityPoolForToken({
    dexConfig: DexConfigs.ethereum.uniswapv2,
    token: TokenListBase.ethereum.DAI,
    blockNumber: blockNumber,
  });

  expect(pools.length).equal(3);
  expect(pools[0].tokens[0].symbol).equal('DAI');
  expect(pools[0].tokens[1].symbol).equal('WETH');
  expect(pools[0].balances[0]).equal('7570355.244691229425993286');
  expect(pools[0].balances[1]).equal('2216.499025916051580191');
});
